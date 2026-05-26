<template>
  <div class="relative" ref="wrapper">
    
    <div
      @click="abrir"
      class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-xs cursor-pointer flex items-center justify-between min-h-[26px] select-none"
      :class="disabled ? 'opacity-50 cursor-not-allowed' : ''"
    >
      <span :class="valorSelecionado ? 'text-black' : 'text-gray-400'">
        {{ valorSelecionado ? labelSelecionado : placeholder }}
      </span>
      <span class="text-[10px] ml-1">▼</span>
    </div>

    <div
      v-if="aberto"
      class="absolute z-50 top-full left-0 right-0 bg-[#d4d0c8] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white shadow-md"
      style="min-width: 180px"
    >
      <div class="p-1 border-b border-[#808080]">
        <input
          ref="inputBusca"
          v-model="busca"
          type="text"
          placeholder="Buscar cidade..."
          class="w-full bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-1 py-0.5 text-xs outline-none"
          @keydown.escape="fechar"
          @keydown.enter.prevent="selecionarPrimeiro"
        />
      </div>

      <div class="overflow-y-auto" style="max-height: 140px">
        <div
          @click="selecionar(null)"
          class="px-2 py-0.5 text-xs cursor-pointer hover:bg-[#000080] hover:text-white italic text-gray-500"
        >
          {{ placeholder }}
        </div>
        <div
          v-for="loc in locaisFiltrados"
          :key="loc.id"
          @click="selecionar(loc.id)"
          class="px-2 py-0.5 text-xs cursor-pointer hover:bg-[#000080] hover:text-white"
          :class="loc.id === modelValue ? 'bg-[#000080] text-white' : ''"
        >
          {{ loc.descricao }}{{ loc.estado ? ' - ' + loc.estado : '' }}
        </div>
        <div v-if="locaisFiltrados.length === 0" class="px-2 py-1 text-xs text-gray-400 italic">
          Nenhuma cidade encontrada
        </div>
      </div>

      <div class="border-t border-[#808080] p-1">
        <button
          type="button"
          @click="$emit('novoLocal'); fechar()"
          class="w-full text-[9px] font-bold uppercase border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] py-0.5 hover:brightness-110 text-left px-1"
        >
          + Cadastrar cidade...
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Local { id: number; descricao: string; estado: string | null }

const props = defineProps<{
  modelValue: number | null
  locais: Local[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [val: number | null]
  'novoLocal': []
}>()

const aberto = ref(false)
const busca = ref('')
const wrapper = ref<HTMLElement>()
const inputBusca = ref<HTMLInputElement>()

const locaisFiltrados = computed(() =>
  props.locais.filter(l =>
    (l.descricao + ' ' + (l.estado ?? '')).toLowerCase().includes(busca.value.toLowerCase())
  )
)

const labelSelecionado = computed(() => {
  const loc = props.locais.find(l => l.id === props.modelValue)
  return loc ? `${loc.descricao}${loc.estado ? ' - ' + loc.estado : ''}` : ''
})

const valorSelecionado = computed(() => props.modelValue !== null && props.modelValue !== undefined)

function abrir() {
  if (props.disabled) return
  aberto.value = true
  busca.value = ''
  nextTick(() => inputBusca.value?.focus())
}

function fechar() {
  aberto.value = false
}

function selecionar(id: number | null) {
  emit('update:modelValue', id)
  fechar()
}

function selecionarPrimeiro() {
  const primeiro = locaisFiltrados.value?.[0]
  if (primeiro) {
    selecionar(primeiro.id)
  }
}

// Fecha ao clicar fora
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
      fechar()
    }
  })
})
</script>