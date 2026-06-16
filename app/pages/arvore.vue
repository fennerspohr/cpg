<template>
  <div class="flex h-full bg-[#c0c0c0] font-sans overflow-hidden">

    <!-- CONTEÚDO PRINCIPAL -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

      <!-- Barra de título -->
      <div class="flex-none flex items-center justify-between bg-primary border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-1 m-2 mb-1">
        <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
          <Icon name="lucide:folder-tree" class="text-sm" />
          Buscar Árvore Genealógica
        </h2>
        <button
          @click="painelAberto = !painelAberto"
          class="flex items-center gap-1 border-2 bg-base-100 px-2 py-0.5 text-[9px] font-bold uppercase hover:brightness-110"
          :class="painelAberto
            ? 'border-t-base-300 border-l-base-300 border-r-white border-b-white'
            : 'border-t-white border-l-white border-r-base-300 border-b-base-300'">
          <Icon name="lucide:users" class="text-[10px]" />
          {{ painelAberto ? 'Ocultar Lista' : 'Ver Pessoas' }}
        </button>
      </div>

      <!-- Seletor de pessoa -->
      <div class="flex-none px-2 pb-1">
        <fieldset class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 pt-1 pb-3 relative">
          <legend class="text-[10px] font-bold px-1 uppercase text-[#404040]">Pessoa</legend>

          <!-- Pessoa selecionada -->
          <div v-if="pessoaSelecionada"
            class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-2 flex items-center justify-between"
            :style="{ backgroundColor: pessoaSelecionada.sexo === 'M' ? 'var(--color-male,#c8dce8)' : 'var(--color-female,#e8c8d8)' }">
            <div>
              <p class="text-sm font-bold uppercase leading-tight">{{ pessoaSelecionada.sobrenome }}, {{ pessoaSelecionada.nome }}</p>
              <p class="text-[10px] text-[#404040] font-mono mt-0.5">
                ID {{ String(pessoaSelecionada.id).padStart(3, '0') }}
                · b.: {{ pessoaSelecionada.datanasc?.substring(0, 4) ?? '—' }}
                <template v-if="pessoaSelecionada.datamorte"> · d.: {{ pessoaSelecionada.datamorte.substring(0, 4) }}</template>
              </p>
            </div>
            <button @click="limpar"
              class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 w-6 h-6 flex items-center justify-center text-xs font-bold hover:brightness-110 ml-2 flex-none">
              ×
            </button>
          </div>

          <!-- Input de busca -->
          <div v-else class="relative">
            <input
              v-model="busca"
              type="text"
              placeholder="Digite o nome ou ID para buscar..."
              @focus="focoAberto = true"
              @blur="setTimeout(() => focoAberto = false, 150)"
              class="bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1.5 text-sm outline-none focus:bg-[#ffffcc] w-full"
            />
            <div v-if="focoAberto && resultados.length"
              class="absolute top-full left-0 right-0 z-30 border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white bg-white max-h-52 overflow-y-auto shadow-md">
              <button
                v-for="p in resultados" :key="p.id"
                @mousedown.prevent="selecionar(p)"
                class="w-full text-left px-2 py-1.5 text-xs border-b border-gray-100 hover:bg-[#000080] hover:text-white flex items-center gap-2 group">
                <span class="w-4 h-4 flex-none border border-gray-300 group-hover:border-white"
                  :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male,#5588aa)' : 'var(--color-female,#aa5588)' }" />
                <span class="font-bold uppercase flex-1">{{ p.sobrenome }}, {{ p.nome }}</span>
                <span class="font-mono text-[10px] text-gray-400 group-hover:text-white">{{ p.datanasc?.substring(0, 4) ?? '?' }}</span>
              </button>
            </div>
            <p v-else-if="focoAberto && busca && !resultados.length"
              class="absolute top-full left-0 right-0 z-30 bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-3 py-2 text-[10px] text-base-300 italic">
              Nenhum resultado.
            </p>
          </div>
        </fieldset>
      </div>

      <!-- Área da árvore -->
      <div class="flex-1 mx-2 mb-2 border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white overflow-hidden flex flex-col bg-base-100">

        <!-- Placeholder -->
        <div v-if="!pessoaSelecionada"
          class="flex-1 flex flex-col items-center justify-center gap-3 text-base-300">
          <Icon name="lucide:folder-tree" class="text-5xl opacity-30" />
          <p class="text-sm uppercase tracking-widest">Selecione uma pessoa para exibir a árvore</p>
        </div>

        <!-- Carregando -->
        <div v-else-if="carregando"
          class="flex-1 flex items-center justify-center text-sm text-[#404040] animate-pulse uppercase tracking-widest">
          Carregando árvore...
        </div>

        <!-- Erro -->
        <div v-else-if="erro"
          class="flex-1 flex flex-col items-center justify-center gap-3">
          <Icon name="lucide:unlink" class="text-5xl text-red-400 opacity-60" />
          <p class="text-base font-bold uppercase text-red-700">Não foi possível carregar a árvore</p>
          <p class="text-xs text-[#606060]">Tente novamente ou verifique os vínculos desta pessoa.</p>
        </div>

        <!-- Árvore -->
        <ClientOnly v-else-if="arvore.length">
          <Familytree
            :data="arvore"
            :main="String(pessoaSelecionada!.id)"
            :on-card-click="(id: number) => abrirFichaLayout?.(todasPessoas?.find(p => p.id === id)!)"
            style="width:100%;height:100%;"
          />
        </ClientOnly>
      </div>

      <!-- Barra de status -->
      <div class="flex-none mx-2 mb-1 flex justify-between items-center">
        <div class="border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-0.5">
          <span class="text-[9px] text-black uppercase font-bold">CPG - Sistema de Genealogia</span>
        </div>
        <div v-if="pessoaSelecionada" class="border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-0.5">
          <span class="text-[9px] text-black">
            {{ carregando ? 'Carregando...' : erro ? 'Erro ao carregar' : `${arvore.length} pessoa(s) na árvore` }}
          </span>
        </div>
      </div>

    </div>

    <!-- PAINEL LATERAL -->
    <transition name="slide">
      <div v-if="painelAberto" class="flex flex-col w-64 flex-none border-l-2 border-base-300 bg-base-100 overflow-hidden">

        <div class="flex-none flex items-center justify-between bg-primary px-2 py-1">
          <span class="text-white text-xs font-bold uppercase">Pessoas Cadastradas</span>
          <button @click="painelAberto = false"
            class="bg-base-100 border border-t-white border-l-white border-r-base-300 border-b-base-300 w-5 h-5 flex items-center justify-center text-sm font-bold">×</button>
        </div>

        <div class="flex-none px-2 pt-1.5 pb-1">
          <p class="text-[9px] text-[#404040] font-bold uppercase">
            Clique para <span class="font-normal normal-case">selecionar e exibir a árvore</span>
          </p>
        </div>

        <div class="flex-none p-1.5 border-b border-base-300">
          <input v-model="buscaLateral" type="text" placeholder="Buscar por nome..."
            class="w-full bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-1 text-xs outline-none" />
        </div>

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
                <td colspan="3" class="p-2 text-[9px] text-gray-400 italic text-center">Nenhuma encontrada</td>
              </tr>
              <tr
                v-for="p in pessoasFiltradas" :key="p.id"
                @click="selecionar(p)"
                class="border-b border-gray-100 cursor-pointer hover:brightness-90 transition-colors"
                :class="pessoaSelecionada?.id === p.id ? 'outline-2 outline-[#000080] -outline-offset-2' : ''"
                :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male)' : 'var(--color-female)' }"
              >
                <td class="px-1 py-1 font-mono text-[9px] font-bold">{{ String(p.id).padStart(3, '0') }}</td>
                <td class="px-1 py-1 text-[9px]">{{ p.sobrenome }}, {{ p.nome }}</td>
                <td class="px-1 py-1 text-[9px] font-mono text-right">{{ p.datanasc?.substring(0, 4) ?? '----' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex-none border-t border-base-300 px-2 py-1">
          <span class="text-[8px] text-base-300">{{ pessoasFiltradas.length }} registro(s)</span>
        </div>

      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
interface Pessoa {
  id: number; nome: string; sobrenome: string; sexo: string | null
  datanasc: string | null; datamorte: string | null; databatismo: string | null
  localnasc: number | null; localbatismo: number | null; localmorte: number | null; obs: string | null
}

const route             = useRoute()
const abrirFichaLayout  = inject<(p: Pessoa) => void>('abrirFicha')

const { data: todasPessoas } = await useFetch<Pessoa[]>('/api/pessoa')

const pessoaSelecionada = ref<Pessoa | null>(null)
const busca             = ref('')
const focoAberto        = ref(false)
const painelAberto      = ref(false)
const buscaLateral      = ref('')
const carregando        = ref(false)
const erro              = ref(false)
const arvore            = ref<any[]>([])

const resultados = computed(() => {
  if (!busca.value || !todasPessoas.value) return []
  const q = busca.value.toLowerCase()
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

async function selecionar(p: Pessoa) {
  pessoaSelecionada.value = p
  busca.value = ''
  focoAberto.value = false
  await carregarArvore(p.id)
}

function limpar() {
  pessoaSelecionada.value = null
  arvore.value = []
  erro.value = false
}

async function carregarArvore(id: number) {
  carregando.value = true
  erro.value = false
  arvore.value = []
  try {
    const data = await $fetch<any[]>('/api/arvore/', { query: { id } })
    if (!data?.length) { erro.value = true } else { arvore.value = data }
  } catch {
    erro.value = true
  } finally {
    carregando.value = false
  }
}

// Pré-seleciona via ?id=X na URL
onMounted(async () => {
  const id = Number(route.query.id)
  if (id && todasPessoas.value) {
    const p = todasPessoas.value.find(x => x.id === id)
    if (p) await selecionar(p)
  }
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: width 0.15s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { width: 0; }
.slide-enter-to, .slide-leave-from { width: 16rem; }
</style>
