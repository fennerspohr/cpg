<template>
  <div
    ref="janela"
    class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 flex flex-col select-none font-sans"
    :class="janelaReal ? 'h-screen w-screen' : 'absolute pointer-events-auto shadow-[2px_2px_0_#000]'"
    :style="janelaReal ? undefined : { left: pos.x + 'px', top: pos.y + 'px', width: '520px', zIndex }"
    @mousedown="janelaReal ? null : emit('trazerParaFrente')"
  >

    <div class="flex-none flex items-center justify-between px-2 py-1 mx-0.5 mt-0.5"
      :class="[(janelaReal || ativa) ? 'bg-win-navy' : 'bg-win-dim', janelaReal ? '' : 'cursor-move']"
      :style="(janelaReal ? { '-webkit-app-region': 'drag' } : undefined) as any"
      @mousedown="onTituloMouseDown">
      <span class="text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 pointer-events-none">
        <Icon name="lucide:map-pin" class="text-sm" />
        Gerenciador de Localidades
      </span>
      <div class="flex gap-0.5"
        :style="(janelaReal ? { '-webkit-app-region': 'no-drag' } : undefined) as any">
        <button v-if="janelaReal" @click.stop="minimizar()"
          class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-5 h-5 flex items-center justify-center text-xs font-bold hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white cursor-pointer">
          _
        </button>
        <button @click.stop="emit('close')"
          class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-5 h-5 flex items-center justify-center text-xs font-bold hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white cursor-pointer">
          ×
        </button>
      </div>
    </div>

    <div class="p-4 bg-base-100 space-y-3">
      <div>
        <label class="text-[10px] font-bold uppercase block mb-1">Nome da cidade:</label>
        <input
          v-model="filtro"
          type="text"
          placeholder="Ex: Santa Maria"
          class="w-full bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1.5 text-sm outline-none focus:bg-win-focus"
        />
      </div>

      <div class="flex gap-4 items-end">
        <div class="w-28">
          <label class="text-[10px] font-bold uppercase block mb-1">Estado (UF):</label>
          <select
            v-model="estado"
            class="w-full bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1.5 text-sm outline-none focus:bg-win-focus"
          >
            <option value="">Nenhum</option>
            <option v-for="uf in estadosBrasileiros" :key="uf" :value="uf">{{ uf }}</option>
          </select>
        </div>

        <div class="flex-1">
          <button
            @click="salvarLocal"
            :disabled="!filtro || carregando || jaExiste"
            class="w-full border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white bg-base-100 text-xs py-2 font-bold disabled:opacity-50"
          >
            {{ jaExiste ? 'Já cadastrada' : carregando ? 'Adicionando...' : 'Adicionar' }}
          </button>
        </div>
      </div>

      <p v-if="jaExiste" class="text-[9px] text-blue-800 font-bold italic">
        * Esta cidade com o mesmo estado já consta na base de dados.
      </p>
      <p v-if="erro" class="text-[9px] text-red-700 font-bold italic">
        * Erro ao salvar. Tente novamente.
      </p>
    </div>

    <div class="px-2 pb-2 flex-1 flex flex-col min-h-0">
      <div class="bg-base-100 border-x border-t border-base-300 px-2 py-1 text-[10px] font-bold uppercase flex justify-between flex-none">
        <span>Lista de Cidades</span>
        <span>{{ locaisFiltrados.length }} registro(s)</span>
      </div>

      <div class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white overflow-auto"
        :class="janelaReal ? 'flex-1' : 'h-64'">
        <table class="w-full text-left text-sm border-collapse">
          <thead class="sticky top-0 bg-base-100 text-[9px] font-bold uppercase border-b border-base-300">
            <tr>
              <th class="p-1.5 border-r border-base-300 w-10 text-center">ID</th>
              <th class="p-1.5">Descrição</th>
              <th class="p-1.5 w-16 text-center">UF</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in locaisFiltrados" :key="l.id"
              class="border-b border-win-border-light hover:bg-primary hover:text-white group cursor-default">
              <td class="p-1.5 border-r border-win-border-light text-center font-mono text-xs text-win-dim group-hover:text-white">
                {{ l.id }}
              </td>
              <td class="p-1.5 group-hover:font-bold">
                {{ l.descricao }}
              </td>
              <td class="p-1.5 text-center font-semibold text-xs text-win-dim group-hover:text-white">
                {{ l.estado || '---' }}
              </td>
            </tr>
            <tr v-if="!locaisFiltrados.length">
              <td colspan="3" class="p-4 text-center text-win-dim italic text-xs">Nenhum local encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-2 flex justify-between items-center bg-base-100 flex-none">
      <span class="text-[9px] text-win-muted">CPG - Banco de Dados Geográfico</span>
      <button @click="emit('close')"
        class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white bg-base-100 text-xs py-1 px-6">
        Fechar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  janelaReal?: boolean
  zIndex?: number
  ativa?: boolean
}>(), {
  janelaReal: false,
  zIndex: 110,
  ativa: false,
})

const emit = defineEmits<{
  close: []
  trazerParaFrente: []
}>()

const { minimizar } = useJanela()

// ── Drag (só no modo embutido; em janela real o arraste é nativo) ──
const janela   = ref<HTMLElement | null>(null)
const pos      = ref({ x: 140, y: 70 })
let dragging   = false
let startMouse = { x: 0, y: 0 }
let startPos   = { x: 0, y: 0 }

function onTituloMouseDown(e: MouseEvent) {
  if (props.janelaReal) return
  e.preventDefault()
  iniciarDrag(e)
}

function iniciarDrag(e: MouseEvent) {
  dragging   = true
  startMouse = { x: e.clientX, y: e.clientY }
  startPos   = { x: pos.value.x, y: pos.value.y }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', pararDrag)
}

function onMove(e: MouseEvent) {
  if (!dragging) return
  const w = janela.value?.offsetWidth  ?? 520
  const h = janela.value?.offsetHeight ?? 480
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
  window.removeEventListener('mouseup', pararDrag)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', pararDrag)
})

// ── Dados ─────────────────────────────────────────────────────────────────
const filtro     = ref('')
const estado     = ref('')
const carregando = ref(false)
const erro       = ref(false)

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const { data: locais, refresh } = await useFetch('/api/local')

const locaisFiltrados = computed(() => {
  if (!locais.value) return []
  if (!filtro.value) return locais.value
  return locais.value.filter(l =>
    l.descricao.toLowerCase().includes(filtro.value.toLowerCase())
  )
})

const jaExiste = computed(() => {
  if (!locais.value) return false
  return locais.value.some(l =>
    l.descricao.toLowerCase() === filtro.value.trim().toLowerCase() &&
    l.estado === (estado.value || null)
  )
})

async function salvarLocal() {
  if (!filtro.value || jaExiste.value) return
  carregando.value = true
  erro.value = false
  try {
    await $fetch('/api/local', {
      method: 'POST',
      body: { descricao: filtro.value, estado: estado.value || null },
    })
    filtro.value = ''
    estado.value = ''
    refresh()
  } catch {
    erro.value = true
  } finally {
    carregando.value = false
  }
}
</script>
