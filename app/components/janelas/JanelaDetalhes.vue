<template>
  <div
    ref="janela"
    class="bg-base-100 border-2 border-t-white border-l-white border-r-win-text border-b-win-text flex flex-col font-sans select-none"
    :class="janelaReal ? 'w-screen h-screen' : 'absolute pointer-events-auto shadow-[2px_2px_0_#000]'"
    :style="janelaReal ? undefined : { left: pos.x + 'px', top: pos.y + 'px', width: '720px', height: '80vh', zIndex }"
    @mousedown="janelaReal ? null : emit('trazerParaFrente', pessoa.id)"
  >

    <!-- Barra de título — azul quando ativa, cinza quando em segundo plano -->
    <div
      class="flex-none flex items-center justify-between px-2 py-1 mx-0.5 mt-0.5"
      :class="[tituloAtivo ? 'bg-win-navy' : 'bg-win-dim', janelaReal ? '' : 'cursor-move']"
      :style="(janelaReal ? { '-webkit-app-region': 'drag' } : undefined) as any"
      @mousedown="onTituloMouseDown"
    >
      <span class="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pointer-events-none">
        <Icon name="lucide:user" class="text-xs" />
        {{ pessoa.sobrenome }}, {{ pessoa.nome }}
        <span class="text-[10px] font-normal opacity-70">#{{ String(pessoa.id).padStart(3, '0') }}</span>
      </span>
      <div class="flex gap-0.5"
        :style="({ pointerEvents: 'all', ...(janelaReal ? { '-webkit-app-region': 'no-drag' } : {}) }) as any">
        <button v-if="janelaReal" @click.stop="minimizar()"
          class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-5 h-5 flex items-center justify-center text-xs font-bold hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white cursor-pointer">
          _
        </button>
        <button @click.stop="emit('fechar')"
          class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-5 h-5 flex items-center justify-center text-xs font-bold hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white cursor-pointer">
          ×
        </button>
      </div>
    </div>

    <!-- Abas -->
    <div class="flex-none flex items-end gap-0.5 px-2 pt-1 bg-base-100 border-b-2 border-base-300">
      <button
        v-for="aba in abas" :key="aba.id"
        @click="abaAtiva = aba.id"
        class="px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide border-2 relative flex items-center gap-1"
        :class="abaAtiva === aba.id
          ? 'bg-base-100 border-t-white border-l-white border-r-base-300 border-b-base-100 -mb-0.5 z-10'
          : 'bg-[#b8b4ac] border-t-base-300 border-l-base-300 border-r-white border-b-base-300 text-win-muted-dark hover:brightness-105'"
      >
        <Icon :name="aba.icon" class="text-[10px]" />
        {{ aba.label }}
      </button>
    </div>

    <!-- Conteúdo das abas -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden">

      <!--  Aba Pessoa -->
      <div v-show="abaAtiva === 'pessoa'" class="p-4 flex flex-col gap-4">

        <!-- Identificação -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[9px] font-bold uppercase text-win-text tracking-widest whitespace-nowrap">Identificação</span>
            <div class="flex-1 h-px bg-base-300" />
          </div>
          <div class="flex border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white bg-white overflow-hidden">
            <div class="w-1.5 flex-none"
              :class="pessoa.sexo === 'M' ? 'bg-blue-400' : pessoa.sexo === 'F' ? 'bg-pink-400' : 'bg-win-border-light'" />
            <div class="flex-1 grid grid-cols-5 gap-x-4 px-4 py-3 items-center">
              <div class="col-span-2">
                <p class="text-[8px] font-bold uppercase text-win-muted mb-0.5">Nome</p>
                <p class="text-base font-bold leading-tight">{{ pessoa.nome }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-[8px] font-bold uppercase text-win-muted mb-0.5">Sobrenome</p>
                <p class="text-base font-bold uppercase leading-tight">{{ pessoa.sobrenome }}</p>
              </div>
              <div>
                <p class="text-[8px] font-bold uppercase text-win-muted mb-0.5">Sexo</p>
                <p class="text-sm font-bold"
                  :class="pessoa.sexo === 'M' ? 'text-blue-700' : pessoa.sexo === 'F' ? 'text-pink-700' : 'text-win-dim'">
                  {{ pessoa.sexo === 'M' ? 'Masc.' : pessoa.sexo === 'F' ? 'Fem.' : '—' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Eventos Vitais -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[9px] font-bold uppercase text-win-text tracking-widest whitespace-nowrap">Eventos Vitais</span>
            <div class="flex-1 h-px bg-base-300" />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="ev in eventosVitais" :key="ev.label"
              class="border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white bg-white px-3 py-2">
              <p class="text-[8px] font-bold uppercase text-win-muted mb-1">{{ ev.label }}</p>
              <p class="text-sm font-bold text-black leading-tight">{{ ev.data ?? '—' }}</p>
              <p class="text-[10px] text-win-muted mt-0.5 truncate">{{ ev.local ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Carregando -->
        <p v-if="carregando" class="text-[10px] text-win-dim animate-pulse uppercase tracking-widest py-1">
          Carregando vínculos...
        </p>

        <template v-else-if="detalhes">

          <!-- Filiação -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] font-bold uppercase text-win-text tracking-widest whitespace-nowrap">Filiação</span>
              <div class="flex-1 h-px bg-base-300" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="(label, i) in ['Pai', 'Mãe']" :key="label">
                <p class="text-[9px] font-bold uppercase text-win-text mb-1">{{ label }}</p>
                <button v-if="detalhes.familia.pais[i]"
                  type="button"
                  @click="emit('abrirPessoa', detalhes.familia.pais[i].pessoa)"
                  class="w-full text-left border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-2 hover:brightness-95 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white flex items-center justify-between gap-2"
                  :style="corCard(detalhes.familia.pais[i].pessoa?.sexo)">
                  <div class="min-w-0">
                    <p class="text-xs font-bold uppercase truncate leading-tight">{{ detalhes.familia.pais[i].pessoa?.sobrenome }}, {{ detalhes.familia.pais[i].pessoa?.nome }}</p>
                    <p class="text-[9px] font-mono text-win-muted mt-0.5">{{ anoVida(detalhes.familia.pais[i].pessoa?.datanasc, detalhes.familia.pais[i].pessoa?.datamorte) }}</p>
                  </div>
                  <Icon name="lucide:chevron-right" class="text-win-dim text-xs flex-none" />
                </button>
                <p v-else class="text-xs text-win-dim italic px-1 py-2">—</p>
              </div>
            </div>
          </div>

          <!-- Cônjuge(s) -->
          <div v-if="detalhes.familia.conjuges.length">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] font-bold uppercase text-win-text tracking-widest whitespace-nowrap">
                {{ detalhes.familia.conjuges.length > 1 ? 'Cônjuges' : 'Cônjuge' }}
              </span>
              <div class="flex-1 h-px bg-base-300" />
            </div>
            <div class="flex flex-col gap-2">
              <div v-for="v in detalhes.familia.conjuges" :key="v.relId">
                <button type="button"
                  @click="emit('abrirPessoa', v.pessoa)"
                  class="w-full text-left border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-2 hover:brightness-95 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white flex items-center justify-between gap-2"
                  :style="corCard(v.pessoa?.sexo)">
                  <div class="min-w-0">
                    <p class="text-xs font-bold uppercase truncate leading-tight">{{ v.pessoa?.sobrenome }}, {{ v.pessoa?.nome }}</p>
                    <p class="text-[9px] font-mono text-win-muted mt-0.5">{{ anoVida(v.pessoa?.datanasc, v.pessoa?.datamorte) }}</p>
                  </div>
                  <Icon name="lucide:chevron-right" class="text-win-dim text-xs flex-none" />
                </button>
                <div v-if="v.metadata?.data_casamento || v.metadata?.local_casamento"
                  class="px-1 py-1 flex gap-6 text-[10px] text-win-text">
                  <span v-if="v.metadata.data_casamento">
                    <span class="font-bold">Data de casamento:</span> {{ formatarData(v.metadata.data_casamento) }}
                  </span>
                  <span v-if="v.metadata.local_casamento">
                    <span class="font-bold">Cidade de casamento:</span> {{ resolverLocal(Number(v.metadata.local_casamento)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Filhos -->
          <div v-if="detalhes.familia.filhos.length">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] font-bold uppercase text-win-text tracking-widest whitespace-nowrap">Filhos ({{ detalhes.familia.filhos.length }})</span>
              <div class="flex-1 h-px bg-base-300" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="v in detalhes.familia.filhos" :key="v.relId"
                type="button"
                @click="emit('abrirPessoa', v.pessoa)"
                class="text-left border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-2 hover:brightness-95 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white flex items-center justify-between gap-2"
                :style="corCard(v.pessoa?.sexo)">
                <div class="min-w-0">
                  <p class="text-xs font-bold uppercase truncate leading-tight">{{ v.pessoa?.sobrenome }}, {{ v.pessoa?.nome }}</p>
                  <p class="text-[9px] font-mono text-win-muted mt-0.5">{{ anoVida(v.pessoa?.datanasc, v.pessoa?.datamorte) }}</p>
                </div>
                <Icon name="lucide:chevron-right" class="text-win-dim text-xs flex-none" />
              </button>
            </div>
          </div>

          <!-- Observações -->
          <div v-if="pessoa.obs">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] font-bold uppercase text-win-text tracking-widest whitespace-nowrap">Observações</span>
              <div class="flex-1 h-px bg-base-300" />
            </div>
            <div class="border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white bg-white px-3 py-2">
              <p class="text-xs text-black whitespace-pre-wrap leading-relaxed">{{ pessoa.obs }}</p>
            </div>
          </div>

        </template>
      </div>

      <!--  Aba Parentes -->
      <div v-show="abaAtiva === 'parentes'" class="flex flex-col h-full">
        <p v-if="carregando" class="p-4 text-[10px] text-win-dim animate-pulse uppercase tracking-widest">
          Carregando...
        </p>
        <template v-else-if="detalhes">
          <div class="flex-none grid border-b-2 border-base-300 bg-[#b8b4ac]"
            style="grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr">
            <div class="px-3 py-1.5 text-[9px] font-bold uppercase border-r border-base-300">Nome</div>
            <div class="px-3 py-1.5 text-[9px] font-bold uppercase border-r border-base-300">Relação</div>
            <div class="px-3 py-1.5 text-[9px] font-bold uppercase border-r border-base-300 text-center">Sexo</div>
            <div class="px-3 py-1.5 text-[9px] font-bold uppercase border-r border-base-300 text-center">Nasc.</div>
            <div class="px-3 py-1.5 text-[9px] font-bold uppercase text-center">Óbito</div>
          </div>
          <div class="flex-1 overflow-y-auto">
            <button
              v-for="r in todosParentes" :key="r.relId"
              type="button"
              @click="emit('abrirPessoa', r.pessoa)"
              class="w-full text-left grid border-b border-[#d0d0d0] hover:brightness-95 transition-colors"
              style="grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr"
              :style="corCard(r.pessoa?.sexo)">
              <div class="px-3 py-2 font-bold text-xs uppercase border-r border-[#c8c8c8] truncate">
                {{ r.pessoa?.sobrenome }}, {{ r.pessoa?.nome }}
              </div>
              <div class="px-3 py-2 text-xs border-r border-[#c8c8c8] capitalize text-win-text">{{ r.papel }}</div>
              <div class="px-3 py-2 text-xs border-r border-[#c8c8c8] text-center font-bold"
                :class="r.pessoa?.sexo === 'M' ? 'text-blue-700' : r.pessoa?.sexo === 'F' ? 'text-pink-700' : ''">
                {{ r.pessoa?.sexo ?? '—' }}
              </div>
              <div class="px-3 py-2 text-xs border-r border-[#c8c8c8] text-center font-mono text-win-text">{{ r.pessoa?.datanasc?.substring(0, 4) ?? '—' }}</div>
              <div class="px-3 py-2 text-xs text-center font-mono text-win-dim">{{ r.pessoa?.datamorte?.substring(0, 4) ?? '—' }}</div>
            </button>
            <div v-if="!todosParentes.length" class="px-4 py-8 text-xs text-win-dim italic text-center">
              Nenhum parente cadastrado.
            </div>
          </div>
          <div class="flex-none border-t border-base-300 px-3 py-1 bg-base-100">
            <span class="text-[9px] text-win-muted-dark">{{ todosParentes.length }} parente(s)</span>
          </div>
        </template>
      </div>

      <!--  Aba Buscar Relação -->
      <div v-show="abaAtiva === 'relacao'" class="h-full flex flex-col items-center justify-center gap-4 p-8">
        <Icon name="lucide:git-branch" class="text-5xl text-win-border-light" />
        <div class="text-center max-w-sm">
          <p class="text-sm font-bold text-black mb-1">{{ pessoa.nome }} {{ pessoa.sobrenome }}</p>
          <p class="text-xs text-win-muted-dark">
            Encontre o caminho de parentesco entre esta pessoa e outra cadastrada no sistema.
          </p>
        </div>
        <button @click="janelaReal ? navegarNaJanelaPrincipal('/buscar?id1=' + pessoa.id) : router.push('/buscar?id1=' + pessoa.id)"
          class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-6 py-1.5 text-xs font-bold uppercase hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white flex items-center gap-2">
          <Icon name="lucide:git-branch" class="text-xs" />
          Buscar Relação
        </button>
      </div>

      <!--  Aba Árvore -->
      <div v-show="abaAtiva === 'arvore'" class="h-full flex flex-col items-center justify-center gap-4 p-8">
        <Icon name="lucide:git-fork" class="text-5xl text-win-border-light" />
        <p class="text-sm text-win-muted-dark text-center">
          Abrir a árvore genealógica de <strong>{{ pessoa.nome }} {{ pessoa.sobrenome }}</strong> em uma janela separada.
        </p>
        <button @click="emit('verArvore', pessoa.id)"
          class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-6 py-1.5 text-xs font-bold uppercase hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white flex items-center gap-2">
          <Icon name="lucide:git-fork" class="text-xs" />
          Abrir Árvore
        </button>
      </div>

    </div>

    <!-- Barra de ações -->
    <div class="flex-none px-3 py-2 border-t-2 border-base-300 flex justify-between items-center bg-base-100">
      <button @click="confirmarExclusao"
        class="text-[10px] uppercase font-bold px-3 py-1.5 bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 hover:bg-red-50 text-red-700 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white flex items-center gap-1.5">
        <Icon name="lucide:trash-2" class="text-[10px]" />
        Excluir
      </button>
      <div class="flex gap-1.5">
        <button @click="emit('fechar')"
          class="text-[10px] uppercase font-bold px-4 py-1.5 bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white">
          Fechar
        </button>
        <button @click="emit('editar', pessoa.id)"
          class="text-[10px] uppercase font-bold px-4 py-1.5 bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white flex items-center gap-1.5">
          <Icon name="lucide:pencil" class="text-[10px]" />
          Editar
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
type AbaId = 'pessoa' | 'parentes' | 'arvore' | 'relacao'

const props = withDefaults(defineProps<{
  pessoa: Pessoa
  zIndex?: number
  offset?: number
  ativa?: boolean
  janelaReal?: boolean
}>(), {
  zIndex: 110,
  offset: 0,
  ativa: false,
  janelaReal: false,
})

const emit = defineEmits<{
  fechar: []
  excluir: [id: number]
  editar: [id: number]
  abrirPessoa: [pessoa: Pessoa]
  verArvore: [id: number]
  trazerParaFrente: [id: number]
}>()

// Em janela real a barra fica sempre azul (ativa); embutido depende do z-order.
const tituloAtivo = computed(() => props.janelaReal || props.ativa)

function onTituloMouseDown(e: MouseEvent) {
  if (props.janelaReal) return  // arraste nativo via -webkit-app-region
  e.preventDefault()
  iniciarDrag(e)
}

// Abas 
const abaAtiva = ref<AbaId>('pessoa')
const abas: { id: AbaId; label: string; icon: string }[] = [
  { id: 'pessoa',   label: 'Pessoa',         icon: 'lucide:user'       },
  { id: 'parentes', label: 'Parentes',       icon: 'lucide:users'      },
  { id: 'arvore',   label: 'Árvore',         icon: 'lucide:git-fork'   },
  { id: 'relacao',  label: 'Buscar Relação', icon: 'lucide:git-branch' },
]

const router = useRouter()
const { minimizar, navegarNaJanelaPrincipal } = useJanela()

// Drag com clamping de borda
const janela   = ref<HTMLElement | null>(null)
const pos      = ref({ x: 80 + props.offset * 30, y: 40 + props.offset * 30 })
let dragging   = false
let startMouse = { x: 0, y: 0 }
let startPos   = { x: 0, y: 0 }

function iniciarDrag(e: MouseEvent) {
  dragging   = true
  startMouse = { x: e.clientX, y: e.clientY }
  startPos   = { x: pos.value.x, y: pos.value.y }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup',  pararDrag)
}

function onMove(e: MouseEvent) {
  if (!dragging) return
  const w   = janela.value?.offsetWidth  ?? 720
  const h   = janela.value?.offsetHeight ?? 500
  const newX = startPos.x + (e.clientX - startMouse.x)
  const newY = startPos.y + (e.clientY - startMouse.y)
  pos.value = {
    x: Math.max(0, Math.min(newX, window.innerWidth  - w)),
    y: Math.max(0, Math.min(newY, window.innerHeight - h)),
  }
}

function pararDrag() {
  dragging = false
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup',  pararDrag)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup',  pararDrag)
})

// Dados 
const { data: familiaRaw,   pending: carregando } = await useFetch<any[]>(() => `/api/pessoa?id=${props.pessoa.id}`)
const { data: relacoesRaw }                      = await useFetch<any[]>(() => `/api/relacao?id=${props.pessoa.id}`)
const { data: todosLocais  }                     = await useFetch<any[]>('/api/local')
const { data: tiposRelacao }                     = await useFetch<any[]>('/api/tipo_relacao')
const { data: todasPessoas }                     = await useFetch<any[]>('/api/pessoa')

const localMap  = computed(() => Object.fromEntries((todosLocais.value  ?? []).map((l: any) => [l.id, l])))
const pessoaMap = computed(() => Object.fromEntries((todasPessoas.value ?? []).map((p: any) => [p.id, p])))
const tipoMap   = computed(() => Object.fromEntries((tiposRelacao.value ?? []).map((t: any) => [t.id, t.descricao])))
// relacao keyed by p2 (only type 2 = cônjuge) so we can look up wedding metadata
const metadataCasamento = computed(() => {
  const m: Record<number, any> = {}
  for (const r of (relacoesRaw.value ?? [])) {
    if (r.rel === 2) m[r.p2] = r.metadata ?? null
  }
  return m
})

function resolverLocal(id: number | null): string | null {
  if (!id) return null
  const l = localMap.value[id]
  return l ? `${l.descricao}${l.estado ? ' - ' + l.estado : ''}` : null
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function formatarData(data: string | null): string | null {
  if (!data) return null
  const d = new Date(data)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

function anoVida(nasc?: string | null, morte?: string | null): string {
  const n = nasc?.substring(0, 4)
  const m = morte?.substring(0, 4)
  if (!n) return '?'
  return m ? `${n} – ${m}` : `${n} –`
}

function corCard(sexo?: string | null): { backgroundColor: string } {
  return { backgroundColor: sexo === 'M' ? 'var(--color-male, #c8dce8)' : sexo === 'F' ? 'var(--color-female, #e8c8d8)' : '#e8e8e8' }
}

const eventosVitais = computed(() => [
  { label: 'Nascimento', data: formatarData(props.pessoa.datanasc),   local: resolverLocal(props.pessoa.localnasc)   },
  { label: 'Batismo',    data: formatarData(props.pessoa.databatismo), local: resolverLocal(props.pessoa.localbatismo) },
  { label: 'Óbito',      data: formatarData(props.pessoa.datamorte),   local: resolverLocal(props.pessoa.localmorte)  },
])

const detalhes = computed(() => {
  if (!familiaRaw.value) return null
  const pais: any[] = [], conjuges: any[] = [], filhos: any[] = [], outros: any[] = []
  for (const r of (familiaRaw.value as any[]).filter(r => r.o_depth <= 1)) {
    const relTipo = r.o_link_rel
    const papel = relTipo === 1 ? 'pai / mãe'
                : relTipo === 2 ? 'cônjuge'
                : relTipo === 3 ? 'filho / filha'
                : tipoMap.value[relTipo] ?? 'outro'
    const entrada = {
      relId:    r.o_point2,
      pessoa:   pessoaMap.value[r.o_point2] ?? null,
      metadata: relTipo === 2 ? (metadataCasamento.value[r.o_point2] ?? null) : null,
      papel,
    }
    if      (relTipo === 1) pais.push(entrada)
    else if (relTipo === 2) conjuges.push(entrada)
    else if (relTipo === 3) filhos.push(entrada)
    else                    outros.push(entrada)
  }
  return { familia: { pais, conjuges, filhos, outros } }
})

const todosParentes = computed(() => {
  if (!detalhes.value) return []
  const { pais, conjuges, filhos, outros } = detalhes.value.familia
  return [...pais, ...conjuges, ...filhos, ...outros]
})

function confirmarExclusao() {
  if (confirm(`Excluir ${props.pessoa.nome} ${props.pessoa.sobrenome}?\n\nEsta ação não pode ser desfeita. Todos os vínculos desta pessoa também serão removidos.`)) {
    emit('excluir', props.pessoa.id)
  }
}
</script>
