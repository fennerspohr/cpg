<template>
  <div class="h-full p-6 bg-[#c0c0c0] overflow-auto font-sans">
    <div class="max-w-3xl mx-auto bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 shadow-md mb-10">
      
      <div class="bg-primary px-2 py-1 flex items-center justify-between mx-0.5 mt-0.5">
        <span class="text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 italic">
          <Icon name="lucide:user-plus" class="text-sm not-italic" />
          Ficha de Cadastro de Pessoa
        </span>
        <button @click="$router.back()" class="bg-base-100 border border-t-white border-l-white border-r-black border-b-black w-4 h-4 flex items-center justify-center text-xs pb-0.5 shadow-sm hover:bg-[#e0e0e0]">
          ×
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 space-y-6">
        
        <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 p-4">
          <legend class="text-[10px] font-bold px-2 uppercase text-[#404040]">Identificação Principal</legend>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase text-[#404040]">Nome: <span class="text-red-600">*</span></label>
              <input v-model="form.nome" type="text" required class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1 text-sm outline-none focus:bg-[#ffffcc]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase text-[#404040]">Sobrenome: <span class="text-red-600">*</span></label>
              <input v-model="form.sobrenome" type="text" required class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1 text-sm outline-none focus:bg-[#ffffcc]" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase text-[#404040]">Sexo:</label>
              <select v-model="form.sexo" class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1 text-sm outline-none">
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>
        </fieldset>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <fieldset v-for="ev in eventos" :key="ev.chave" class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 p-3">
            <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">{{ ev.label }}</legend>
            <div class="space-y-3">
              <input v-model="form['data' + ev.chave]" type="date" class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1 text-sm outline-none w-full" />
              <div class="flex gap-2 items-center">
                <select v-model="form['local' + ev.chave]" class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1 text-sm outline-none w-full max-w-[78%] focus:bg-[#ffffcc]">
                  <option :value="null">Local...</option>
                  <option v-for="loc in locais" :key="loc.id" :value="loc.id">
                    {{ loc.descricao }} {{ loc.estado ? '- ' + loc.estado : '' }}
                  </option>
                </select>
                <button type="button" @click="modalLocalAberto = true" class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-2 py-1.5 w-1/5 text-[9px] font-bold hover:bg-[#e0e0e0]">
                  Novo
                </button>
              </div>
            </div>
          </fieldset>
        </div>

        <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 p-4">
          <legend class="text-[10px] font-bold px-2 uppercase text-[#404040]">Vínculos Familiares</legend>
          <div class="space-y-2">
            <div v-for="(rel, index) in form.relacoes" :key="index" class="flex gap-2 items-end bg-[#e0e0e0] p-2 border border-white shadow-sm">
              <div class="flex-1">
                <label class="text-[9px] font-bold uppercase block mb-1">Parente:</label>
                <div class="flex gap-1">
                  <select v-model="rel.p2" class="w-full bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1 text-xs outline-none">
                    <option :value="null">Selecione...</option>
                    <option v-for="p in pessoasExistentes" :key="p.id" :value="p.id">
                      {{ p.sobrenome }}, {{ p.nome }} (ID: {{ p.id }})
                    </option>
                  </select>
                  <button type="button" @click="abrirCadastroRapido(index)" class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-2 text-[10px] font-bold hover:bg-[#e0e0e0]">
                    Novo
                  </button>
                </div>
              </div>

              <div class="flex-1">
                <label class="text-[9px] font-bold uppercase block mb-1">Vínculo:</label>
                <select v-model="rel.rel" class="w-full bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1 text-xs outline-none">
                  <option :value="null">Tipo...</option>
                  <option v-for="tipo in tiposRelacao" :key="tipo.id" :value="tipo.id">
                    {{ tipo.descricao }}
                  </option>
                </select>
              </div>

              <button type="button" @click="removerRelacao(index)" class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-2 h-7 text-xs font-bold text-red-600 hover:bg-red-50">×</button>
            </div>

            <button type="button" @click="adicionarRelacao" class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 py-1 text-[10px] font-bold uppercase hover:bg-[#e0e0e0]">
              + Adicionar Vínculo
            </button>
          </div>
        </fieldset>

        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase text-[#404040]">Biografia / Observações:</label>
          <textarea v-model="form.obs" class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white p-1 text-sm outline-none h-24 resize-none focus:bg-[#ffffcc]"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-base-300">
          <button type="button" @click="$router.back()" class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 text-xs py-1 px-6 active:border-t-base-300">Cancelar</button>
          <button type="submit" :disabled="loading" class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 text-xs py-1 px-10 font-bold disabled:opacity-50 active:border-t-base-300">
            {{ loading ? 'Gravando...' : 'Gravar Ficha' }}
          </button>
        </div>
      </form>
    </div>

    <ModalLocal v-if="modalLocalAberto" @close="modalLocalAberto = false" />
    <ModalCadastroRapido v-if="modalRapidoAberto" @close="modalRapidoAberto = false" @saved="pessoaCadastradaComSucesso" />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const loading = ref(false)
const modalLocalAberto = ref(false)
const modalRapidoAberto = ref(false)
const indexRelacaoSendoEditada = ref<number | null>(null)

interface PessoaForm {
  [key: string]: any;
  nome: string;
  sobrenome: string;
  sexo: string;
  datanasc: string | null;
  localnasc: number | null;
  databatismo: string | null;
  localbatismo: number | null;
  datamorte: string | null;
  localmorte: number | null;
  obs: string;
  relacoes: any[];
}

const eventos = [
  { chave: 'nasc', label: 'Nascimento' },
  { chave: 'batismo', label: 'Batismo' },
  { chave: 'morte', label: 'Morte' }
]

const { data: locais } = await useFetch<any[]>('/api/local')
const { data: tiposRelacao } = await useFetch<any[]>('/api/tipo_relacao')
const { data: pessoasExistentes, refresh: refreshPessoas } = await useFetch<any[]>('/api/pessoa')

const form = ref<PessoaForm>({
  nome: '', sobrenome: '', sexo: 'M',
  datanasc: '', localnasc: null,
  databatismo: '', localbatismo: null,
  datamorte: '', localmorte: null,
  obs: '', relacoes: []
})

function adicionarRelacao() {
  form.value.relacoes.push({ p2: null, rel: null, metadata: {} })
}

function removerRelacao(index: number) {
  form.value.relacoes.splice(index, 1)
}

function abrirCadastroRapido(index: number) {
  indexRelacaoSendoEditada.value = index
  modalRapidoAberto.value = true
}

async function pessoaCadastradaComSucesso(novaPessoa: any) {
  modalRapidoAberto.value = false
  await refreshPessoas() // Recarrega a lista para o select
  if (indexRelacaoSendoEditada.value !== null) {
    form.value.relacoes[indexRelacaoSendoEditada.value].p2 = novaPessoa.id
  }
  indexRelacaoSendoEditada.value = null
}

async function handleSubmit() {
  loading.value = true
  const payload = JSON.parse(JSON.stringify(form.value))
  const camposData = ['datanasc', 'databatismo', 'datamorte']
  const camposLocal = ['localnasc', 'localbatismo', 'localmorte']
  
  camposData.forEach(f => { if (!payload[f]) payload[f] = null })
  camposLocal.forEach(f => { if (!payload[f]) payload[f] = null })
  payload.relacoes = payload.relacoes.filter((r: any) => r.p2 && r.rel)

  try {
    await $fetch('/api/pessoa', { method: 'POST', body: payload })
    alert('Cadastro concluído!')
    router.push('/')
  } catch (err: any) {
    alert('Erro ao gravar: ' + (err.data?.message || 'Verifique os dados.'))
  } finally {
    loading.value = false
  }
}
</script>