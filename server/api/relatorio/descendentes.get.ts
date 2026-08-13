import { db } from '../../utils/drizzle'
import { pessoa, relacao, local } from '../../db/schema'
import { Document, Paragraph, TextRun, Packer, AlignmentType } from 'docx'

interface PessoaRow {
  id: number; nome: string; sobrenome: string; sexo: string | null
  datanasc: string | null; localnasc: number | null
  databatismo: string | null; localbatismo: number | null
  datamorte: string | null; localmorte: number | null; obs: string | null
}

interface NoDescendente {
  pessoa: PessoaRow
  conjuges: PessoaRow[]
  filhos: NoDescendente[]
  notacao: string
}

function formatarData(d: string | null): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function notacaoFilho(pai: string, i: number): string {
  return `${pai}.${i}`
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const raizId = Number(query.id)
  if (!raizId) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const todasPessoas  = await db.select().from(pessoa)
  const todasRelacoes = await db.select().from(relacao)
  const todosLocais   = await db.select().from(local)

  const pessoaMap = new Map(todasPessoas.map(p => [p.id, p as PessoaRow]))
  const localMap  = new Map(todosLocais.map(l => [l.id, l]))

  // paisMap[id] = Set de IDs de pais; filhosMap[id] = Set de IDs de filhos
  const paisMap    = new Map<number, Set<number>>()
  const filhosMap  = new Map<number, Set<number>>()
  const conjugesMap = new Map<number, Set<number>>()

  for (const r of todasRelacoes) {
    if (r.rel === 1) {
      // p1 é filho de p2
      if (!paisMap.has(r.p1))   paisMap.set(r.p1, new Set())
      paisMap.get(r.p1)!.add(r.p2)
      if (!filhosMap.has(r.p2)) filhosMap.set(r.p2, new Set())
      filhosMap.get(r.p2)!.add(r.p1)
    } else if (r.rel === 3) {
      // p1 é pai de p2
      if (!paisMap.has(r.p2))   paisMap.set(r.p2, new Set())
      paisMap.get(r.p2)!.add(r.p1)
      if (!filhosMap.has(r.p1)) filhosMap.set(r.p1, new Set())
      filhosMap.get(r.p1)!.add(r.p2)
    } else if (r.rel === 2) {
      if (!conjugesMap.has(r.p1)) conjugesMap.set(r.p1, new Set())
      conjugesMap.get(r.p1)!.add(r.p2)
      if (!conjugesMap.has(r.p2)) conjugesMap.set(r.p2, new Set())
      conjugesMap.get(r.p2)!.add(r.p1)
    }
  }

  function construirArvore(id: number, notacao: string, visitados: Set<number>): NoDescendente | null {
    if (visitados.has(id)) return null
    const p = pessoaMap.get(id)
    if (!p) return null
    const novosVisitados = new Set(visitados)
    novosVisitados.add(id)
    const conjuges = [...(conjugesMap.get(id) ?? [])].map(cid => pessoaMap.get(cid)).filter(Boolean) as PessoaRow[]
    const filhoIds  = [...(filhosMap.get(id) ?? [])]
    const filhos: NoDescendente[] = []
    let i = 1
    for (const fid of filhoIds) {
      const no = construirArvore(fid, notacaoFilho(notacao, i), novosVisitados)
      if (no) { filhos.push(no); i++ }
    }
    return { pessoa: p, conjuges, filhos, notacao }
  }

  const raiz = pessoaMap.get(raizId)
  if (!raiz) throw createError({ statusCode: 404, statusMessage: 'Pessoa não encontrada' })
  const arvore = construirArvore(raizId, '1', new Set())
  if (!arvore) throw createError({ statusCode: 404, statusMessage: 'Erro ao montar árvore' })

  // ── Helpers de texto ─────────────────────────────────────────────

  function localStr(id: number | null): string {
    if (!id) return ''
    const l = localMap.get(id)
    if (!l) return ''
    return l.estado ? `${l.descricao} - ${l.estado}` : l.descricao
  }

  function gen(sexo: string | null, m: string, f: string): string {
    return sexo === 'M' ? m : sexo === 'F' ? f : `${m}(a)`
  }

  function eventoStr(verbo: string, data: string | null, localId: number | null): string {
    const bits: string[] = [verbo]
    if (data) bits.push(`em ${formatarData(data)}`)
    const loc = localStr(localId)
    if (loc) bits.push(`em ${loc}`)
    return bits.join(' ')
  }

  function prosePessoa(no: NoDescendente): { bold: string; normal: string } {
    const p   = no.pessoa
    const sx  = p.sexo

    // ── Nome em negrito ──
    const bold = `${no.notacao}. ${p.sobrenome}, ${p.nome}`

    // ── Texto corrido ──
    const clausulas: string[] = []

    // Filiação
    const paiIds = [...(paisMap.get(p.id) ?? [])]
    const paiPessoas = paiIds.map(pid => pessoaMap.get(pid)).filter(Boolean) as PessoaRow[]
    if (paiPessoas.length) {
      const termo = gen(sx, 'filho', 'filha')
      const nomes = paiPessoas.map(pp => `${pp.nome} ${pp.sobrenome}`).join(' e ')
      clausulas.push(`${termo} de ${nomes}`)
    }

    // Nascimento
    if (p.datanasc || p.localnasc) {
      clausulas.push(eventoStr(gen(sx, 'nascido', 'nascida'), p.datanasc, p.localnasc))
    }

    // Batismo
    if (p.databatismo || p.localbatismo) {
      clausulas.push(eventoStr(gen(sx, 'batizado', 'batizada'), p.databatismo, p.localbatismo))
    }

    // Óbito
    if (p.datamorte || p.localmorte) {
      clausulas.push(eventoStr(gen(sx, 'falecido', 'falecida'), p.datamorte, p.localmorte))
    }

    let normal = clausulas.length ? ', ' + clausulas.join('; ') + '.' : '.'

    // Casamento(s)
    for (const c of no.conjuges) {
      const verboCas = gen(sx, 'Casado', 'Casada')
      let cas = ` ${verboCas} com ${c.sobrenome}, ${c.nome}`
      const cBits: string[] = []
      if (c.datanasc) cBits.push(eventoStr(gen(c.sexo, 'nascido', 'nascida'), c.datanasc, c.localnasc))
      if (c.datamorte) cBits.push(eventoStr(gen(c.sexo, 'falecido', 'falecida'), c.datamorte, c.localmorte))
      if (cBits.length) cas += ` (${cBits.join('; ')})`
      cas += '.'
      normal += cas
    }

    // Observações
    if (p.obs?.trim()) {
      normal += ` Observações: ${p.obs.trim()}.`
    }

    return { bold, normal }
  }

  // ── Montar parágrafos ────────────────────────────────────────────

  const paragrafos: Paragraph[] = []

  function adicionarNo(no: NoDescendente): void {
    const prof  = no.notacao.split('.').length - 1
    const recuo = prof * 560
    const { bold, normal } = prosePessoa(no)

    paragrafos.push(new Paragraph({
      indent:  { left: recuo, hanging: 0 },
      spacing: { before: prof === 0 ? 0 : 240, after: 80 },
      children: [
        new TextRun({ text: bold,   bold: true,  size: 24, font: 'Calibri' }),
        new TextRun({ text: normal, bold: false, size: 24, font: 'Calibri' }),
      ],
    }))

    for (const filho of no.filhos) adicionarNo(filho)
  }

  // Título
  const hoje = new Date().toLocaleDateString('pt-BR')
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: `Descendentes de ${raiz.nome} ${raiz.sobrenome}`, bold: true, size: 40, font: 'Calibri' })],
  }))
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 720 },
    children: [new TextRun({ text: `Gerado em ${hoje}`, size: 20, color: '888888', font: 'Calibri' })],
  }))

  adicionarNo(arvore)

  const doc = new Document({
    sections: [{ properties: {}, children: paragrafos }],
  })

  const buffer = await Packer.toBuffer(doc)
  const nomeArquivo = `descendentes_${raiz.sobrenome}_${raiz.nome}.docx`
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '_')

  setResponseHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${nomeArquivo}"`)
  return buffer
})
