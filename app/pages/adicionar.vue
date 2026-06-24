<template>
  <div class="h-full flex flex-col font-sans bg-win-bg overflow-hidden relative">

    <!-- Título da página -->
    <div class="flex-none flex items-center justify-between bg-primary border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-1.5 mx-3 mt-3">
      <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
        <Icon name="lucide:user-plus" class="text-sm" />
        Ficha de Cadastro de Pessoa
        <span v-if="formSujo" class="text-[10px] font-normal opacity-70 italic">— não salvo</span>
      </h2>
      <button type="button" @click="painelAberto = !painelAberto"
        class="flex items-center gap-1.5 border-2 bg-base-100 px-2 py-0.5 text-[9px] font-bold uppercase hover:brightness-110"
        :class="painelAberto
          ? 'border-t-base-300 border-l-base-300 border-r-white border-b-white'
          : 'border-t-white border-l-white border-r-base-300 border-b-base-300'">
        <Icon name="lucide:users" class="text-[10px]" />
        {{ painelAberto ? 'Ocultar' : 'Ver' }} pessoas cadastradas
      </button>
    </div>

    <!-- Conteúdo rolável -->
    <form id="cadastro-form" @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-3 pt-3 pb-2 flex flex-col gap-3">

      <!-- ─── Identificação ─── -->
      <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-4 pt-1 pb-3">
        <legend class="text-[10px] font-bold px-1 uppercase text-win-text">Identificação</legend>
        <div class="grid grid-cols-[1fr_1fr_10rem] gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold uppercase text-win-text">
              Nome <span class="text-red-600">*</span>
            </label>
            <input v-model="form.nome" type="text" required
              class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1.5 text-sm outline-none focus:bg-win-focus" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold uppercase text-win-text">
              Sobrenome <span class="text-red-600">*</span>
            </label>
            <input v-model="form.sobrenome" type="text" required
              class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1.5 text-sm outline-none focus:bg-win-focus" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold uppercase text-win-text">Sexo</label>
            <select v-model="form.sexo"
              class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1.5 text-sm outline-none">
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
        </div>
      </fieldset>

      <!-- ─── Eventos Vitais ─── -->
      <div class="grid grid-cols-3 gap-3">
        <fieldset v-for="ev in eventos" :key="ev.chave"
          class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-4 pt-1 pb-3">
          <legend class="text-[10px] font-bold px-1 uppercase text-win-text">{{ ev.label }}</legend>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1">
              <label class="text-[9px] font-bold uppercase text-win-muted">Data</label>
              <input :value="form[('data' + ev.chave) as keyof typeof form] as string"
                @input="(form[('data' + ev.chave) as keyof typeof form] as any) = ($event.target as HTMLInputElement).value"
                type="date"
                class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1 text-xs outline-none w-full" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[9px] font-bold uppercase text-win-muted">Local</label>
              <LocalSelect
                :model-value="form[('local' + ev.chave) as keyof typeof form] as number | null"
                @update:model-value="(val: number | null) => (form[('local' + ev.chave) as keyof typeof form] as any) = val"
                :locais="locais ?? []"
                placeholder="Selecione..."
                @novoLocal="modalLocalAberto = true"
              />
            </div>
          </div>
        </fieldset>
      </div>

      <!-- ─── Vínculos + Observações ─── -->
      <div class="grid grid-cols-[1fr_18rem] gap-3">

        <!-- Vínculos Familiares -->
        <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-4 pt-1 pb-3 flex flex-col gap-2">
          <legend class="text-[10px] font-bold px-1 uppercase text-win-text">
            Vínculos Familiares
            <span v-if="form.relacoes.length" class="font-normal">({{ form.relacoes.length }})</span>
          </legend>

          <div v-if="form.relacoes.length === 0"
            class="text-[11px] text-win-dim italic text-center py-8 border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white bg-white">
            Nenhum vínculo adicionado.
          </div>

          <!-- Card de cada vínculo -->
          <div v-for="(rel, index) in form.relacoes" :key="index"
            class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-win-card p-3 flex flex-col gap-2">

            <!-- Linha 1: tipo + remover -->
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold uppercase text-win-muted-dark w-16 flex-none">Vínculo {{ index + 1 }}</span>
              <select v-model="rel.rel" required
                class="flex-1 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1 text-xs outline-none">
                <option :value="null">Tipo de vínculo...</option>
                <option v-for="tipo in tiposRelacao" :key="tipo.id" :value="tipo.id">
                  {{ tipo.descricao }}
                </option>
              </select>
              <button type="button" @click="removerRelacao(index)"
                class="flex-none border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 w-6 h-6 text-sm font-bold text-red-700 hover:bg-red-50 flex items-center justify-center">
                ×
              </button>
            </div>

            <!-- Linha 2: pessoa (selecionar ou criar) -->
            <div class="flex items-center gap-2">
              <button type="button" @click="alternarModoNovo(index)"
                class="flex-none border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 text-[9px] font-bold uppercase px-2 py-1 hover:brightness-110 whitespace-nowrap">
                {{ rel.isNovo ? '← Lista' : '+ Novo' }}
              </button>

              <template v-if="rel.isNovo">
                <input v-model="rel.novoParente.nome" type="text" placeholder="Nome *"
                  class="flex-1 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1 text-xs outline-none focus:bg-win-focus" />
                <input v-model="rel.novoParente.sobrenome" type="text" placeholder="Sobrenome *"
                  class="flex-1 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1 text-xs outline-none focus:bg-win-focus" />
                <select v-model="rel.novoParente.sexo"
                  class="w-20 flex-none bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-1 py-1 text-xs outline-none">
                  <option value="M">Masc.</option>
                  <option value="F">Fem.</option>
                </select>
              </template>

              <select v-else v-model="rel.p2" required
                class="flex-1 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1 text-xs outline-none">
                <option :value="null">— Selecione uma pessoa —</option>
                <option v-for="p in pessoasExistentes" :key="p.id" :value="p.id">
                  {{ p.sobrenome }}, {{ p.nome }}
                  ({{ String(p.id).padStart(3, '0') }}{{ p.datanasc ? ' · ' + p.datanasc.substring(0,4) : '' }})
                </option>
              </select>
            </div>

            <!-- Linha 3: dados do casamento (só cônjuge) -->
            <div v-if="verificarSeEhConjuge(rel.rel)"
              class="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-win-border-light">
              <div class="flex flex-col gap-1">
                <label class="text-[9px] font-bold uppercase text-blue-900">Data do casamento</label>
                <input v-model="rel.metadata.data_casamento" type="date"
                  class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1 text-xs outline-none w-full" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[9px] font-bold uppercase text-blue-900">Local do casamento</label>
                <LocalSelect
                  v-model="rel.metadata.local_casamento"
                  :locais="locais ?? []"
                  placeholder="Selecione..."
                  @novoLocal="modalLocalAberto = true"
                />
              </div>
            </div>
          </div>

          <!-- Botão adicionar -->
          <button type="button" @click="adicionarRelacao"
            class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 py-1.5 text-[10px] font-bold uppercase hover:brightness-110 flex items-center justify-center gap-1.5">
            <Icon name="lucide:plus" class="text-[10px]" />
            Adicionar Vínculo
          </button>
        </fieldset>

        <!-- Observações -->
        <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-4 pt-1 pb-3 flex flex-col">
          <legend class="text-[10px] font-bold px-1 uppercase text-win-text">Observações</legend>
          <textarea v-model="form.obs"
            class="flex-1 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1.5 text-xs outline-none resize-none focus:bg-win-focus min-h-35" />
        </fieldset>
      </div>

    </form>

    <!-- ─── Barra de ações ─── -->
    <div class="flex-none flex justify-between items-center px-3 py-2 bg-base-100 border-t-2 border-base-300">
      <span class="text-[9px] text-win-muted"><span class="text-red-600">*</span> obrigatórios</span>
      <div class="flex gap-2">
        <button type="button" @click="cancelar"
          class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 text-[10px] font-bold uppercase py-1.5 px-5 hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white">
          Cancelar
        </button>
        <button type="submit" form="cadastro-form" :disabled="loading"
          class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 text-[10px] font-bold uppercase py-1.5 px-6 hover:brightness-110 disabled:opacity-50 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white flex items-center gap-1.5">
          <Icon name="lucide:check" class="text-[10px]" />
          {{ loading ? 'Registrando...' : 'Registrar' }}
        </button>
      </div>
    </div>

    <!-- ─── Painel lateral deslizante ─── -->
    <transition name="slide-screen">
      <div v-if="painelAberto"
        class="absolute right-0 top-0 h-full w-[360px] bg-base-100 border-l-2 border-l-white shadow-[-4px_0_10px_rgba(0,0,0,0.2)] flex flex-col z-50">

        <div class="flex-none flex items-center justify-between bg-primary px-2.5 py-2 mx-0.5 mt-0.5">
          <span class="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="lucide:users" class="text-sm" />
            Pessoas Cadastradas
          </span>
          <button @click="painelAberto = false" type="button"
            class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-5 h-5 flex items-center justify-center text-xs font-bold">
            ×
          </button>
        </div>

        <div class="flex-none p-2 border-b border-base-300 bg-base-200">
          <p class="text-[10px] text-win-muted-dark font-bold uppercase mb-1.5">
            Clique numa pessoa para vinculá-la ao cadastro
          </p>
          <input v-model="buscaLateral" type="text" placeholder="Buscar por nome ou ID..."
            class="w-full bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1.5 text-xs outline-none focus:bg-win-focus" />
        </div>

        <div class="flex-1 overflow-y-auto bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white m-2">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-base-100 z-10">
              <tr>
                <th class="px-2 py-1.5 text-[9px] font-bold uppercase border-b border-base-300">ID</th>
                <th class="px-2 py-1.5 text-[9px] font-bold uppercase border-b border-base-300">Nome</th>
                <th class="px-2 py-1.5 text-[9px] font-bold uppercase border-b border-base-300 text-right">Nasc.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!pessoasFiltradas.length">
                <td colspan="3" class="p-4 text-xs text-win-dim italic text-center">Nenhum registro encontrado</td>
              </tr>
              <tr v-for="p in pessoasFiltradas" :key="p.id"
                @click="vincularPessoaPeloPainel(p.id)"
                class="border-b border-win-border-light hover:brightness-90 cursor-pointer"
                :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male)' : 'var(--color-female)' }">
                <td class="px-2 py-1.5 font-mono text-xs font-bold">{{ String(p.id).padStart(3,'0') }}</td>
                <td class="px-2 py-1.5 text-[11px] font-medium">{{ p.sobrenome }}, {{ p.nome }}</td>
                <td class="px-2 py-1.5 text-xs font-mono text-right text-win-muted-dark">{{ p.datanasc?.substring(0,4) ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex-none px-3 py-2 border-t border-base-300 bg-base-300">
          <span class="text-[9px] font-bold text-win-text">{{ pessoasFiltradas.length }} registro(s)</span>
        </div>
      </div>
    </transition>

    <ModalLocal v-if="modalLocalAberto" @close="modalLocalAberto = false; refreshLocais()" />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { success, error, confirm } = useAppAlert()
const loading = ref(false)
const cadastroRealizado = ref(false)
const modalLocalAberto = ref(false)
const painelAberto = ref(false)
const buscaLateral = ref('')

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

const { data: locais,           refresh: refreshLocais }  = await useFetch<any[]>('/api/local')
const { data: tiposRelacao }                              = await useFetch<any[]>('/api/tipo_relacao')
const { data: pessoasExistentes }                         = await useFetch<any[]>('/api/pessoa')

const form = ref<PessoaForm>({
  nome: '', sobrenome: '', sexo: 'M',
  datanasc: null, localnasc: null,
  databatismo: null, localbatismo: null,
  datamorte: null, localmorte: null,
  obs: '', relacoes: [],
})

// Detecta se há algo preenchido para ativar o guard de saída
const formSujo = computed(() =>
  !!(form.value.nome ||
     form.value.sobrenome ||
     form.value.obs ||
     form.value.datanasc ||
     form.value.databatismo ||
     form.value.datamorte ||
     form.value.relacoes.length > 0)
)

// Guard: pergunta antes de sair se houver dados não salvos
onBeforeRouteLeave((_to, _from, next) => {
  if (!formSujo.value || cadastroRealizado.value) {
    next()
    return
  }
  confirm(
    'Você tem um cadastro em andamento.\n\nDeseja descartar as alterações e sair?',
    () => next(),
    () => next(false),
  )
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
    p2: null, rel: null, isNovo: false,
    novoParente: { nome: '', sobrenome: '', sexo: 'M' },
    metadata: { data_casamento: null, local_casamento: null }
  })
}

function alternarModoNovo(index: number) {
  form.value.relacoes[index].isNovo = !form.value.relacoes[index].isNovo
  if (form.value.relacoes[index].isNovo) form.value.relacoes[index].p2 = null
}

function vincularPessoaPeloPainel(idPessoa: number) {
  const idx = form.value.relacoes.findIndex(r => !r.p2 && !r.isNovo)
  if (idx !== -1) {
    form.value.relacoes[idx].p2 = idPessoa
  } else {
    form.value.relacoes.push({
      p2: idPessoa, rel: null, isNovo: false,
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

function cancelar() {
  if (!formSujo.value) {
    cadastroRealizado.value = true
    router.back()
    return
  }
  confirm(
    'Deseja descartar as alterações e voltar?',
    () => {
      cadastroRealizado.value = true
      router.back()
    },
  )
}

async function handleSubmit() {
  loading.value = true
  try {
    for (const r of form.value.relacoes) {
      if (r.isNovo && r.novoParente.nome && r.novoParente.sobrenome) {
        const nova: any = await $fetch('/api/pessoa', {
          method: 'POST',
          body: {
            nome: r.novoParente.nome, sobrenome: r.novoParente.sobrenome, sexo: r.novoParente.sexo,
            datanasc: null, localnasc: null, databatismo: null, localbatismo: null,
            datamorte: null, localmorte: null, obs: 'Cadastrado via vínculo rápido.', relacoes: []
          }
        })
        r.p2 = nova.id
        r.isNovo = false
      }
    }

    const payload: any = {
      nome:          form.value.nome,
      sobrenome:     form.value.sobrenome,
      sexo:          form.value.sexo,
      datanasc:      form.value.datanasc    || null,
      localnasc:     form.value.localnasc   || null,
      databatismo:   form.value.databatismo || null,
      localbatismo:  form.value.localbatismo|| null,
      datamorte:     form.value.datamorte   || null,
      localmorte:    form.value.localmorte  || null,
      obs:           form.value.obs         || null,
      relacoes: form.value.relacoes
        .filter(r => r.p2 && r.rel)
        .map(r => ({
          p2:  Number(r.p2),
          rel: Number(r.rel),
          metadata: verificarSeEhConjuge(r.rel)
            ? { data_casamento: r.metadata.data_casamento || null, local_casamento: r.metadata.local_casamento || null }
            : null
        }))
    }

    await $fetch('/api/pessoa', { method: 'POST', body: payload })
    cadastroRealizado.value = true
    success('Cadastro concluído com sucesso!', () => router.push('/'))
  } catch (err) {
    const msg = (err as { data?: { message?: string }; message?: string })?.data?.message
      ?? (err instanceof Error ? err.message : 'Verifique os dados.')
    error('Erro ao gravar: ' + msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.slide-screen-enter-active, .slide-screen-leave-active {
  transition: transform 0.2s ease-in-out;
}
.slide-screen-enter-from, .slide-screen-leave-to {
  transform: translateX(100%);
}
</style>
