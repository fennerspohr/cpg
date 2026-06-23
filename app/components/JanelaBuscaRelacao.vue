<template>
  <div
    class="absolute pointer-events-auto bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-[2px_2px_0_#000] flex flex-col font-sans select-none"
    :style="{ left: pos.x + 'px', top: pos.y + 'px', width: '900px', height: '680px', zIndex: zIndex }"
  >
    <!-- Barra de título -->
    <div class="flex-none flex items-center justify-between bg-primary px-2 py-1 mx-0.5 mt-0.5 cursor-move"
      @mousedown.prevent="iniciarDrag">
      <span class="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2 pointer-events-none">
        <Icon name="lucide:git-merge" class="text-sm" />
        Buscar Relação Entre Pessoas
      </span>
      <button @click.stop="$emit('fechar')"
        class="bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-6 h-6 flex items-center justify-center text-sm font-bold hover:brightness-110 cursor-pointer"
        style="pointer-events: all">×</button>
    </div>

    <div class="flex flex-1 min-h-0 overflow-hidden">

      <!-- PAINEL ESQUERDO -->
      <div class="flex-none w-72 border-r-2 border-[#808080] flex flex-col overflow-y-auto">

        <!-- Pessoa 1 -->
        <div class="border-b-2 border-[#808080] p-3 flex flex-col gap-2">
          <p class="text-xs font-bold uppercase text-black tracking-widest">Pessoa 1</p>
          <input v-model="busca1" type="text" placeholder="Buscar por nome..."
            class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1 text-xs outline-none w-full" />
          <div v-if="pessoa1"
            class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-1.5 flex items-center justify-between"
            :style="{ backgroundColor: pessoa1.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }">
            <div>
              <p class="text-xs font-bold uppercase">{{ pessoa1.sobrenome }}, {{ pessoa1.nome }}</p>
              <p class="text-[9px] text-[#404040]">b.: {{ pessoa1.datanasc?.substring(0,4) ?? '—' }}</p>
            </div>
            <button @click="pessoa1 = null" class="text-[#808080] hover:text-red-600 text-xs font-bold ml-2">×</button>
          </div>
          <p v-else class="text-xs text-[#808080] italic">Nenhuma selecionada</p>
          <div v-if="busca1 && resultados1.length"
            class="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white max-h-36 overflow-y-auto">
            <button v-for="p in resultados1" :key="p.id" @click="selecionarPessoa1(p)"
              class="w-full text-left px-2 py-1 text-xs hover:bg-[#000080] hover:text-white border-b border-gray-100 uppercase font-bold"
              :style="{ color: p.sexo === 'M' ? 'var(--color-male,#336699)' : 'var(--color-female,#993366)' }">
              {{ p.sobrenome }}, {{ p.nome }}
              <span class="font-normal text-gray-400">({{ p.datanasc?.substring(0,4) ?? '?' }})</span>
            </button>
          </div>
          <p v-else-if="busca1 && !resultados1.length" class="text-[10px] text-[#808080] italic">Nenhum resultado.</p>
        </div>

        <!-- Pessoa 2 -->
        <div class="border-b-2 border-[#808080] p-3 flex flex-col gap-2">
          <p class="text-xs font-bold uppercase text-black tracking-widest">Pessoa 2</p>
          <input v-model="busca2" type="text" placeholder="Buscar por nome..."
            class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1 text-xs outline-none w-full" />
          <div v-if="pessoa2"
            class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-1.5 flex items-center justify-between"
            :style="{ backgroundColor: pessoa2.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }">
            <div>
              <p class="text-xs font-bold uppercase">{{ pessoa2.sobrenome }}, {{ pessoa2.nome }}</p>
              <p class="text-[9px] text-[#404040]">b.: {{ pessoa2.datanasc?.substring(0,4) ?? '—' }}</p>
            </div>
            <button @click="pessoa2 = null" class="text-[#808080] hover:text-red-600 text-xs font-bold ml-2">×</button>
          </div>
          <p v-else class="text-xs text-[#808080] italic">Nenhuma selecionada</p>
          <div v-if="busca2 && resultados2.length"
            class="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white max-h-36 overflow-y-auto">
            <button v-for="p in resultados2" :key="p.id" @click="selecionarPessoa2(p)"
              class="w-full text-left px-2 py-1 text-xs hover:bg-[#000080] hover:text-white border-b border-gray-100 uppercase font-bold"
              :style="{ color: p.sexo === 'M' ? 'var(--color-male,#336699)' : 'var(--color-female,#993366)' }">
              {{ p.sobrenome }}, {{ p.nome }}
              <span class="font-normal text-gray-400">({{ p.datanasc?.substring(0,4) ?? '?' }})</span>
            </button>
          </div>
          <p v-else-if="busca2 && !resultados2.length" class="text-[10px] text-[#808080] italic">Nenhum resultado.</p>
        </div>

        <!-- Botão buscar -->
        <div class="p-3">
          <button @click="buscarRelacao" :disabled="!pessoa1 || !pessoa2 || buscando"
            class="w-full border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] py-2 text-xs font-bold uppercase hover:brightness-110 disabled:opacity-40 flex items-center justify-center gap-2 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white">
            <Icon name="lucide:search" class="text-xs" />
            {{ buscando ? 'Buscando...' : 'Buscar Relação' }}
          </button>
        </div>

        <!-- Status -->
        <div v-if="status" class="mx-3 mb-3 px-3 py-2 border-2 text-xs font-bold uppercase text-center"
          :class="status.tipo === 'erro'
            ? 'border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-red-100 text-red-700'
            : 'border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-green-50 text-green-800'">
          {{ status.msg }}
        </div>
      </div>

      <!-- PAINEL DIREITO: resultado -->
      <div class="flex-1 overflow-auto">
        <div v-if="!resultado && !buscando && !status"
          class="h-full flex flex-col items-center justify-center gap-3 text-[#808080]">
          <Icon name="lucide:git-merge" class="text-4xl" />
          <p class="text-sm uppercase tracking-widest text-center px-8">
            Selecione duas pessoas e clique em buscar para encontrar o caminho de parentesco
          </p>
        </div>
        <div v-else-if="buscando"
          class="h-full flex items-center justify-center text-sm text-[#404040] animate-pulse uppercase tracking-widest">
          Calculando caminho...
        </div>
        <div v-else-if="status?.tipo === 'erro'"
          class="h-full flex flex-col items-center justify-center gap-3">
          <Icon name="lucide:unlink" class="text-4xl text-red-400" />
          <p class="text-sm font-bold uppercase text-red-600">Pessoas não relacionadas</p>
          <p class="text-xs text-[#808080]">Não foi encontrado nenhum caminho entre as duas pessoas.</p>
        </div>
        <div v-else-if="resultado?.length" class="p-4 flex flex-col gap-2">
          <p class="text-xs font-bold uppercase text-black tracking-widest">
            Caminho encontrado — {{ resultado.length }} pessoa(s) na linha
          </p>
          <ClientOnly>
            <PathChartView
              :data="resultado"
              :main="String(pessoa1?.id)"
              @card-click="(p) => $emit('abrirPessoa', p)"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PathChartView from './PathchartView.vue'

interface Pessoa {
  id: number; nome: string; sobrenome: string; sexo: string | null
  datanasc: string | null; datamorte: string | null; databatismo: string | null
  localnasc: number | null; localbatismo: number | null; localmorte: number | null; obs: string | null
}

const props = defineProps<{
  zIndex: number
  offset?: number
  pessoaInicial?: Pessoa | null  // pré-preenche pessoa 1
}>()

const emit = defineEmits<{
  fechar: []
  abrirPessoa: [pessoa: Pessoa]
}>()

const pos = ref({ x: 100, y: 80 })

// Drag
let dragging = false, startMouse = { x: 0, y: 0 }, startPos = { x: 0, y: 0 }
function iniciarDrag(e: MouseEvent) {
  dragging = true; startMouse = { x: e.clientX, y: e.clientY }; startPos = { x: pos.value.x, y: pos.value.y }
  window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', pararDrag)
}
function onMove(e: MouseEvent) {
  if (!dragging) return
  pos.value = { x: startPos.x + (e.clientX - startMouse.x), y: startPos.y + (e.clientY - startMouse.y) }
}
function pararDrag() {
  dragging = false
  window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', pararDrag)
}
onUnmounted(() => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', pararDrag) })

// Pré-preenche pessoa 1 se veio do botão da ficha
const pessoa1 = ref<Pessoa | null>(props.pessoaInicial ?? null)
const pessoa2 = ref<Pessoa | null>(null)
const busca1  = ref('')
const busca2  = ref('')

const { data: todasPessoas } = await useFetch<Pessoa[]>('/api/pessoa')

const resultados1 = computed(() => {
  if (!busca1.value || !todasPessoas.value) return []
  const q = busca1.value.toLowerCase()
  return todasPessoas.value.filter(p =>
    (p.nome + ' ' + p.sobrenome).toLowerCase().includes(q) || String(p.id).includes(q)
  ).slice(0, 8)
})

const resultados2 = computed(() => {
  if (!busca2.value || !todasPessoas.value) return []
  const q = busca2.value.toLowerCase()
  return todasPessoas.value.filter(p =>
    (p.nome + ' ' + p.sobrenome).toLowerCase().includes(q) || String(p.id).includes(q)
  ).slice(0, 8)
})

function selecionarPessoa1(p: Pessoa) { pessoa1.value = p; busca1.value = ''; resultado.value = null; status.value = null }
function selecionarPessoa2(p: Pessoa) { pessoa2.value = p; busca2.value = ''; resultado.value = null; status.value = null }

const buscando  = ref(false)
const resultado = ref<any[] | null>(null)
const status    = ref<{ tipo: 'ok' | 'erro'; msg: string } | null>(null)

async function buscarRelacao() {
  if (!pessoa1.value || !pessoa2.value) return
  buscando.value = true; resultado.value = null; status.value = null
  try {
    const data = await $fetch<any[]>('/api/arvore/', {
      query: { id: pessoa1.value.id, id2: pessoa2.value.id }
    })
    if (!data || data.length === 0) {
      status.value = { tipo: 'erro', msg: 'Pessoas não relacionadas — nenhum caminho encontrado.' }
    } else {
      resultado.value = data
      status.value = { tipo: 'ok', msg: `Caminho de ${data.length} pessoa(s) encontrado!` }
    }
  } catch {
    status.value = { tipo: 'erro', msg: 'Pessoas não relacionadas — nenhum caminho encontrado.' }
  } finally {
    buscando.value = false
  }
}
</script>