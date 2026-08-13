<template>
  <div
    ref="janela"
    class="bg-base-100 border-2 border-t-white border-l-white border-r-win-text border-b-win-text flex flex-col font-sans select-none"
    :class="janelaReal ? 'w-screen h-screen' : 'absolute pointer-events-auto shadow-[2px_2px_0_#000]'"
    :style="janelaReal ? undefined : { left: pos.x + 'px', top: pos.y + 'px', width: '900px', height: '620px', zIndex }"
    @mousedown="janelaReal ? null : emit('trazerParaFrente', pessoaId)"
  >
    <!-- Barra de título -->
    <div
      class="flex-none flex items-center justify-between px-2 py-1 mx-0.5 mt-0.5"
      :class="[tituloAtivo ? 'bg-win-navy' : 'bg-win-dim', janelaReal ? '' : 'cursor-move']"
      :style="(janelaReal ? { '-webkit-app-region': 'drag' } : undefined) as any"
      @mousedown="onTituloMouseDown"
    >
      <span class="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2 pointer-events-none">
        <Icon name="lucide:git-fork" class="text-sm" />
        Árvore — {{ nome }}
      </span>
      <div class="flex gap-0.5"
        :style="({ pointerEvents: 'all', ...(janelaReal ? { '-webkit-app-region': 'no-drag' } : {}) }) as any">
        <button v-if="janelaReal" @click.stop="minimizar()"
          class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-6 h-6 flex items-center justify-center text-sm font-bold hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white cursor-pointer">
          -
        </button>
        <button @click.stop="emit('fechar')"
          class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-6 h-6 flex items-center justify-center text-sm font-bold hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white cursor-pointer">
          ×
        </button>
      </div>
    </div>

    <!-- Árvore -->
    <div class="flex-1 overflow-hidden relative">
      <div v-if="carregando"
        class="w-full h-full flex items-center justify-center text-sm text-win-text animate-pulse uppercase tracking-widest bg-base-100">
        Carregando árvore...
      </div>
      <div v-else-if="erro"
        class="w-full h-full flex items-center justify-center text-sm text-red-600 bg-base-100">
        Não foi possível carregar a árvore desta pessoa.
      </div>
      <ClientOnly>
        <FamilyTree
          v-if="arvore.length"
          :data="arvore"
          :main="String(pessoaId)"
          :on-card-click="(id: number) => emit('abrirPessoa', id)"
          style="width:100%;height:100%;min-height:560px;"
        />
      </ClientOnly>
      <div v-if="carregandoMais"
        class="absolute bottom-2 right-2 bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-1 text-[10px] font-bold uppercase animate-pulse pointer-events-none">
        Expandindo árvore...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  pessoaId: number
  nome: string
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
  abrirPessoa: [id: number]
  trazerParaFrente: [id: number]
}>()

const { minimizar } = useJanela()
const tituloAtivo = computed(() => props.janelaReal || props.ativa)

function onTituloMouseDown(e: MouseEvent) {
  if (props.janelaReal) return
  e.preventDefault()
  iniciarDrag(e)
}

const janela         = ref<HTMLElement | null>(null)
const pos            = ref({ x: 60 + props.offset * 25, y: 30 + props.offset * 25 })
const carregando     = ref(true)
const carregandoMais = ref(false)
const erro           = ref(false)
const arvore         = ref<any[]>([])

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
  const w   = janela.value?.offsetWidth  ?? 900
  const h   = janela.value?.offsetHeight ?? 620
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

onMounted(async () => {
  // Carrega em 3 profundidades: diretos → próximos → completo
  const PROFUNDIDADES = [1, 5, 99999]
  try {
    for (const depth of PROFUNDIDADES) {
      const dados = await $fetch<any[]>('/api/arvore/', {
        query: { id: props.pessoaId, depth }
      })

      if (!dados?.length) {
        if (!arvore.value.length) erro.value = true
        break
      }

      const temNovos = dados.length > arvore.value.length
      arvore.value   = dados   // cada profundidade inclui as anteriores
      carregando.value = false  // mostra o que chegou

      if (!temNovos) break  // árvore completa, para

      if (depth !== 99999) {
        carregandoMais.value = true
        await new Promise(r => setTimeout(r, 250))
      }
    }
  } catch (e) {
    console.error('Erro ao carregar árvore:', e)
    if (!arvore.value.length) erro.value = true
  } finally {
    carregando.value     = false
    carregandoMais.value = false
  }
})
</script>
