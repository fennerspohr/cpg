<template>
  <div class="w-full h-full bg-background flex flex-1 items-center justify-center overflow-hidden relative">

    <div class="bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-[2px_2px_0_#000] flex"
      style="width: 860px; height: 560px">

      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

        <div class="flex-none flex items-center justify-between bg-[#000080] px-2 py-1 mx-0.5 mt-0.5">
          <span class="text-white text-xs font-bold flex items-center gap-1.5">
            <Icon name="lucide:user-plus" class="text-sm" />
            Ficha de Cadastro de Pessoa
          </span>
          <div class="flex items-center gap-1">
            <button type="button" @click="painelAberto = !painelAberto"
              title="Ver lista de pessoas cadastradas"
              class="flex items-center gap-1 border-2 bg-[#d4d0c8] px-1.5 py-0.5 text-[9px] font-bold uppercase hover:brightness-110"
              :class="painelAberto ? 'border-t-[#808080] border-l-[#808080] border-r-white border-b-white' : 'border-t-white border-l-white border-r-[#808080] border-b-[#808080]'">
              <Icon name="lucide:eye" class="text-[10px]" />
              Ver pessoas cadastradas
            </button>
            <button type="button" @click="$router.back()"
              class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] w-5 h-5 flex items-center justify-center text-xs font-bold hover:brightness-110">
              ×
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-2 p-2 flex-1 overflow-hidden">

          <fieldset class="flex-none border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-3 pt-0.5 pb-2">
            <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">Identificação</legend>
            <div class="flex gap-2">
              <div class="flex flex-col gap-0.5 flex-1">
                <label class="text-[10px] font-bold uppercase text-[#404040]">Nome <span class="text-red-600">*</span></label>
                <input v-model="form.nome" type="text" required
                  class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1 text-sm outline-none focus:bg-[#ffffcc]" />
              </div>
              <div class="flex flex-col gap-0.5 flex-1">
                <label class="text-[10px] font-bold uppercase text-[#404040]">Sobrenome <span class="text-red-600">*</span></label>
                <input v-model="form.sobrenome" type="text" required
                  class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1 text-sm outline-none focus:bg-[#ffffcc]" />
              </div>
              <div class="flex flex-col gap-0.5 w-28">
                <label class="text-[10px] font-bold uppercase text-[#404040]">Sexo</label>
                <select v-model="form.sexo"
                  class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1 text-sm outline-none">
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>
          </fieldset>

          <div class="flex-none grid grid-cols-3 gap-2">
            <fieldset v-for="ev in eventos" :key="ev.chave"
              class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 pt-0.5 pb-2">
              <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">{{ ev.label }}</legend>
              <div class="flex flex-col gap-1.5">
                <div>
                  <label class="text-[9px] uppercase text-[#606060]">Data</label>
                  <input v-model="form['data' + ev.chave]" type="date"
                    class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-0.5 text-xs outline-none w-full mt-0.5" />
                </div>
                <div>
                  <label class="text-[9px] uppercase text-[#606060]">Local</label>
                  <LocalSelect
                    v-model="form['local' + ev.chave]"
                    :locais="locais ?? []"
                    placeholder="Selecione..."
                    @novoLocal="modalLocalAberto = true"
                  />
                </div>
              </div>
            </fieldset>
          </div>

          <div class="flex gap-2 flex-1 min-h-0">

            <fieldset class="flex flex-col flex-1 min-w-0 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 pt-0.5 pb-1 min-h-0 overflow-hidden">
              <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">Vínculos Familiares</legend>

              <div class="flex-1 overflow-y-auto flex flex-col gap-1.5 min-h-0">
                <p v-if="form.relacoes.length === 0" class="text-[10px] text-gray-400 italic text-center py-3">
                  Nenhum vínculo adicionado.
                </p>
                
                <div v-for="(rel, index) in form.relacoes" :key="index"
                  class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#c8c4bc] p-1.5 flex flex-col gap-1">
                  
                  <div class="flex justify-between items-center bg-[#b8b4ac] px-1.5 py-1 border border-[#808080] mb-0.5">
                    <span class="text-[9px] font-bold uppercase text-[#303030]">Origem do Parente:</span>
                    <button type="button" 
                      @click="alternarModoNovo(index)"
                      class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] text-[9px] font-bold uppercase px-2 py-0.5 text-blue-900 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white hover:brightness-105">
                      {{ rel.isNovo ? ' Escolher da Lista Existente' : ' Criar Nova Pessoa Rápido' }}
                    </button>
                  </div>

                  <div class="flex gap-1.5 items-end">
                    
                    <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div v-if="rel.isNovo" class="grid grid-cols-12 gap-1 bg-[#d4d0c8] p-1 border border-[#808080]">
                        <input v-model="rel.novoParente.nome" type="text" placeholder="Nome *" required
                          class="col-span-5 bg-white border border-t-[#808080] border-l-[#808080] px-1 py-0.5 text-xs outline-none focus:bg-[#ffffcc]" />
                        
                        <input v-model="rel.novoParente.sobrenome" type="text" placeholder="Sobrenome *" required
                          class="col-span-5 bg-white border border-t-[#808080] border-l-[#808080] px-1 py-0.5 text-xs outline-none focus:bg-[#ffffcc]" />
                        
                        <select v-model="rel.novoParente.sexo" required
                          class="col-span-2 bg-white border border-t-[#808080] border-l-[#808080] px-0.5 py-0.5 text-xs outline-none">
                          <option value="M">M</option>
                          <option value="F">F</option>
                        </select>
                      </div>

                      <div v-else class="relative">
                        <select v-model="rel.p2" required
                          class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-1 py-0.5 text-xs outline-none w-full">
                          <option :value="null">-- Digite na barra lateral para buscar ou selecione --</option>
                          <option v-for="p in pessoasExistentes" :key="p.id" :value="p.id">
                            {{ p.sobrenome }}, {{ p.nome }} (ID: {{ p.id }})
                          </option>
                        </select>
                      </div>
                    </div>

                    <div class="flex flex-col gap-0.5 w-28 flex-none">
                      <label class="text-[9px] font-bold uppercase text-[#404040]">Vínculo</label>
                      <select v-model="rel.rel" required
                        class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-1 py-0.5 text-xs outline-none w-full">
                        <option :value="null">Tipo...</option>
                        <option v-for="tipo in tiposRelacao" :key="tipo.id" :value="tipo.id">
                          {{ tipo.descricao }}
                        </option>
                      </select>
                    </div>

                    <button type="button" @click="removerRelacao(index)"
                      class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] w-6 h-6 flex-none text-sm font-bold text-red-700 hover:bg-red-100 flex items-center justify-center">
                      ×
                    </button>
                  </div>

                  <div v-if="verificarSeEhConjuge(rel.rel)"
                    class="pt-1 border-t border-dashed border-[#808080] grid grid-cols-2 gap-1.5">
                    <div>
                      <label class="text-[8px] font-bold uppercase text-blue-900">Data do Casamento</label>
                      <input v-model="rel.metadata.data_casamento" type="date"
                        class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-1 py-0.5 text-xs outline-none w-full mt-0.5" />
                    </div>
                    <div>
                      <label class="text-[8px] font-bold uppercase text-blue-900">Local do Casamento</label>
                      <LocalSelect
                        v-model="rel.metadata.local_casamento"
                        :locais="locais ?? []"
                        placeholder="Selecione..."
                        @novoLocal="modalLocalAberto = true"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex-none pt-1 border-t border-[#808080] mt-1">
                <button type="button" @click="adicionarRelacao"
                  class="w-full border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] py-0.5 text-[10px] font-bold uppercase hover:brightness-110">
                  + Adicionar Vínculo
                </button>
              </div>
            </fieldset>

            <fieldset class="flex flex-col w-40 flex-none border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 pt-0.5 pb-1 min-h-0">
              <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">Observações</legend>
              <textarea v-model="form.obs"
                class="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1 text-xs outline-none resize-none focus:bg-[#ffffcc] w-full" />
            </fieldset>
          </div>

          <div class="flex-none flex justify-between items-center pt-1 border-t border-[#808080]">
            <span class="text-[9px] text-[#606060]"><span class="text-red-600">*</span> obrigatórios</span>
            <div class="flex gap-1.5">
              <button type="button" @click="$router.back()"
                class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] text-[10px] font-bold uppercase py-1 px-4 hover:brightness-110 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white">
                Cancelar
              </button>
              <button type="submit" :disabled="loading"
                class="border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#d4d0c8] text-[10px] font-bold uppercase py-1 px-5 hover:brightness-110 disabled:opacity-50 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white">
                {{ loading ? 'Registrando...' : ' Registrar' }}
              </button>
            </div>
          </div>

        </form>
      </div>

    </div>

    <transition name="slide-screen">
      <div v-if="painelAberto"
        class="absolute right-0 top-0 h-full bg-[#d4d0c8] border-l-2 border-l-white shadow-[-4px_0_10px_rgba(0,0,0,0.15)] flex flex-col z-50 overflow-hidden"
        style="width: 380px;">
        
        <div class="flex-none flex items-center justify-between bg-[#000080] px-2.5 py-2 m-0.5">
          <span class="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="lucide:users" class="text-sm" /> Pessoas Cadastradas
          </span>
          <button @click="painelAberto = false" type="button"
            class="bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] w-5 h-5 flex items-center justify-center text-xs font-bold active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white">×</button>
        </div>
        
        <div class="flex-none p-2 border-b border-[#808080]">
          <div class="text-[10px] text-gray-700 font-bold mb-1 uppercase"> Dica: Filtre e clique numa pessoa para vincular rápido!</div>
          <input v-model="buscaLateral" type="text" placeholder="Buscar por nome ou ID..."
            class="w-full bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1.5 text-xs outline-none focus:bg-[#ffffcc]" />
        </div>
        
        <div class="flex-1 overflow-y-auto bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white m-1.5">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-[#d4d0c8] z-10">
              <tr>
                <th class="px-2 py-1.5 text-[10px] font-bold uppercase border-b border-[#808080]">ID</th>
                <th class="px-2 py-1.5 text-[10px] font-bold uppercase border-b border-[#808080]">Nome</th>
                <th class="px-2 py-1.5 text-[10px] font-bold uppercase border-b border-[#808080] text-right">Nasc.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!pessoasFiltradas.length">
                <td colspan="3" class="p-4 text-sm text-gray-400 italic text-center">Nenhum registro encontrado</td>
              </tr>
              <tr v-for="p in pessoasFiltradas" :key="p.id"
                @click="vincularPessoaPeloPainel(p.id)"
                class="border-b border-gray-200 hover:brightness-95 cursor-pointer transition-all"
                :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male)' : 'var(--color-female)' }">
                <td class="px-2 py-2 font-mono text-xs font-bold">{{ String(p.id).padStart(3,'0') }}</td>
                <td class="px-2 py-2 text-[11px] font-medium text-gray-900">{{ p.sobrenome }}, {{ p.nome }}</td>
                <td class="px-2 py-2 text-xs font-mono text-right font-semibold text-gray-700">{{ p.datanasc?.substring(0,4) ?? '----' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="flex-none px-3 py-2 border-t border-[#808080] bg-[#c8c4bc]">
          <span class="text-xs font-bold text-[#404040]">{{ pessoasFiltradas.length }} registro(s) listado(s)</span>
        </div>
      </div>
    </transition>

  </div>

  <ModalLocal v-if="modalLocalAberto" @close="modalLocalAberto = false; refreshLocais()" />
</template>

<script setup lang="ts">
const router = useRouter()
const loading = ref(false)
const modalLocalAberto = ref(false)
const painelAberto = ref(false)
const buscaLateral = ref('')

const { success, error } = useAppAlert()

interface PessoaForm {
  [key: string]: any
  nome: string; sobrenome: string; sexo: string
  datanasc: string | null; localnasc: number | null
  databatismo: string | null; localbatismo: number | null
  datamorte: string | null; localmorte: number | null
  obs: string; relacoes: any[]
}

const eventos = [
  { chave: 'nasc',    label: 'Nascimento' },
  { chave: 'batismo', label: 'Batismo'    },
  { chave: 'morte',   label: 'Óbito'      },
]

const { data: locais, refresh: refreshLocais } = await useFetch<any[]>('/api/local')
const { data: tiposRelacao }                   = await useFetch<any[]>('/api/tipo_relacao')
const { data: pessoasExistentes, refresh: refetchPessoas } = await useFetch<any[]>('/api/pessoa')

const form = ref<PessoaForm>({
  nome: '', sobrenome: '', sexo: 'M',
  datanasc: null, localnasc: null,
  databatismo: null, localbatismo: null,
  datamorte: null, localmorte: null,
  obs: '', relacoes: [],
})

const pessoasFiltradas = computed(() => {
  if (!pessoasExistentes.value) return []
  const q = buscaLateral.value.toLowerCase()
  if (!q) return pessoasExistentes.value
  return pessoasExistentes.value.filter((p: any) =>
    (p.nome + ' ' + p.sobrenome).toLowerCase().includes(q) || String(p.id).includes(q)
  )
})

function adicionarRelacao() {
  form.value.relacoes.push({ 
    p2: null, 
    rel: null, 
    isNovo: false, 
    novoParente: { nome: '', sobrenome: '', sexo: 'M' },
    metadata: { data_casamento: null, local_casamento: null } 
  })
}

function alternarModoNovo(index: number) {
  form.value.relacoes[index].isNovo = !form.value.relacoes[index].isNovo
  if (form.value.relacoes[index].isNovo) {
    form.value.relacoes[index].p2 = null
  }
}

function vincularPessoaPeloPainel(idPessoa: number) {
  const idx = form.value.relacoes.findIndex(r => !r.p2 && !r.isNovo)
  if (idx !== -1) {
    form.value.relacoes[idx].p2 = idPessoa
  } else {
    form.value.relacoes.push({ 
      p2: idPessoa, 
      rel: null, 
      isNovo: false, 
      novoParente: { nome: '', sobrenome: '', sexo: 'M' },
      metadata: { data_casamento: null, local_casamento: null } 
    })
  }
}

function removerRelacao(index: number) { form.value.relacoes.splice(index, 1) }

function verificarSeEhConjuge(idRelacao: number | null): boolean {
  if (!idRelacao || !tiposRelacao.value) return false
  const tipo = tiposRelacao.value.find((t: any) => t.id === idRelacao)
  return tipo?.descricao?.toLowerCase() === 'cônjuge'
}

async function handleSubmit() {
  loading.value = true
  try {
    // 1. Cria pessoas novas (modo rápido) antes de tudo
    for (const r of form.value.relacoes) {
      if (r.isNovo && r.novoParente.nome && r.novoParente.sobrenome) {
        const nova: any = await $fetch('/api/pessoa', {
          method: 'POST',
          body: {
            nome: r.novoParente.nome,
            sobrenome: r.novoParente.sobrenome,
            sexo: r.novoParente.sexo,
            datanasc: null, localnasc: null,
            databatismo: null, localbatismo: null,
            datamorte: null, localmorte: null,
            obs: 'Cadastrado via vínculo rápido.',
            relacoes: []
          }
        })
        r.p2 = nova.id
        r.isNovo = false
      }
    }

    // 2. Monta payload da pessoa principal
    const payload: any = {
      nome: form.value.nome,
      sobrenome: form.value.sobrenome,
      sexo: form.value.sexo,
      datanasc:    form.value.datanasc    || null,
      localnasc:   form.value.localnasc   || null,
      databatismo: form.value.databatismo || null,
      localbatismo:form.value.localbatismo|| null,
      datamorte:   form.value.datamorte   || null,
      localmorte:  form.value.localmorte  || null,
      obs: form.value.obs || null,
      relacoes: form.value.relacoes
        .filter(r => r.p2 && r.rel)
        .map(r => ({
          p2: Number(r.p2),
          rel: Number(r.rel),
          // só envia metadata se for cônjuge E tiver dados
          metadata: verificarSeEhConjuge(r.rel)
            ? {
                data_casamento:  r.metadata.data_casamento  || null,
                local_casamento: r.metadata.local_casamento || null
              }
            : null
        }))
    }

    await $fetch('/api/pessoa', { method: 'POST', body: payload })
    success('Cadastro concluído com sucesso!')
    router.push('/')
  } catch (err: any) {
    error('Erro ao gravar: ' + (err.data?.message || err.message || 'Verifique os dados.'))

  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.slide-screen-enter-active, .slide-screen-leave-active {
  transition: transform 0.25s ease-in-out;
}
.slide-screen-enter-from, .slide-screen-leave-to {
  transform: translateX(100%);
}
.slide-screen-enter-to, .slide-screen-leave-from {
  transform: translateX(0);
}
</style>