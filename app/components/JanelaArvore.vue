<template>
  <div
    class="absolute pointer-events-auto bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-[2px_2px_0_#000] flex flex-col font-sans select-none"
    :style="{
      left: pos.x + 'px',
      top:  pos.y + 'px',
      width: '900px',
      height: '620px',
      zIndex: zIndex,
    }"
  >
    <!-- titulo da janela -->
    <div
      class="flex-none flex items-center justify-between bg-primary px-2 py-1 mx-0.5 mt-0.5 cursor-move"
      @mousedown.prevent="iniciarDrag"
    >
      <span class="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2 pointer-events-none">
        <Icon name="lucide:git-fork" class="text-sm" />
        Árvore — {{ nome }}
      </span>
      <button @click.stop="$emit('fechar')"
        class="bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-6 h-6 flex items-center justify-center text-sm font-bold hover:brightness-110 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white cursor-pointer"
        style="pointer-events: all">
        ×
      </button>
    </div>

    <!-- arvore em si -->
    <div class="flex-1 overflow-hidden">
      <div v-if="carregando"
        class="w-full h-full flex items-center justify-center text-sm text-[#404040] animate-pulse uppercase tracking-widest bg-[#d4d0c8]">
        Carregando árvore...
      </div>
      <div v-else-if="erro"
        class="w-full h-full flex items-center justify-center text-sm text-red-600 bg-[#d4d0c8]">
        Não foi possível carregar a árvore desta pessoa.
      </div>
      <!-- igual a pagina de arvore só q dentro da janela -->
      <ClientOnly>
        <Familytree
          v-if="!carregando && !erro && arvore.length"
          :data="arvore"
          :main="String(pessoaId)"
          style="width:100%;height:100%"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pessoaId: number
  nome: string
  zIndex: number
  offset: number
}>()

defineEmits<{ fechar: [] }>()

const pos        = ref({ x: 60 + props.offset * 25, y: 30 + props.offset * 25 })
const carregando = ref(true)
const erro       = ref(false)
const arvore     = ref<any[]>([])

// poder arrastar a janela
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
  pos.value = {
    x: startPos.x + (e.clientX - startMouse.x),
    y: startPos.y + (e.clientY - startMouse.y),
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

onMounted(async () => {
  try {
    const data = await $fetch<any[]>('/api/arvore/', { query: { id: props.pessoaId } })
    if (!data?.length) {
      erro.value = true
    } else {
      arvore.value = data
    }
  } catch (e) {
    console.error('Erro ao carregar árvore:', e)
    erro.value = true
  } finally {
    carregando.value = false
  }
})
</script>