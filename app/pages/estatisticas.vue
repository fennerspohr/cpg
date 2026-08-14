<template>
  <div class="h-full flex flex-col font-sans bg-win-bg overflow-hidden">

    <!-- Barra de título -->
    <div class="flex-none flex items-center justify-between bg-primary border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-1 m-2 mb-0">
      <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
        <Icon name="lucide:bar-chart-2" class="text-sm" />
        Estatísticas — Centro de Pesquisas Genealógicas de Nova Palma
      </h2>
      <button type="button" @click="refresh()" title="Atualizar"
        class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 p-0.5 w-5 h-5 flex items-center justify-center hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white">
        <Icon name="lucide:refresh-cw" class="text-[11px] text-black" :class="{ 'animate-spin': pending }" />
      </button>
    </div>

    <div v-if="pending" class="flex-1 flex items-center justify-center">
      <p class="text-xs uppercase animate-pulse text-win-text tracking-widest">Carregando estatísticas...</p>
    </div>

    <template v-else-if="d">
      <div class="flex-1 overflow-y-auto p-2 flex flex-col gap-2">

        <!-- ── Linha 1: Cards de resumo ─────────────────────────────────── -->
        <div class="grid grid-cols-5 gap-2">
          <div v-for="c in cards" :key="c.label"
            class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-2 flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <Icon :name="c.icon" class="text-sm" :class="c.cls" />
              <span class="text-[8px] font-bold uppercase text-win-muted-dark tracking-wide leading-tight">{{ c.label }}</span>
            </div>
            <p class="text-3xl font-bold text-black leading-none mt-0.5">{{ c.valor }}</p>
            <p class="text-[9px] text-win-dim">{{ c.sub }}</p>
          </div>
        </div>

        <!-- ── Linha 2: Sexo | Cobertura+Recordes | Mais conectados ────────── -->
        <div class="grid grid-cols-3 gap-2">

          <!-- Distribuição por sexo -->
          <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 pt-1 pb-3 flex flex-col gap-2">
            <legend class="text-[9px] font-bold px-1 uppercase text-win-text">Distribuição por Sexo</legend>
            <div class="flex justify-center mt-1">
              <svg viewBox="0 0 80 80" class="w-20 h-20">
                <template v-for="(s, i) in pizzaSlices" :key="i">
                  <path :d="s.path" :fill="s.cor" stroke="white" stroke-width="1" />
                </template>
                <circle cx="40" cy="40" r="18" fill="#d4d0c8" />
                <text x="40" y="43" text-anchor="middle" font-size="9" font-weight="bold" fill="#202020">{{ d.totalPessoas }}</text>
              </svg>
            </div>
            <div class="flex flex-col gap-1.5">
              <div v-for="s in sexoFmt" :key="s.label" class="flex flex-col gap-0.5">
                <div class="flex justify-between">
                  <div class="flex items-center gap-1">
                    <div class="w-2.5 h-2.5 border border-base-300" :style="{ backgroundColor: s.cor }" />
                    <span class="text-[9px] font-bold uppercase">{{ s.label }}</span>
                  </div>
                  <span class="text-[9px] font-mono font-bold">{{ s.total }} <span class="text-base-300 font-normal">({{ s.pct }}%)</span></span>
                </div>
                <div class="h-2 bg-white border border-base-300 overflow-hidden">
                  <div class="h-full" :style="{ width: s.pct + '%', backgroundColor: s.cor }" />
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Cobertura + Recordes empilhados -->
          <div class="flex flex-col gap-2">
            <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 pt-1 pb-2">
              <legend class="text-[9px] font-bold px-1 uppercase text-win-text">Cobertura de Dados</legend>
              <div class="flex flex-col gap-1 mt-1">
                <div v-for="cv in coberturaFmt" :key="cv.label" class="flex items-center gap-2">
                  <span class="text-[9px] text-win-muted-dark w-20 shrink-0">{{ cv.label }}</span>
                  <div class="flex-1 h-2 bg-white border border-base-300 overflow-hidden">
                    <div class="h-full transition-all duration-500"
                      :style="{ width: cv.pct + '%', backgroundColor: cv.pct > 66 ? '#008000' : cv.pct > 33 ? '#808000' : '#800000' }" />
                  </div>
                  <span class="text-[9px] font-mono text-win-text w-8 text-right">{{ cv.pct }}%</span>
                </div>
              </div>
            </fieldset>
            <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 pt-1 pb-2 flex flex-col gap-2">
              <legend class="text-[9px] font-bold px-1 uppercase text-win-text">Recordes</legend>
              <div v-if="d.maisAntiga" class="flex flex-col">
                <span class="text-[8px] font-bold uppercase text-win-muted-dark flex items-center gap-1">
                  <Icon name="lucide:calendar-clock" class="text-[9px] text-blue-700" /> Nascimento mais antigo
                </span>
                <p class="text-[10px] font-bold uppercase leading-tight">{{ (d.maisAntiga as any).sobrenome }}, {{ (d.maisAntiga as any).nome }}</p>
                <p class="text-[9px] font-mono text-win-muted">{{ formatarData((d.maisAntiga as any).datanasc) }}</p>
              </div>
              <div v-if="d.maisRecente" class="flex flex-col border-t border-base-300 pt-1">
                <span class="text-[8px] font-bold uppercase text-win-muted-dark flex items-center gap-1">
                  <Icon name="lucide:calendar" class="text-[9px] text-green-700" /> Nascimento mais recente
                </span>
                <p class="text-[10px] font-bold uppercase leading-tight">{{ (d.maisRecente as any).sobrenome }}, {{ (d.maisRecente as any).nome }}</p>
                <p class="text-[9px] font-mono text-win-muted">{{ formatarData((d.maisRecente as any).datanasc) }}</p>
              </div>
            </fieldset>
          </div>

          <!-- Mais conectados -->
          <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 pt-1 pb-2 flex flex-col">
            <legend class="text-[9px] font-bold px-1 uppercase text-win-text">Pessoas Mais Conectadas</legend>
            <div class="mt-1 border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white overflow-hidden">
              <table class="w-full border-collapse">
                <thead class="bg-base-300">
                  <tr>
                    <th class="text-left text-[8px] font-bold uppercase py-1 px-1.5 border-b border-base-300 w-5">#</th>
                    <th class="text-left text-[8px] font-bold uppercase py-1 px-1.5 border-b border-base-300">Nome</th>
                    <th class="text-center text-[8px] font-bold uppercase py-1 px-1.5 border-b border-base-300 w-8">Vínculos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in (d.maisConectados as any[])" :key="i"
                    class="border-b border-win-border-light"
                    :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male)' : p.sexo === 'F' ? 'var(--color-female)' : '' }">
                    <td class="py-1 px-1.5 text-[9px] font-mono text-win-muted">{{ i + 1 }}</td>
                    <td class="py-1 px-1.5 text-[9px] font-bold uppercase leading-tight">{{ p.sobrenome }}, {{ p.nome }}</td>
                    <td class="py-1 px-1.5 text-[10px] font-mono font-bold text-center">{{ p.total/2 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </fieldset>

        </div>

        <!-- ── Linha 3: Sobrenomes | Cidades nasc. | Cidades óbito ─────────── -->
        <div class="grid grid-cols-3 gap-2">

          <!-- Top 10 sobrenomes -->
          <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 pt-1 pb-2 flex flex-col max-h-[220px]">
            <legend class="text-[9px] font-bold px-1 uppercase text-win-text">Top 10 Sobrenomes</legend>
            <div class="flex-1 overflow-y-auto mt-1 flex flex-col gap-1">
              <div v-for="(s, i) in (d.sobrenomes as any[])" :key="(s as any).sobrenome" class="flex flex-col gap-0.5">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-1">
                    <span class="text-[8px] font-mono text-base-300 w-4">{{ i + 1 }}.</span>
                    <span class="text-[10px] font-bold uppercase">{{ s.sobrenome }}</span>
                  </div>
                  <span class="text-[10px] font-mono font-bold">{{ s.total }}</span>
                </div>
                <div class="h-1.5 bg-white border border-base-300 overflow-hidden">
                  <div class="h-full bg-win-navy"
                    :style="{ width: Math.round((s.total / ((d.sobrenomes as any[])[0]?.total || 1)) * 100) + '%' }" />
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Cidades de nascimento -->
          <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 pt-1 pb-2 flex flex-col max-h-[220px]">
            <legend class="text-[9px] font-bold px-1 uppercase text-win-text">Cidades — Nascimentos</legend>
            <div class="flex-1 overflow-y-auto mt-1 flex flex-col gap-1">
              <div v-if="!(d.cidadesNasc as any[]).length" class="text-[10px] text-win-dim italic py-2 text-center">Sem dados</div>
              <div v-for="(c, i) in (d.cidadesNasc as any[])" :key="i" class="flex flex-col gap-0.5">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-bold truncate max-w-[70%]">{{ c.descricao }}<span v-if="c.estado" class="font-normal text-win-dim"> / {{ c.estado }}</span></span>
                  <span class="text-[10px] font-mono font-bold">{{ c.total }}</span>
                </div>
                <div class="h-1.5 bg-white border border-base-300 overflow-hidden">
                  <div class="h-full bg-[#008080]"
                    :style="{ width: Math.round((c.total / ((d.cidadesNasc as any[])[0]?.total || 1)) * 100) + '%' }" />
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Cidades de óbito -->
          <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 pt-1 pb-2 flex flex-col max-h-[220px]">
            <legend class="text-[9px] font-bold px-1 uppercase text-win-text">Cidades — Óbitos</legend>
            <div class="flex-1 overflow-y-auto mt-1 flex flex-col gap-1">
              <div v-if="!(d.cidadesObito as any[]).length" class="text-[10px] text-win-dim italic py-2 text-center">Sem dados</div>
              <div v-for="(c, i) in (d.cidadesObito as any[])" :key="i" class="flex flex-col gap-0.5">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-bold truncate max-w-[70%]">{{ c.descricao }}<span v-if="c.estado" class="font-normal text-win-dim"> / {{ c.estado }}</span></span>
                  <span class="text-[10px] font-mono font-bold">{{ c.total }}</span>
                </div>
                <div class="h-1.5 bg-white border border-base-300 overflow-hidden">
                  <div class="h-full bg-[#800000]"
                    :style="{ width: Math.round((c.total / ((d.cidadesObito as any[])[0]?.total || 1)) * 100) + '%' }" />
                </div>
              </div>
            </div>
          </fieldset>

        </div>

      </div>
    </template>

    <!-- Barra de status -->
    <div class="flex-none flex items-center gap-4 px-2 pb-1.5 pt-1 bg-win-bg border-t border-base-300">
      <div class="border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-px">
        <span class="text-[9px] text-black uppercase font-bold">CPG - Estatísticas</span>
      </div>
      <div v-if="d" class="border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-px">
        <span class="text-[9px] text-black">{{ d.totalPessoas }} pessoas · {{ d.totalRelacoes }} vínculos · {{ d.totalSobrenomes }} sobrenomes</span>
      </div>
      <div class="ml-auto border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-px">
        <span class="text-[9px] text-black" :class="{ 'animate-pulse': pending }">{{ pending ? 'Atualizando...' : 'Pronto' }}</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const { data: d, pending, refresh } = await useFetch('/api/estatisticas')

const { formatarData: _formatarData } = useFormatarData()
function formatarData(s: string | null): string { return _formatarData(s) ?? '—' }

// ── Cards de resumo ───────────────────────────────────────────────────
const cards = computed(() => {
  if (!d.value) return []
  const pct = d.value.totalPessoas > 0
    ? Math.round(((d.value.totalPessoas as number) - (d.value.semVinculo as number)) / (d.value.totalPessoas as number) * 100)
    : 0
  return [
    { label: 'Pessoas',         valor: d.value.totalPessoas,    icon: 'lucide:users',      cls: 'text-blue-700',   sub: 'registros cadastrados' },
    { label: 'Vínculos',        valor: d.value.totalRelacoes/2,   icon: 'lucide:link',       cls: 'text-purple-700', sub: 'relações familiares' },
    { label: 'Sobrenomes',      valor: d.value.totalSobrenomes, icon: 'lucide:tag',        cls: 'text-teal-700',   sub: 'sobrenomes distintos' },
    { label: 'Sem vínculo',     valor: d.value.semVinculo,      icon: 'lucide:user-x',    cls: 'text-red-700',    sub: 'pessoas isoladas' },
    { label: 'Média vínculos',  valor: d.value.mediaRelacoes,   icon: 'lucide:share-2',   cls: 'text-orange-700', sub: 'por pessoa' },
  ]
})

// ── Sexo ─────────────────────────────────────────────────────────────
const CORES_SEXO: Record<string, string> = { M: '#88bbdd', F: '#dd88aa', '': '#b0b0b0' }

const sexoFmt = computed(() => {
  if (!d.value) return []
  const total = d.value.totalPessoas as number
  return (d.value.porSexo as any[]).map(s => ({
    label: s.sexo === 'M' ? 'Masculino' : s.sexo === 'F' ? 'Feminino' : 'Não inf.',
    total: s.total,
    pct: total > 0 ? Math.round((s.total / total) * 100) : 0,
    cor: CORES_SEXO[s.sexo ?? ''] ?? '#b0b0b0',
  }))
})

// Pizza SVG
const pizzaSlices = computed(() => {
  const slices = sexoFmt.value
  const total = slices.reduce((a, s) => a + s.total, 0)
  if (!total) return []
  let angle = -Math.PI / 2
  const cx = 40, cy = 40, r = 36
  return slices.map(s => {
    const start = angle
    const sweep = (s.total / total) * 2 * Math.PI
    angle += sweep
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    return { path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, cor: s.cor }
  })
})


// ── Cobertura ─────────────────────────────────────────────────────────
const coberturaFmt = computed(() => {
  const c = d.value?.cobertura as any
  if (!c || !c.total) return []
  return [
    { label: 'Data nasc.',    pct: Math.round(c.com_nasc    / c.total * 100) },
    { label: 'Local nasc.',   pct: Math.round(c.com_localnasc / c.total * 100) },
    { label: 'Batismo',       pct: Math.round(c.com_batismo / c.total * 100) },
    { label: 'Data óbito',    pct: Math.round(c.com_morte   / c.total * 100) },
    { label: 'Local óbito',   pct: Math.round(c.com_localmorte / c.total * 100) },
  ]
})
</script>
