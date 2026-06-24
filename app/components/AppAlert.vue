<template>
  <Teleport to="body">
    <div
      v-if="state.visible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4"
      @keydown.enter="close"
      @keydown.esc="close"
    >
      <div class="w-full max-w-sm bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 shadow-[2px_2px_10px_rgba(0,0,0,0.5)]">

        <div
          class="px-2 py-1 flex items-center justify-between mx-0.5 mt-0.5"
          :class="headerColor"
        >
          <span class="text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
            <Icon :name="icon" class="text-sm" />
            {{ titulo }}
          </span>
          <button
            @click="close"
            class="bg-base-100 border border-t-white border-l-white border-r-black border-b-black w-4 h-4 flex items-center justify-center text-xs pb-0.5 leading-none shadow-sm hover:bg-[#e0e0e0] active:border-t-black active:border-l-black active:border-r-white active:border-b-white"
          >
            ×
          </button>
        </div>

        <div class="p-4 bg-base-100">
          <p class="text-sm">{{ state.message }}</p>
        </div>

        <div class="p-2 flex justify-end bg-base-100">
          <button
            ref="okButton"
            @click="close"
            class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white bg-base-100 text-xs py-1 px-6 font-bold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { state, close } = useAppAlert()
const okButton = ref<HTMLButtonElement | null>(null)

const titulo = computed(() => {
  if (state.type === 'success') return 'Sucesso'
  if (state.type === 'error') return 'Erro'
  return 'Aviso'
})

const icon = computed(() => {
  if (state.type === 'success') return 'lucide:check-circle'
  if (state.type === 'error') return 'lucide:x-circle'
  return 'lucide:info'
})

const headerColor = computed(() => {
  if (state.type === 'error') return 'bg-red-700'
  if (state.type === 'success') return 'bg-green-700'
  return 'bg-primary'
})

// Garante que o foco fique no botao OK quando o alerta abre,
// e que volte para o conteudo da pagina ao fechar (sem precisar
// do Alt+Tab que o alert() nativo exigia no Windows).
watch(() => state.visible, async (visible) => {
  if (visible) {
    await nextTick()
    okButton.value?.focus()
  }
})
</script>
