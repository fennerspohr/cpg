<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
    <div class="bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-[4px_4px_10px_rgba(0,0,0,0.5)]" style="width: 400px;">
      
      <div class="bg-[#0a246a] px-2 py-1 flex items-center justify-between mx-0.5 mt-0.5">
        <span class="text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
          <Icon name="lucide:user-plus" /> Cadastro Rápido de Parente
        </span>
        <button @click="$emit('close')" class="bg-[#d4d0c8] border border-t-white border-l-white border-r-black border-b-black w-4 h-4 text-[10px] leading-none hover:bg-[#e0e0e0]">×</button>
      </div>

      <div class="p-4 space-y-4 bg-[#d4d0c8]">
        <div class="space-y-3">
          <div>
            <label class="text-[9px] font-bold uppercase block mb-1">Nome:</label>
            <input v-model="quickForm.nome" type="text" class="w-full bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none focus:bg-[#ffffcc]" />
          </div>
          <div>
            <label class="text-[9px] font-bold uppercase block mb-1">Sobrenome:</label>
            <input v-model="quickForm.sobrenome" type="text" class="w-full bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none focus:bg-[#ffffcc]" />
          </div>
          <div class="flex gap-2">
           
            <div class="w-24">
              <label class="text-[9px] font-bold uppercase block mb-1">Sexo:</label>
              <select v-model="quickForm.sexo" class="w-full bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none">
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="p-2 flex justify-end gap-2 bg-[#d4d0c8] border-t border-[#808080]">
        <button @click="$emit('close')" class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs py-1 px-4 active:border-t-[#808080]">Cancelar</button>
        <button 
          @click="salvarRapido" 
          :disabled="!quickForm.nome || !quickForm.sobrenome || carregando" 
          class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold text-xs py-1 px-6 bg-[#d4d0c8] disabled:opacity-50 active:border-t-[#808080]"
        >
          {{ carregando ? '...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close', 'saved'])
const carregando = ref(false)

const quickForm = ref({
  nome: '',
  sobrenome: '',
  sexo: 'M',
  relacoes: [] 
})

async function salvarRapido() {
  carregando.value = true
  try {
    const data = await $fetch('/api/pessoa', {
      method: 'POST',
      body: quickForm.value
    })
    emit('saved', data)
  } catch (err) {
    const { error } = useAppAlert()
    error('Erro ao realizar cadastro rápido.')
  } finally {
    carregando.value = false
  }
}
</script>