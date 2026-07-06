import { db } from '../../utils/drizzle'
import { pessoa, relacao, local } from '../../db/schema'
import { sql } from 'drizzle-orm'
import { Document, Paragraph, TextRun, Packer, AlignmentType, BorderStyle } from 'docx'

interface PessoaRow {
  id: number; nome: string; sobrenome: string; sexo: string | null
  datanasc: string | null; localnasc: number | null
  databatismo: string | null; localbatismo: number | null
  datamorte: string | null; localmorte: number | null; obs: string | null
}

function formatarData(d: string | null): string {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function gen(sexo: string | null, m: string, f: string): string {
  return sexo === 'M' ? m : sexo === 'F' ? f : `${m}(a)`
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id1 = Number(query.id1)
  const id2 = Number(query.id2)
  if (!id1 || !id2) throw createError({ statusCode: 400, statusMessage: 'id1 e id2 obrigatórios' })

  // Caminho via stored procedure
  const pathResult = await db.execute(
    sql`SELECT * FROM parse_twopoint(${id1}::int, ${id2}::int)`
  )
  const pathPessoas  = pathResult.rows[0]?.info as any[]
  const pathRelacoes = pathResult.rows[0]?.o_link_rel as number[]

  if (!pathPessoas?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Nenhum caminho encontrado entre as duas pessoas' })
  }

  // Dados completos
  const todasPessoas  = await db.select().from(pessoa)
  const todasRelacoes = await db.select().from(relacao)
  const todosLocais   = await db.select().from(local)

  const pessoaMap = new Map(todasPessoas.map(p => [p.id, p as PessoaRow]))
  const localMap  = new Map(todosLocais.map(l => [l.id, l]))

  const paisMap    = new Map<number, Set<number>>()
  const conjugesMap = new Map<number, Set<number>>()

  for (const r of todasRelacoes) {
    if (r.rel === 1) {
      if (!paisMap.has(r.p1)) paisMap.set(r.p1, new Set())
      paisMap.get(r.p1)!.add(r.p2)
    } else if (r.rel === 3) {
      if (!paisMap.has(r.p2)) paisMap.set(r.p2, new Set())
      paisMap.get(r.p2)!.add(r.p1)
    } else if (r.rel === 2) {
      if (!conjugesMap.has(r.p1)) conjugesMap.set(r.p1, new Set())
      conjugesMap.get(r.p1)!.add(r.p2)
      if (!conjugesMap.has(r.p2)) conjugesMap.set(r.p2, new Set())
      conjugesMap.get(r.p2)!.add(r.p1)
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────

  function localStr(id: number | null): string {
    if (!id) return ''
    const l = localMap.get(id)
    if (!l) return ''
    return l.estado ? `${l.descricao} - ${l.estado}` : l.descricao
  }

  function eventoStr(verbo: string, data: string | null, localId: number | null): string {
    const bits = [verbo]
    if (data) bits.push(`em ${formatarData(data)}`)
    const loc = localStr(localId)
    if (loc) bits.push(`em ${loc}`)
    return bits.join(' ')
  }

  function prosePessoa(p: PessoaRow, numero: number): { bold: string; normal: string } {
    const sx = p.sexo
    const clausulas: string[] = []

    // Filiação
    const paiIds = [...(paisMap.get(p.id) ?? [])]
    const paiPessoas = paiIds.map(pid => pessoaMap.get(pid)).filter(Boolean) as PessoaRow[]
    if (paiPessoas.length) {
      const termo = gen(sx, 'filho', 'filha')
      const nomes = paiPessoas.map(pp => `${pp.nome} ${pp.sobrenome}`).join(' e ')
      clausulas.push(`${termo} de ${nomes}`)
    }

    if (p.datanasc || p.localnasc)
      clausulas.push(eventoStr(gen(sx, 'nascido', 'nascida'), p.datanasc, p.localnasc))
    if (p.databatismo || p.localbatismo)
      clausulas.push(eventoStr(gen(sx, 'batizado', 'batizada'), p.databatismo, p.localbatismo))
    if (p.datamorte || p.localmorte)
      clausulas.push(eventoStr(gen(sx, 'falecido', 'falecida'), p.datamorte, p.localmorte))

    let normal = clausulas.length ? ', ' + clausulas.join('; ') + '.' : '.'

    // Cônjuges (todos os registrados, não apenas os do caminho)
    const conjIds = [...(conjugesMap.get(p.id) ?? [])]
    for (const cid of conjIds) {
      const c = pessoaMap.get(cid)
      if (!c) continue
      const verboCas = gen(sx, 'Casado', 'Casada')
      let cas = ` ${verboCas} com ${c.sobrenome}, ${c.nome}`
      const cBits: string[] = []
      if (c.datanasc) cBits.push(eventoStr(gen(c.sexo, 'nascido', 'nascida'), c.datanasc, c.localnasc))
      if (c.datamorte) cBits.push(eventoStr(gen(c.sexo, 'falecido', 'falecida'), c.datamorte, c.localmorte))
      if (cBits.length) cas += ` (${cBits.join('; ')})`
      cas += '.'
      normal += cas
    }

    if (p.obs?.trim()) normal += ` Observações: ${p.obs.trim()}.`

    return { bold: `${numero}. ${p.sobrenome}, ${p.nome}`, normal }
  }

  function relacaoTexto(relCode: number, de: PessoaRow, para: PessoaRow): string {
    switch (relCode) {
      case 3: return `${gen(de.sexo, 'pai', 'mãe')} de ${para.nome} ${para.sobrenome} (item ${pathPessoas.findIndex(pp => pp.id === para.id) + 1})`
      case 1: return `${gen(de.sexo, 'filho', 'filha')} de ${para.nome} ${para.sobrenome} (item ${pathPessoas.findIndex(pp => pp.id === para.id) + 1})`
      case 2: return `cônjuge de ${para.nome} ${para.sobrenome} (item ${pathPessoas.findIndex(pp => pp.id === para.id) + 1})`
      default: return ''
    }
  }

  // ── Montar DOCX ──────────────────────────────────────────────────

  const paragrafos: Paragraph[] = []
  const p1Full = pessoaMap.get(id1)
  const p2Full = pessoaMap.get(id2)

  // Cabeçalho
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'COMPROVAÇÃO DE ANCESTRALIDADE', bold: true, size: 36, font: 'Calibri', allCaps: true })],
  }))
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'Linha de Parentesco', bold: true, size: 28, font: 'Calibri' })],
  }))
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({
      text: `${p1Full ? p1Full.nome + ' ' + p1Full.sobrenome : 'Pessoa 1'} → ${p2Full ? p2Full.nome + ' ' + p2Full.sobrenome : 'Pessoa 2'}`,
      bold: true, size: 26, font: 'Calibri',
    })],
  }))
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: `Gerado em ${new Date().toLocaleDateString('pt-BR')}`, size: 20, color: '888888', font: 'Calibri' })],
  }))

  // Parágrafo introdutório
  const nElos = pathPessoas.length
  paragrafos.push(new Paragraph({
    spacing: { after: 480 },
    children: [new TextRun({
      text: `O presente documento estabelece a linha de parentesco entre ${p1Full ? p1Full.nome + ' ' + p1Full.sobrenome : 'a primeira pessoa selecionada'} e ${p2Full ? p2Full.nome + ' ' + p2Full.sobrenome : 'a segunda pessoa selecionada'}, composta por ${nElos} ${nElos === 1 ? 'pessoa' : 'pessoas'}, conforme os registros genealógicos disponíveis no sistema.`,
      size: 22, font: 'Calibri',
    })],
  }))

  // Linha divisória
  paragrafos.push(new Paragraph({
    spacing: { after: 400 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '444444' } },
    children: [],
  }))

  // Pessoas do caminho
  for (let i = 0; i < pathPessoas.length; i++) {
    const pp = pathPessoas[i]
    const pessoaFull = pessoaMap.get(pp.id)
    if (!pessoaFull) continue

    const { bold, normal } = prosePessoa(pessoaFull, i + 1)

    paragrafos.push(new Paragraph({
      spacing: { before: i === 0 ? 0 : 0, after: 120 },
      children: [
        new TextRun({ text: bold,   bold: true,  size: 24, font: 'Calibri' }),
        new TextRun({ text: normal, bold: false, size: 24, font: 'Calibri' }),
      ],
    }))

    // Conector para a próxima pessoa
    if (i < pathPessoas.length - 1) {
      const relCode  = pathRelacoes[i]
      const proxFull = pessoaMap.get(pathPessoas[i + 1].id)

      if (proxFull && relCode !== 5 && relCode !== 6) {
        const txtConector = relacaoTexto(relCode, pessoaFull, proxFull)
        if (txtConector) {
          paragrafos.push(new Paragraph({
            indent: { left: 720 },
            spacing: { before: 80, after: 280 },
            children: [
              new TextRun({ text: '↓  ', bold: true, size: 20, color: '555555', font: 'Calibri' }),
              new TextRun({ text: txtConector, size: 20, color: '555555', italics: true, font: 'Calibri' }),
            ],
          }))
        }
      }
    }
  }

  // Rodapé
  paragrafos.push(new Paragraph({
    spacing: { before: 600 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: '444444' } },
    children: [],
  }))
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [new TextRun({ text: `Fim da linha de parentesco — ${pathPessoas.length} pessoa(s) — CPG Sistema de Genealogia`, size: 18, color: '888888', font: 'Calibri' })],
  }))

  const doc = new Document({ sections: [{ properties: {}, children: paragrafos }] })
  const buffer = await Packer.toBuffer(doc)

  const n1 = p1Full ? `${p1Full.sobrenome}_${p1Full.nome}` : 'p1'
  const n2 = p2Full ? `${p2Full.sobrenome}_${p2Full.nome}` : 'p2'
  const nomeArquivo = `parentesco_${n1}_a_${n2}.docx`
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '_')

  setResponseHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${nomeArquivo}"`)
  return buffer
})
