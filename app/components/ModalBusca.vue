<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-[4px_4px_10px_rgba(0,0,0,0.5)]" style="width: 450px;">
      
      <div class="bg-[#0a246a] px-2 py-1 flex items-center justify-between mx-0.5 mt-0.5">
        <span class="text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
          <Icon name="lucide:search" class="text-sm" /> Localizar Pessoa
        </span>
        <button @click="$emit('close')" class="bg-[#d4d0c8] border border-t-white border-l-white border-r-black border-b-black w-4 h-4 text-[10px] hover:bg-[#e0e0e0]">×</button>
      </div>

      <div class="p-6 bg-[#d4d0c8] space-y-4">
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-bold uppercase text-[#404040]">Digite o Nome, Sobrenome ou ID:</label>
          <div class="flex gap-2">
            <input 
              v-model="termoBusca" 
              type="text" 
              placeholder="Ex: Dallalana ou 001..."
              @keyup.enter="executarBusca"
              class="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-sm outline-none focus:bg-[#ffffcc]"
              autofocus
            />
          </div>
          <p class="text-[9px] text-gray-600 italic">* Deixe em branco para listar todos os registros.</p>
        </div>
      </div>

      <div class="p-2 flex justify-end gap-2 bg-[#d4d0c8] border-t border-[#808080]">
        <button @click="$emit('close')" class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs py-1 px-6 active:border-t-[#808080]">
          Cancelar
        </button>
        <button @click="executarBusca" class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold text-xs py-1 px-8 bg-[#d4d0c8] active:border-t-[#808080]">
          Localizar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const termoBusca = ref('')
const emit = defineEmits(['close'])
const router = useRouter()

function executarBusca() {
  router.push({
    path: '/',
    query: { q: termoBusca.value }
  })
  emit('close')
}
</script>