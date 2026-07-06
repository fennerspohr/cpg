<template>
  <div class="flex h-full bg-win-bg font-sans overflow-hidden">

    <!-- CONTEÚDO PRINCIPAL -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

      <!-- Barra de título -->
      <div class="flex-none flex items-center justify-between bg-primary border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-1 m-2 mb-1">
        <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
          <Icon name="lucide:git-merge" class="text-sm" />
          Buscar Relação Entre Pessoas
        </h2>
        <!-- Botão abrir/fechar painel lateral -->
        <button
          @click="painelAberto = !painelAberto"
          class="flex items-center gap-1 border-2 bg-base-100 px-2 py-0.5 text-[9px] font-bold uppercase hover:brightness-110"
          :class="painelAberto ? 'border-t-base-300 border-l-base-300 border-r-white border-b-white' : 'border-t-white border-l-white border-r-base-300 border-b-base-300'">
          <Icon name="lucide:users" class="text-[10px]" />
          {{ painelAberto ? 'Ocultar Lista' : 'Ver Pessoas' }}
        </button>
      </div>

      <!-- Seleção de pessoas -->
      <div class="flex-none grid grid-cols-2 gap-2 px-2 pb-1">

        <!-- Pessoa 1 -->
        <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 pt-1 pb-3 relative">
          <legend class="text-[10px] font-bold px-1 uppercase text-win-text">Pessoa 1</legend>
          <div v-if="pessoa1"
            class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-2 flex items-center justify-between"
            :style="{ backgroundColor: pessoa1.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }">
            <div>
              <p class="text-sm font-bold uppercase leading-tight">{{ pessoa1.sobrenome }}, {{ pessoa1.nome }}</p>
              <p class="text-[10px] text-win-text font-mono mt-0.5">
                ID {{ String(pessoa1.id).padStart(3,'0') }}
                · b.: {{ pessoa1.datanasc?.substring(0,4) ?? '—' }}
                <template v-if="pessoa1.datamorte"> · d.: {{ pessoa1.datamorte.substring(0,4) }}</template>
              </p>
            </div>
            <button @click="limparPessoa1"
              class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 w-6 h-6 flex items-center justify-center text-xs font-bold hover:brightness-110 ml-2 flex-none">
              ×
            </button>
          </div>
          <div v-else class="relative">
            <input v-model="busca1" type="text" placeholder="Digite o nome para buscar..."
              @focus="foco1 = true" @blur="agendarFecharFoco1"
              class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1.5 text-sm outline-none focus:bg-win-focus w-full" />
            <div v-if="foco1 && resultados1.length"
              class="absolute top-full left-0 right-0 z-30 border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white bg-white max-h-52 overflow-y-auto shadow-md">
              <button v-for="p in resultados1" :key="p.id" @mousedown.prevent="selecionarPessoa1(p)"
                class="w-full text-left px-2 py-1.5 text-xs border-b border-win-border-light hover:bg-win-navy hover:text-white flex items-center gap-2 group">
                <span class="w-4 h-4 flex-none border border-gray-300 group-hover:border-white"
                  :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male,#5588aa)' : 'var(--color-female,#aa5588)' }" />
                <span class="font-bold uppercase flex-1">{{ p.sobrenome }}, {{ p.nome }}</span>
                <span class="font-mono text-[10px] text-win-dim group-hover:text-white">{{ p.datanasc?.substring(0,4) ?? '?' }}</span>
              </button>
            </div>
            <p v-else-if="foco1 && busca1 && !resultados1.length"
              class="absolute top-full left-0 right-0 z-30 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-3 py-2 text-[10px] text-base-300 italic">
              Nenhum resultado.
            </p>
          </div>
        </fieldset>

        <!-- Pessoa 2 -->
        <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 pt-1 pb-3 relative">
          <legend class="text-[10px] font-bold px-1 uppercase text-win-text">Pessoa 2</legend>
          <div v-if="pessoa2"
            class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-2 flex items-center justify-between"
            :style="{ backgroundColor: pessoa2.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }">
            <div>
              <p class="text-sm font-bold uppercase leading-tight">{{ pessoa2.sobrenome }}, {{ pessoa2.nome }}</p>
              <p class="text-[10px] text-win-text font-mono mt-0.5">
                ID {{ String(pessoa2.id).padStart(3,'0') }}
                · b.: {{ pessoa2.datanasc?.substring(0,4) ?? '—' }}
                <template v-if="pessoa2.datamorte"> · d.: {{ pessoa2.datamorte.substring(0,4) }}</template>
              </p>
            </div>
            <button @click="limparPessoa2"
              class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 w-6 h-6 flex items-center justify-center text-xs font-bold hover:brightness-110 ml-2 flex-none">
              ×
            </button>
          </div>
          <div v-else class="relative">
            <input v-model="busca2" type="text" placeholder="Digite o nome para buscar..."
              @focus="foco2 = true" @blur="agendarFecharFoco2"
              class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1.5 text-sm outline-none focus:bg-win-focus w-full" />
            <div v-if="foco2 && resultados2.length"
              class="absolute top-full left-0 right-0 z-30 border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white bg-white max-h-52 overflow-y-auto shadow-md">
              <button v-for="p in resultados2" :key="p.id" @mousedown.prevent="selecionarPessoa2(p)"
                class="w-full text-left px-2 py-1.5 text-xs border-b border-win-border-light hover:bg-win-navy hover:text-white flex items-center gap-2 group">
                <span class="w-4 h-4 flex-none border border-gray-300 group-hover:border-white"
                  :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male,#5588aa)' : 'var(--color-female,#aa5588)' }" />
                <span class="font-bold uppercase flex-1">{{ p.sobrenome }}, {{ p.nome }}</span>
                <span class="font-mono text-[10px] text-win-dim group-hover:text-white">{{ p.datanasc?.substring(0,4) ?? '?' }}</span>
              </button>
            </div>
            <p v-else-if="foco2 && busca2 && !resultados2.length"
              class="absolute top-full left-0 right-0 z-30 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-3 py-2 text-[10px] text-base-300 italic">
              Nenhum resultado.
            </p>
          </div>
        </fieldset>

      </div>

      <!-- Botão buscar -->
      <div class="flex-none flex justify-center pb-1">
        <button @click="buscarRelacao" :disabled="!pessoa1 || !pessoa2 || buscando"
          class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-10 py-1.5 text-xs font-bold uppercase hover:brightness-110 disabled:opacity-40 flex items-center gap-2 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white">
          <Icon name="lucide:search" class="text-xs" />
          {{ buscando ? 'Buscando...' : 'Buscar Relação' }}
        </button>
      </div>

      <!-- Área de resultado -->
      <div class="flex-1 mx-2 mb-2 border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white overflow-hidden flex flex-col bg-base-100">
        <div v-if="!resultado && !buscando && !status"
          class="flex-1 flex flex-col items-center justify-center gap-3 text-base-300">
          <Icon name="lucide:git-merge" class="text-5xl opacity-30" />
          <p class="text-sm uppercase tracking-widest">Selecione duas pessoas e clique em Buscar</p>
          <p class="text-xs opacity-50">O sistema encontrará o caminho de parentesco entre elas</p>
        </div>
        <div v-else-if="buscando"
          class="flex-1 flex items-center justify-center text-sm text-win-text animate-pulse uppercase tracking-widest">
          Calculando caminho de parentesco...
        </div>
        <div v-else-if="status?.tipo === 'erro'"
          class="flex-1 flex flex-col items-center justify-center gap-3">
          <Icon name="lucide:unlink" class="text-5xl text-red-400 opacity-60" />
          <p class="text-base font-bold uppercase text-red-700">Pessoas não relacionadas</p>
          <p class="text-sm text-win-muted text-center">
            Não foi encontrado nenhum caminho entre<br>
            <strong>{{ pessoa1?.nome }} {{ pessoa1?.sobrenome }}</strong> e
            <strong>{{ pessoa2?.nome }} {{ pessoa2?.sobrenome }}</strong>.
          </p>
        </div>
        <template v-else-if="resultado?.length">
          <div class="flex-none border-b-2 border-base-300 px-4 py-1.5 bg-base-300 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <Icon name="lucide:check-circle" class="text-green-700 text-sm" />
              <span class="text-xs font-bold uppercase text-black">
                Caminho encontrado — {{ resultado.length }} pessoa(s) na linha de parentesco
              </span>
            </div>
            <button @click="gerarRelatorio" :disabled="gerandoRelatorio"
              class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-3 py-0.5 text-[10px] font-bold uppercase hover:brightness-110 disabled:opacity-50 disabled:cursor-wait flex items-center gap-1.5 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white">
              <Icon :name="gerandoRelatorio ? 'lucide:loader' : 'lucide:file-text'" class="text-[10px]" :class="gerandoRelatorio ? 'animate-spin' : ''" />
              {{ gerandoRelatorio ? 'Gerando...' : 'Gerar Relatório' }}
            </button>
          </div>
          <div class="flex-1 overflow-auto">
            <ClientOnly>
              <PathChartView :data="resultado" :main="String(pessoa1?.id)" @card-click="abrirFicha" />
            </ClientOnly>
          </div>
        </template>
      </div>

      <!-- Barra de status -->
      <div class="flex-none mx-2 mb-1 flex justify-between items-center">
        <div class="border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-0.5">
          <span class="text-[9px] text-black uppercase font-bold">CPG - Sistema de Genealogia</span>
        </div>
        <div v-if="status" class="border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-0.5">
          <span class="text-[9px] font-bold" :class="status.tipo === 'ok' ? 'text-green-700' : 'text-red-700'">
            {{ status.msg }}
          </span>
        </div>
      </div>

    </div>

    <!-- PAINEL LATERAL de pessoas -->
    <transition name="slide">
      <div v-if="painelAberto" class="flex flex-col w-64 flex-none border-l-2 border-base-300 bg-base-100 overflow-hidden">

        <div class="flex-none flex items-center justify-between bg-primary px-2 py-1">
          <span class="text-white text-xs font-bold uppercase">Pessoas Cadastradas</span>
          <button @click="painelAberto = false"
            class="bg-base-100 border border-t-white border-l-white border-r-base-300 border-b-base-300 w-5 h-5 flex items-center justify-center text-sm font-bold">×</button>
        </div>

        <!-- Dica -->
        <div class="flex-none px-2 pt-1.5 pb-1">
          <p class="text-[9px] text-win-text font-bold uppercase">
            Clique para selecionar —
            <span class="font-normal normal-case">preenche Pessoa 1 primeiro, depois Pessoa 2</span>
          </p>
        </div>

        <!-- Busca no painel -->
        <div class="flex-none p-1.5 border-b border-base-300">
          <input v-model="buscaLateral" type="text" placeholder="Buscar por nome..."
            class="w-full bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1 text-xs outline-none" />
        </div>

        <!-- Lista -->
        <div class="flex-1 overflow-y-auto m-1 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-base-100">
              <tr>
                <th class="px-1 py-0.5 text-[8px] font-bold uppercase border-b border-base-300 w-8">ID</th>
                <th class="px-1 py-0.5 text-[8px] font-bold uppercase border-b border-base-300">Nome</th>
                <th class="px-1 py-0.5 text-[8px] font-bold uppercase border-b border-base-300 w-10 text-right">Nasc.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!pessoasFiltradas.length">
                <td colspan="3" class="p-2 text-[9px] text-win-dim italic text-center">Nenhuma encontrada</td>
              </tr>
              <tr
                v-for="p in pessoasFiltradas" :key="p.id"
                @click="selecionarDoLateral(p)"
                class="border-b border-win-border-light cursor-pointer hover:brightness-90 transition-colors"
                :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male)' : 'var(--color-female)' }"
              >
                <td class="px-1 py-1 font-mono text-[9px] font-bold">{{ String(p.id).padStart(3,'0') }}</td>
                <td class="px-1 py-1 text-[9px]">{{ p.sobrenome }}, {{ p.nome }}</td>
                <td class="px-1 py-1 text-[9px] font-mono text-right">{{ p.datanasc?.substring(0,4) ?? '----' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Indicador de seleção atual -->
        <div class="flex-none border-t border-base-300 px-2 py-1 flex flex-col gap-0.5">
          <div class="flex items-center gap-1 text-[9px]">
            <span class="font-bold uppercase text-win-text w-14">Pessoa 1:</span>
            <span v-if="pessoa1" class="font-bold truncate"
              :style="{ color: pessoa1.sexo === 'M' ? 'var(--color-male,#336699)' : 'var(--color-female,#993366)' }">
              {{ pessoa1.nome }} {{ pessoa1.sobrenome }}
            </span>
            <span v-else class="text-base-300 italic">não selecionada</span>
          </div>
          <div class="flex items-center gap-1 text-[9px]">
            <span class="font-bold uppercase text-win-text w-14">Pessoa 2:</span>
            <span v-if="pessoa2" class="font-bold truncate"
              :style="{ color: pessoa2.sexo === 'M' ? 'var(--color-male,#336699)' : 'var(--color-female,#993366)' }">
              {{ pessoa2.nome }} {{ pessoa2.sobrenome }}
            </span>
            <span v-else class="text-base-300 italic">não selecionada</span>
          </div>
          <span class="text-[8px] text-base-300">{{ pessoasFiltradas.length }} registro(s)</span>
        </div>

      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const abrirFichaLayout = inject<(p: Pessoa) => void>('abrirFicha')

const { data: todasPessoas } = await useFetch<Pessoa[]>('/api/pessoa')

const pessoa1      = ref<Pessoa | null>(null)
const pessoa2      = ref<Pessoa | null>(null)
const busca1       = ref('')
const busca2       = ref('')
const foco1        = ref(false)
const foco2        = ref(false)
const painelAberto = ref(false)
const buscaLateral = ref('')

// Pré-preenche pessoa 1 via ?id1=X
onMounted(() => {
  const id1 = Number(route.query.id1)
  if (id1 && todasPessoas.value) {
    const p = todasPessoas.value.find(x => x.id === id1)
    if (p) pessoa1.value = p
  }
})

const resultados1 = computed(() => {
  if (!busca1.value || !todasPessoas.value) return []
  const q = busca1.value.toLowerCase()
  return todasPessoas.value.filter(p =>
    (p.nome + ' ' + p.sobrenome).toLowerCase().includes(q) || String(p.id).includes(q)
  ).slice(0, 10)
})

const resultados2 = computed(() => {
  if (!busca2.value || !todasPessoas.value) return []
  const q = busca2.value.toLowerCase()
  return todasPessoas.value.filter(p =>
    (p.nome + ' ' + p.sobrenome).toLowerCase().includes(q) || String(p.id).includes(q)
  ).slice(0, 10)
})

const pessoasFiltradas = computed(() => {
  if (!todasPessoas.value) return []
  const q = buscaLateral.value.toLowerCase()
  if (!q) return todasPessoas.value
  return todasPessoas.value.filter(p =>
    (p.nome + ' ' + p.sobrenome).toLowerCase().includes(q) || String(p.id).includes(q)
  )
})

// Clique no painel lateral: preenche pessoa 1 primeiro, depois pessoa 2
function selecionarDoLateral(p: Pessoa) {
  if (!pessoa1.value) {
    pessoa1.value = p
  } else if (!pessoa2.value && p.id !== pessoa1.value.id) {
    pessoa2.value = p
  } else if (p.id !== pessoa1.value?.id && p.id !== pessoa2.value?.id) {
    // Ambas preenchidas: substitui pessoa 2
    pessoa2.value = p
  }
  reset()
}

function agendarFecharFoco1() { setTimeout(() => { foco1.value = false }, 150) }
function agendarFecharFoco2() { setTimeout(() => { foco2.value = false }, 150) }

function selecionarPessoa1(p: Pessoa) { pessoa1.value = p; busca1.value = ''; foco1.value = false; reset() }
function selecionarPessoa2(p: Pessoa) { pessoa2.value = p; busca2.value = ''; foco2.value = false; reset() }
function limparPessoa1() { pessoa1.value = null; reset() }
function limparPessoa2() { pessoa2.value = null; reset() }
function reset() { resultado.value = null; status.value = null }

const buscando  = ref(false)
const resultado = ref<any[] | null>(null)
const status    = ref<{ tipo: 'ok' | 'erro'; msg: string } | null>(null)

async function buscarRelacao() {
  if (!pessoa1.value || !pessoa2.value) return
  buscando.value = true; resultado.value = null; status.value = null
  try {
    const data = await $fetch<any[]>('/api/arvore/', {
      query: { id: pessoa1.value.id, id2: pessoa2.value.id }
    })
    if (!data?.length) {
      status.value = { tipo: 'erro', msg: 'Nenhum caminho encontrado entre as duas pessoas.' }
    } else {
      resultado.value = data
      status.value = { tipo: 'ok', msg: `Caminho de ${data.length} pessoa(s) encontrado.` }
    }
  } catch {
    status.value = { tipo: 'erro', msg: 'Nenhum caminho encontrado entre as duas pessoas.' }
  } finally {
    buscando.value = false
  }
}

function abrirFicha(p: any) {
  if (abrirFichaLayout) abrirFichaLayout(p as Pessoa)
}

const gerandoRelatorio = ref(false)

async function gerarRelatorio() {
  if (!pessoa1.value || !pessoa2.value) return
  gerandoRelatorio.value = true
  try {
    const resp = await fetch(`/api/relatorio/caminho?id1=${pessoa1.value.id}&id2=${pessoa2.value.id}`)
    if (!resp.ok) throw new Error('Erro ao gerar relatório')
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const disposition = resp.headers.get('Content-Disposition') ?? ''
    const match = disposition.match(/filename="([^"]+)"/)
    a.download = match?.[1] ?? 'parentesco.docx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    alert('Não foi possível gerar o relatório.')
  } finally {
    gerandoRelatorio.value = false
  }
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: width 0.15s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { width: 0; }
.slide-enter-to, .slide-leave-from { width: 16rem; }
</style>