<template>
  <div
    ref="janela"
    class="absolute pointer-events-auto bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-[2px_2px_0_#000] flex flex-col font-sans select-none"
    :style="{
      left: pos.x + 'px',
      top:  pos.y + 'px',
      width: '740px',
      height: '82vh',
      zIndex: zIndex,
    }"
    @mousedown="trazerParaFrente"
  >

    <!-- titulo da janela -->
    <div
      class="flex-none flex items-center justify-between bg-primary px-2 py-1 mx-0.5 mt-0.5 cursor-move"
      @mousedown.prevent="iniciarDrag"
    >
      <span class="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2 pointer-events-none">
        <Icon name="lucide:user" class="text-sm" />
        {{ pessoa.sobrenome }}, {{ pessoa.nome }}
        <span class="text-xs font-normal opacity-75">(ID {{ String(pessoa.id).padStart(3,'0') }})</span>
      </span>
      <button @click.stop="$emit('fechar')"
        class="bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-6 h-6 flex items-center justify-center text-sm font-bold hover:brightness-110 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white cursor-pointer"
        style="pointer-events: all">
        ×
      </button>
    </div>

    <!-- abas -->
    <div class="flex-none flex items-end gap-0.5 px-2 pt-1.5 bg-[#d4d0c8] border-b-2 border-[#808080]">
      <button
        v-for="aba in abas" :key="aba.id"
        @click="abaAtiva = aba.id"
        class="px-4 py-1 text-xs font-bold uppercase tracking-wide border-2 relative"
        :class="abaAtiva === aba.id
          ? 'bg-[#d4d0c8] border-t-white border-l-white border-r-[#808080] border-b-[#d4d0c8] -mb-[2px] z-10'
          : 'bg-[#b8b4ac] border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] text-[#404040] hover:brightness-105'"
      >
        <Icon :name="aba.icon" class="text-xs mr-1" />
        {{ aba.label }}
      </button>
    </div>

    <!-- aba atual -->
    <div class="flex-1 overflow-y-auto">

      <!-- aba pessoa -->
      <div v-show="abaAtiva === 'pessoa'" class="p-4 flex flex-col gap-4">

        <div class="border-b-2 border-[#808080] pb-3">
          <p class="text-xs font-bold uppercase text-black tracking-widest mb-2">Identificação</p>
          <div class="grid grid-cols-7 gap-x-6">
            <div class="col-span-3">
              <p class="text-xs font-bold uppercase text-[#404040] mb-0.5">Nome</p>
              <p class="text-xl font-bold uppercase">{{ pessoa.nome }}</p>
            </div>
            <div class="col-span-3">
              <p class="text-xs font-bold uppercase text-[#404040] mb-0.5">Sobrenome</p>
              <p class="text-xl font-bold uppercase">{{ pessoa.sobrenome }}</p>
            </div>
            <div class="col-span-1">
              <p class="text-xs font-bold uppercase text-[#404040] mb-0.5">Sexo</p>
              <p class="text-xl font-bold">{{ pessoa.sexo === 'M' ? 'Masc.' : pessoa.sexo === 'F' ? 'Fem.' : '—' }}</p>
            </div>
          </div>
        </div>

        <div class="border-b-2 border-[#808080] pb-3">
          <p class="text-xs font-bold uppercase text-black tracking-widest mb-2">Eventos Vitais</p>
          <div class="grid grid-cols-3 gap-x-6">
            <div v-for="ev in eventosVitais" :key="ev.label">
              <p class="text-xs font-bold uppercase text-[#404040] mb-0.5">{{ ev.label }}</p>
              <p class="text-base font-bold">{{ ev.data ?? '—' }}</p>
              <p class="text-sm text-[#303030]">{{ ev.local ?? '—' }}</p>
            </div>
          </div>
        </div>

        <div v-if="carregando" class="text-sm text-[#404040] animate-pulse uppercase tracking-widest py-2">
          Carregando vínculos...
        </div>

        <template v-else-if="detalhes">
          <!-- pais -->
          <div class="border-b-2 border-[#808080] pb-3">
            <p class="text-xs font-bold uppercase text-black tracking-widest mb-2">Filiação</p>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="(label, idx) in ['Pai', 'Mãe']" :key="label">
                <p class="text-xs font-bold uppercase text-[#404040] mb-1">{{ label }}</p>
                <button v-if="detalhes.familia.pais[idx]"
                  type="button" @click="$emit('abrirPessoa', detalhes.familia.pais[idx].pessoa)"
                  class="w-full text-left border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-2 hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                  :style="{ backgroundColor: detalhes.familia.pais[idx].pessoa?.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }">
                  <p class="text-sm font-bold uppercase">{{ detalhes.familia.pais[idx].pessoa?.sobrenome }}, {{ detalhes.familia.pais[idx].pessoa?.nome }}</p>
                  <p class="text-xs text-[#303030] mt-0.5">b.: {{ detalhes.familia.pais[idx].pessoa?.datanasc?.substring(0,4) ?? '—' }}</p>
                </button>
                <div v-else class="px-3 py-2 text-sm text-[#808080] italic">Não informado</div>
              </div>
            </div>
          </div>

          <!-- conjugues -->
          <div v-if="detalhes.familia.conjuges.length" class="border-b-2 border-[#808080] pb-3">
            <p class="text-xs font-bold uppercase text-black tracking-widest mb-2">
              {{ detalhes.familia.conjuges.length > 1 ? 'Cônjuges' : 'Cônjuge' }}
            </p>
            <div class="flex flex-col gap-2">
              <div v-for="v in detalhes.familia.conjuges" :key="v.relId" class="flex flex-col gap-1.5">
                <button type="button" @click="$emit('abrirPessoa', v.pessoa)"
                  class="w-full text-left border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-2 hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                  :style="{ backgroundColor: v.pessoa?.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }">
                  <p class="text-sm font-bold uppercase">{{ v.pessoa?.sobrenome }}, {{ v.pessoa?.nome }}</p>
                  <p class="text-xs text-[#303030] mt-0.5">b.: {{ v.pessoa?.datanasc?.substring(0,4) ?? '—' }}</p>
                </button>
                <div v-if="v.metadata" class="grid grid-cols-2 gap-3 pl-1">
                  <div>
                    <p class="text-xs font-bold uppercase text-[#404040] mb-0.5">Data do Casamento</p>
                    <p class="text-sm">{{ formatarData(v.metadata.data_casamento) ?? '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-bold uppercase text-[#404040] mb-0.5">Local do Casamento</p>
                    <p class="text-sm">{{ v.metadata.local_casamento ?? '—' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- filhos -->
          <div v-if="detalhes.familia.filhos.length" class="border-b-2 border-[#808080] pb-3">
            <p class="text-xs font-bold uppercase text-black tracking-widest mb-2">Filhos ({{ detalhes.familia.filhos.length }})</p>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="v in detalhes.familia.filhos" :key="v.relId"
                type="button" @click="$emit('abrirPessoa', v.pessoa)"
                class="text-left border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 py-2 hover:brightness-95 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
                :style="{ backgroundColor: v.pessoa?.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }">
                <p class="text-sm font-bold uppercase truncate">{{ v.pessoa?.sobrenome }}, {{ v.pessoa?.nome }}</p>
                <p class="text-xs text-[#303030] mt-0.5">b.: {{ v.pessoa?.datanasc?.substring(0,4) ?? '—' }}</p>
              </button>
            </div>
          </div>

          <!-- obs -->
          <div v-if="pessoa.obs" class="border-b-2 border-[#808080] pb-3">
            <p class="text-xs font-bold uppercase text-black tracking-widest mb-2">Observações</p>
            <p class="text-sm text-[#202020] whitespace-pre-wrap leading-relaxed">{{ pessoa.obs }}</p>
          </div>

        </template>
      </div>

      <!-- aba lista de parentes -->
      <div v-show="abaAtiva === 'parentes'" class="flex flex-col h-full">
        <div v-if="carregando" class="p-4 text-sm text-[#404040] animate-pulse uppercase tracking-widest">
          Carregando...
        </div>
        <template v-else-if="detalhes">
         
          <div class="flex-none grid gap-0 border-b-2 border-[#808080] bg-[#b8b4ac]"
            style="grid-template-columns: 2fr 2fr 1fr 1fr 1fr">
            <div class="px-3 py-1.5 text-[10px] font-bold uppercase border-r border-[#808080]">Nome</div>
            <div class="px-3 py-1.5 text-[10px] font-bold uppercase border-r border-[#808080]">Relação</div>
            <div class="px-3 py-1.5 text-[10px] font-bold uppercase border-r border-[#808080] text-center">Sexo</div>
            <div class="px-3 py-1.5 text-[10px] font-bold uppercase border-r border-[#808080] text-center">Nasc.</div>
            <div class="px-3 py-1.5 text-[10px] font-bold uppercase text-center">Óbito</div>
          </div>
         
          <div class="flex-1 overflow-y-auto bg-white">
            <button
              v-for="r in todosParentes" :key="r.relId"
              type="button"
              @click="$emit('abrirPessoa', r.pessoa)"
              class="w-full text-left grid border-b border-gray-200 hover:brightness-95 transition-colors"
              style="grid-template-columns: 2fr 2fr 1fr 1fr 1fr"
              :style="{ backgroundColor: r.pessoa?.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }"
            >
              <div class="px-3 py-2 font-bold text-sm uppercase border-r border-gray-300 truncate">
                {{ r.pessoa?.sobrenome }}, {{ r.pessoa?.nome }}
              </div>
              <div class="px-3 py-2 text-sm border-r border-gray-300 capitalize">{{ r.papel }}</div>
              <div class="px-3 py-2 text-sm border-r border-gray-300 text-center font-bold">{{ r.pessoa?.sexo ?? '—' }}</div>
              <div class="px-3 py-2 text-sm border-r border-gray-300 text-center font-mono">{{ r.pessoa?.datanasc?.substring(0,4) ?? '—' }}</div>
              <div class="px-3 py-2 text-sm text-center font-mono">{{ r.pessoa?.datamorte?.substring(0,4) ?? '—' }}</div>
            </button>
            <div v-if="!todosParentes.length" class="px-4 py-8 text-sm text-[#808080] italic text-center">
              Nenhum parente cadastrado.
            </div>
          </div>
      
          <div class="flex-none border-t border-[#808080] px-3 py-1 bg-[#d4d0c8]">
            <span class="text-xs text-[#404040]">{{ todosParentes.length }} parente(s) encontrado(s)</span>
          </div>
        </template>
      </div>

    <!-- aba arvore -->
<div v-show="abaAtiva === 'arvore'"
  class="h-full flex flex-col items-center justify-center gap-4 p-8">
  <Icon name="lucide:git-fork" class="text-5xl text-[#808080]" />
  <p class="text-sm text-[#404040] text-center">
    Clique para abrir a árvore de <strong>{{ pessoa.nome }} {{ pessoa.sobrenome }}</strong> em uma janela separada.
  </p>
  <button @click="$emit('verArvore', pessoa.id)"
    class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] px-6 py-2 text-sm font-bold uppercase hover:brightness-110 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white flex items-center gap-2">
    <Icon name="lucide:git-fork" class="text-sm" />
    Abrir Árvore
  </button>
</div>

    </div>

    <!--todo: gambiarra fazer de vdd-->
    <div class="flex-none px-3 py-2 border-t-2 border-[#808080] flex justify-between items-center bg-[#d4d0c8]">
      <button @click="$emit('excluir', pessoa.id)"
        class="text-xs uppercase font-bold px-4 py-1.5 bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:bg-red-100 text-red-700 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white flex items-center gap-1">
        <Icon name="lucide:trash-2" class="text-xs" /> Excluir
      </button>
      <div class="flex gap-2">
        <button @click="$emit('fechar')"
          class="text-xs uppercase font-bold px-5 py-1.5 bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-110 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white">
          Fechar
        </button>
        <button @click="$emit('editar', pessoa.id)"
          class="text-xs uppercase font-bold px-5 py-1.5 bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:brightness-110 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white flex items-center gap-1">
          <Icon name="lucide:pencil" class="text-xs" /> Editar
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import * as f3 from 'family-chart'

interface Pessoa {
  id: number
  nome: string
  sobrenome: string
  sexo: string | null
  datanasc: string | null
  datamorte: string | null
  databatismo: string | null
  localnasc: number | null
  localbatismo: number | null
  localmorte: number | null
  obs: string | null
}

const props = defineProps<{
  pessoa: Pessoa
  zIndex: number
  offset: number
}>()

const emit = defineEmits<{
  fechar: []
  excluir: [id: number]
  editar: [id: number]
  abrirPessoa: [pessoa: Pessoa]
  verArvore: [id: number]
}>()

// Abas
const abaAtiva = ref<'pessoa' | 'parentes' | 'arvore'>('pessoa')
const abas = [
  { id: 'pessoa',   label: 'Pessoa',   icon: 'lucide:user'        },
  { id: 'parentes', label: 'Parentes', icon: 'lucide:users'       },
  { id: 'arvore',   label: 'Árvore',   icon: 'lucide:git-fork'    },
]

// Drag
const pos = ref({ x: 80 + props.offset * 30, y: 40 + props.offset * 30 })
let dragging = false
let startMouse = { x: 0, y: 0 }
let startPos   = { x: 0, y: 0 }

function iniciarDrag(e: MouseEvent) {
  dragging = true
  startMouse = { x: e.clientX, y: e.clientY }
  startPos   = { x: pos.value.x, y: pos.value.y }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', pararDrag)
}
function onMove(e: MouseEvent) {
  if (!dragging) return
  pos.value = { x: startPos.x + (e.clientX - startMouse.x), y: startPos.y + (e.clientY - startMouse.y) }
}
function pararDrag() {
  dragging = false
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', pararDrag)
}
function trazerParaFrente() {}
onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', pararDrag)
})

// Dados
const { data: arvoreRaw, pending: carregando } = await useFetch<any[]>(
  () => `/api/pessoa?id=${props.pessoa.id}`
)
const { data: todosLocais }  = await useFetch<any[]>('/api/local')
const { data: tiposRelacao } = await useFetch<any[]>('/api/tipo_relacao')
const { data: todasPessoas } = await useFetch<any[]>('/api/pessoa')

const localMap = computed(() =>
  Object.fromEntries((todosLocais.value ?? []).map((l: any) => [l.id, l]))
)
const pessoaMap = computed(() =>
  Object.fromEntries((todasPessoas.value ?? []).map((p: any) => [p.id, p]))
)
const tipoMap = computed(() =>
  Object.fromEntries((tiposRelacao.value ?? []).map((t: any) => [t.id, t.descricao]))
)

function resolverLocal(id: number | null): string | null {
  if (!id) return null
  const l = localMap.value[id]
  return l ? `${l.descricao}${l.estado ? ' - ' + l.estado : ''}` : null
}

function formatarData(data: string | null): string | null {
  if (!data) return null
  const d = new Date(data)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  const dia = String(d.getDate()).padStart(2, '0')
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${dia} ${meses[d.getMonth()]} ${d.getFullYear()}`
}

const eventosVitais = computed(() => [
  { label: 'Nascimento', data: formatarData(props.pessoa.datanasc),   local: resolverLocal(props.pessoa.localnasc)   },
  { label: 'Batismo',    data: formatarData(props.pessoa.databatismo), local: resolverLocal(props.pessoa.localbatismo) },
  { label: 'Óbito',      data: formatarData(props.pessoa.datamorte),   local: resolverLocal(props.pessoa.localmorte)  },
])

const detalhes = computed(() => {
  if (!arvoreRaw.value) return null
  const pais: any[] = [], conjuges: any[] = [], filhos: any[] = [], outros: any[] = []
  const diretas = (arvoreRaw.value as any[]).filter(r => r.o_depth <= 1)
  for (const r of diretas) {
    const outro = pessoaMap.value[r.o_point2] ?? null
    const relTipo = r.o_link_rel
    const entrada = { relId: r.o_point2, tipo: relTipo, tipoDescricao: tipoMap.value[relTipo] ?? '', pessoa: outro, metadata: null as any, papel: '' }
    if      (relTipo === 1) { entrada.papel = 'pai / mãe';    pais.push(entrada)     }
    else if (relTipo === 2) { entrada.papel = 'cônjuge';      conjuges.push(entrada) }
    else if (relTipo === 3) { entrada.papel = 'filho / filha'; filhos.push(entrada)  }
    else                    { entrada.papel = tipoMap.value[relTipo] ?? 'outro'; outros.push(entrada) }
  }
  return { familia: { pais, conjuges, filhos, outros } }
})

// Lista plana de todos os parentes para a aba Parentes
const todosParentes = computed(() => {
  if (!detalhes.value) return []
  return [
    ...detalhes.value.familia.pais,
    ...detalhes.value.familia.conjuges,
    ...detalhes.value.familia.filhos,
    ...detalhes.value.familia.outros,
  ]
})

// Árvore — carrega quando a aba é ativada
const arvoreData = ref<any[]>([])
const arvoreCarregada = ref(false)

const router = useRouter()
function irParaArvore() {
  router.push({ path: '/arvore', query: { id: props.pessoa.id } })
  emit('fechar')
}

function renderizarArvore() {
  const containerId = `#arvore-${props.pessoa.id}`
  const el = document.querySelector(containerId)
  if (!el || !arvoreData.value.length) return

  const chart = f3.createChart(containerId, arvoreData.value)
    .setTransitionTime(800)
    .setCardXSpacing(280)
    .setCardYSpacing(140)
    .setSingleParentEmptyCard(true, { label: 'Desconhecido' })
    .setOrientationVertical()

  chart.setCardHtml()
    .setCardDisplay([['first name', 'last name'], ['birth year'], ['death year']])
    .setCardDim({ width: 220 })
    .setMiniTree(true)
    .setStyle('rect')
    .setOnHoverPathToMain()

  chart.updateMainId(String(props.pessoa.id))
  chart.updateTree({ initial: true })
}
</script>