<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-lg bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-[2px_2px_10px_rgba(0,0,0,0.5)]" >
      
      <div class="bg-[#0a246a] px-2 py-1 flex items-center justify-between mx-0.5 mt-0.5">
        <span class="text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
          <Icon name="lucide:map-pin" class="text-sm" />
          Gerenciador de Localidades
        </span>
        <button @click="$emit('close')" class="bg-[#d4d0c8] border border-t-white border-l-white border-r-black border-b-black w-4 h-4 flex items-center justify-center text-xs pb-0.5 leading-none shadow-sm hover:bg-[#e0e0e0] active:border-t-black active:border-l-black active:border-r-white active:border-b-white">
          ×
        </button>
      </div>

      <div class="p-4 bg-[#d4d0c8] space-y-3">
        <div>
          <label class="text-[10px] font-bold uppercase block mb-1">Nome da cidade:</label>
          <input 
            v-model="filtro" 
            type="text" 
            placeholder="Ex: Santa Maria"
            class="w-full bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1.5 text-sm outline-none focus:bg-[#ffffcc]"
          />
        </div>
        
        <div class="flex gap-4 items-end">
          <div class="w-28">
            <label class="text-[10px] font-bold uppercase block mb-1">Estado (UF):</label>
            <select 
              v-model="estado" 
              class="w-full bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1.5 text-sm outline-none focus:bg-[#ffffcc]"
            >
              <option value="">Nenhum</option>
              <option v-for="uf in estadosBrasileiros" :key="uf" :value="uf">{{ uf }}</option>
            </select>
          </div>

          <div class="flex-1">
            <button 
              @click="salvarLocal"
              :disabled="!filtro || carregando || jaExiste"
              class="w-full border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white bg-[#d4d0c8] text-xs py-2 font-bold disabled:opacity-50"
            >
              {{ jaExiste ? 'Já cadastrada' : 'Adicionar' }}
            </button>
          </div>
        </div>

        <p v-if="jaExiste" class="text-[9px] text-blue-800 font-bold italic">
          * Esta cidade com o mesmo estado já consta na base de dados.
        </p>
      </div>

      <div class="px-2 pb-2">
        <div class="bg-[#d4d0c8] border-x border-t border-[#808080] px-2 py-1 text-[10px] font-bold uppercase flex justify-between">
          <span>Lista de Cidades</span>
          <span>{{ locaisFiltrados.length }} registro(s)</span>
        </div>
        
        <div class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white h-64 overflow-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead class="sticky top-0 bg-[#d4d0c8] text-[9px] font-bold uppercase border-b border-[#808080]">
              <tr>
                <th class="p-1.5 border-r border-[#808080] w-10 text-center">ID</th>
                <th class="p-1.5">Descrição</th>
                <th class="p-1.5 w-16 text-center">UF</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in locaisFiltrados" :key="l.id" 
                class="border-b border-gray-100 hover:bg-[#0a246a] hover:text-white group cursor-default">
                <td class="p-1.5 border-r border-gray-200 text-center font-mono text-xs text-gray-500 group-hover:text-white">
                  {{ l.id }}
                </td>
                <td class="p-1.5 group-hover:font-bold">
                  {{ l.descricao }}
                </td>
                <td class="p-1.5 text-center font-semibold text-xs text-gray-500 group-hover:text-white">
                  {{ l.estado || '---' }}
                </td>
              </tr>
              <tr v-if="locaisFiltrados.length === 0">
                <td colspan="3" class="p-4 text-center text-gray-400 italic text-xs">Nenhum local encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="p-2 flex justify-between items-center bg-[#d4d0c8]">
        <span class="text-[9px] text-gray-600">CPG - Banco de Dados Geográfico</span>
        <button @click="$emit('close')" class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white bg-[#d4d0c8] text-xs py-1 px-6">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const filtro = ref('')
const estado = ref('')
const carregando = ref(false)

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
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
  try {
    await $fetch('/api/local', {
      method: 'POST',
      body: { 
        descricao: filtro.value,
        estado: estado.value || null // Envia null se o estado estiver vazio
      }
    })
    filtro.value = ''
    estado.value = ''
    refresh()
  } catch (err) {
    alert('Erro ao salvar local')
  } finally {
    carregando.value = false
  }
}

defineEmits(['close'])
</script>