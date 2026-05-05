<template>
  <div class="h-full p-6 bg-[#c0c0c0] overflow-auto font-sans">
    <div class="max-w-3xl mx-auto bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-md mb-10">
      
      <div class="bg-[#0a246a] px-2 py-1 flex items-center justify-between mx-0.5 mt-0.5">
        <span class="text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 italic">
          <Icon name="lucide:user-plus" class="text-sm not-italic" />
          Ficha de Cadastro de Pessoa
        </span>
        <button @click="$router.back()" class="bg-[#d4d0c8] border border-t-white border-l-white border-r-black border-b-black w-4 h-4 flex items-center justify-center text-xs pb-0.5 leading-none shadow-sm hover:bg-[#e0e0e0] active:border-t-black active:border-l-black active:border-r-white active:border-b-white">
          ×
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 space-y-6">
        
        <fieldset class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4">
          <legend class="text-[10px] font-bold px-2 uppercase text-[#404040]">Identificação Principal</legend>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase">Nome: <span class="text-red-600">*</span></label>
              <input v-model="form.nome" type="text" required 
                class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none focus:bg-[#ffffcc]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase">Sobrenome: <span class="text-red-600">*</span></label>
              <input v-model="form.sobrenome" type="text" required 
                class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none focus:bg-[#ffffcc]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase">Sexo:</label>
              <select v-model="form.sexo" 
                class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none focus:bg-[#ffffcc]">
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>
        </fieldset>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  
  <fieldset class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
    <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">Nascimento</legend>
    <div class="space-y-3">
      <input v-model="form.datanasc" type="date" 
        class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none w-full" />
      
      <div class="flex gap-2 items-center">
        <select v-model="form.localnasc" class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none w-full max-w-[78%] focus:bg-[#ffffcc]">
          <option :value="null">Selecione o local...</option>
          <option v-for="loc in locais" :key="loc.id" :value="loc.id">
            {{ loc.descricao }} <span v-if="loc.estado">- {{ loc.estado }}</span>
          </option>
        </select>
        <button type="button" @click="modalLocalAberto = true" 
          class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] px-2 py-1.5 w-1/5 text-[9px] font-bold hover:bg-[#e0e0e0] active:border-t-[#808080] active:border-r-white text-center leading-none"
          title="Cadastrar nova cidade">
          Novo
        </button>
      </div>
    </div>
  </fieldset>

  <fieldset class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
    <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">Batismo</legend>
    <div class="space-y-3">
      <input v-model="form.databatismo" type="date" 
        class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none w-full" />
      
      <div class="flex gap-2 items-center">
        <select v-model="form.localbatismo" class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none w-full max-w-[78%] focus:bg-[#ffffcc]">
          <option :value="null">Selecione o local...</option>
          <option v-for="loc in locais" :key="loc.id" :value="loc.id">
            {{ loc.descricao }} <span v-if="loc.estado">- {{ loc.estado }}</span>
          </option>
        </select>
        <button type="button" @click="modalLocalAberto = true" 
          class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] px-2 py-2.5 w-1/5 text-[9px] font-bold hover:bg-[#e0e0e0] active:border-t-[#808080] active:border-r-white text-center leading-none"
          title="Cadastrar nova cidade">
          Novo
        </button>
      </div>
    </div>
  </fieldset>

  <fieldset class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-3">
    <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">Morte</legend>
    <div class="space-y-3">
      <input v-model="form.datamorte" type="date" 
        class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none w-full" />
      
      <div class="flex gap-2 items-center">
        <select v-model="form.localmorte" class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none w-full max-w-[78%] focus:bg-[#ffffcc]">
          <option :value="null">Selecione o local...</option>
          <option v-for="loc in locais" :key="loc.id" :value="loc.id">
            {{ loc.descricao }} <span v-if="loc.estado">- {{ loc.estado }}</span>
          </option>
        </select>
        <button type="button" @click="modalLocalAberto = true" 
          class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] px-2 py-1.5 w-1/5 text-[9px] font-bold hover:bg-[#e0e0e0] active:border-t-[#808080] active:border-r-white text-center leading-none"
          title="Cadastrar nova cidade">
          Novo
        </button>
      </div>
    </div>
  </fieldset>

</div>

        <div class="flex flex-col gap-1 px-1">
          <label class="text-[10px] font-bold uppercase">Biografia / Observações:</label>
          <textarea v-model="form.obs" 
            class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1 text-sm outline-none h-24 resize-none focus:bg-[#ffffcc]"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-[#808080]">
          <button type="button" @click="$router.back()" 
            class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white bg-[#d4d0c8] text-xs py-1 px-6">
            Cancelar
          </button>
          <button type="submit" :disabled="loading"
            class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white bg-[#d4d0c8] text-xs py-1 px-10 font-bold disabled:opacity-50">
            {{ loading ? 'Gravando...' : 'Gravar Ficha' }}
          </button>
        </div>
      </form>
    </div>

    <ModalLocal v-if="modalLocalAberto" @close="modalLocalAberto = false" />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const loading = ref(false)
const modalLocalAberto = ref(false)

// Carrega as localidades para o Dropdown
const { data: locais } = await useFetch('/api/local')

const form = ref({
  nome: '',
  sobrenome: '',
  sexo: 'M',
  datanasc: '',
  localnasc: null,
  databatismo: '',
  localbatismo: null,
  datamorte: '',
  localmorte: null,
  obs: '',
  relacoes: []
})

async function handleSubmit() {
  loading.value = true
  
  const payload = JSON.parse(JSON.stringify(form.value))
  
  const dateFields = ['datanasc', 'databatismo', 'datamorte']
  const idFields = ['localnasc', 'localbatismo', 'localmorte']

  dateFields.forEach(field => { if (!payload[field]) payload[field] = null })
  idFields.forEach(field => { if (!payload[field]) payload[field] = null })

  try {
    await $fetch('/api/pessoa', {
      method: 'POST',
      body: payload
    })
    alert('Ficha cadastrada com sucesso!')
    router.push('/')
  } catch (err: any) {
    console.error(err)
    alert('Erro ao gravar: ' + (err.data?.message || 'Verifique os dados'))
  } finally {
    loading.value = false
  }
}
</script>