<template>
  <div class="h-full p-4 flex flex-col font-sans text-base-content bg-[#c0c0c0]">

    <!-- Barra de título da janela -->
    <div class="flex-none flex items-center justify-between bg-primary border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-1 mb-2">
      <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
        <Icon name="lucide:users" class="text-sm" />
        Lista de Pessoas Cadastradas — [{{ sortedPeople?.length || 0 }} registro(s)]
        <span v-if="route.query.q" class="text-[10px] lowercase font-normal opacity-80">
          (Filtrando por: "{{ route.query.q }}")
        </span>
      </h2>
      <div class="flex items-center gap-2">
        <button
          v-if="route.query.q"
          @click="limparBusca"
          class="text-[9px] bg-[#d4d0c8] px-2 py-0.5 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black hover:brightness-110 uppercase font-bold active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
        >
          Limpar Filtro
        </button>
        <button
          @click="refresh()"
          class="bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-0.5 w-5 h-5 flex items-center justify-center hover:brightness-110 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
          title="Atualizar lista"
        >
          <Icon name="lucide:refresh-cw" class="text-[11px] text-black" :class="{ 'animate-spin': pending }" />
        </button>
      </div>
    </div>

    <!-- Área da tabela com borda sunken -->
    <div class="flex-1 overflow-auto border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white">
      <table class="w-full text-left border-collapse">
        <thead class="sticky top-0 z-10 bg-[#d4d0c8]">
          <tr>
            <SortableHeader label="ID"                 field="id"        :sort="sort" @sort="setSort" class="w-16 text-center" />
            <SortableHeader label="Sobrenome"          field="sobrenome" :sort="sort" @sort="setSort" />
            <SortableHeader label="Nome"               field="nome"      :sort="sort" @sort="setSort" />
            <SortableHeader label="Data de Nascimento" field="datanasc"  :sort="sort" @sort="setSort" />
            <SortableHeader label="Sexo"               field="sexo"      :sort="sort" @sort="setSort" class="w-16 text-center" />
          </tr>
        </thead>

        <tbody>
          <tr v-if="pending">
            <td colspan="5" class="p-4 text-center text-xs uppercase animate-pulse bg-white">
              Buscando no banco de dados...
            </td>
          </tr>

          <tr v-else-if="!sortedPeople?.length">
            <td colspan="5" class="p-10 text-center text-xs italic bg-white text-gray-400">
              Nenhum registro encontrado.
            </td>
          </tr>

          <tr
            v-else
            v-for="person in sortedPeople"
            :key="person.id"
            @click="abrirDetalhes(person)"
            class="cursor-pointer hover:brightness-95 active:brightness-90"
            :style="{ backgroundColor: person.sexo === 'M' ? 'var(--color-male)' : 'var(--color-female)' }"
          >
            <td class="px-2 py-0.5 text-center font-mono text-xs font-bold text-black border border-[#808080] border-t-0 border-l-0">
              {{ String(person.id).padStart(3, '0') }}
            </td>
            <td class="px-2 py-0.5 font-bold uppercase text-xs text-black border-r border-b border-[#808080]">
              {{ person.sobrenome }}
            </td>
            <td class="px-2 py-0.5 text-xs text-black border-r border-b border-[#808080]">
              {{ person.nome }}
            </td>
            <td class="px-2 py-0.5 text-xs text-black border-r border-b border-[#808080] font-mono">
              {{ formatarData(person.datanasc) }}
            </td>
            <td class="px-2 py-0.5 text-center font-bold text-xs text-black border-r border-b border-[#808080]">
              {{ person.sexo ?? '?' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Barra de status -->
    <div class="flex-none mt-1 px-1 border-t border-[#808080] flex justify-between items-center pt-1">
      <div class="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-0.5">
        <span class="text-[9px] text-black uppercase font-bold">CPG - Sistema de Genealogia</span>
      </div>
      <div class="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-0.5">
        <span class="text-[9px] text-black">{{ sortedPeople?.length || 0 }} registro(s)</span>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <ModalDetalhes
      v-if="pessoaSelecionada"
      :pessoa="pessoaSelecionada"
      @fechar="pessoaSelecionada = null"
      @excluir="handleExcluir"
      @editar="handleEditar"
    />

  </div>
</template>

<script setup lang="ts">
interface Pessoa {
  id: number
  nome: string
  sobrenome: string
  sexo: string | null
  datanasc: string | null
  datamorte: string | null
  localnasc: number | null
  localbatismo: number | null
  localmorte: number | null
  databatismo: string | null
  obs: string | null
}

type SortField = keyof Pessoa
type SortDir = 'asc' | 'desc'

const route = useRoute()
const router = useRouter()

const pessoaSelecionada = ref<Pessoa | null>(null)
const sort = ref<{ field: SortField; dir: SortDir }>({ field: 'id', dir: 'asc' })

const { data: people, refresh, pending } = await useFetch<Pessoa[]>(() => {
  const searchTerm = route.query.q
  return searchTerm ? `/api/pessoa?nome=${searchTerm}` : '/api/pessoa'
}, {
  watch: [() => route.query.q]
})

const sortedPeople = computed(() => {
  if (!people.value) return []
  return [...people.value].sort((a, b) => {
    const valA = a[sort.value.field] ?? ''
    const valB = b[sort.value.field] ?? ''
    const cmp = String(valA).localeCompare(String(valB), 'pt-BR', { numeric: true })
    return sort.value.dir === 'asc' ? cmp : -cmp
  })
})

function setSort(field: SortField) {
  if (sort.value.field === field) {
    sort.value.dir = sort.value.dir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value = { field, dir: 'asc' }
  }
}

function abrirDetalhes(person: Pessoa) {
  pessoaSelecionada.value = person
}

function formatarData(dataSrt: string | null): string {
  if (!dataSrt) return '--- --- ----'
  const data = new Date(dataSrt)
  data.setMinutes(data.getMinutes() + data.getTimezoneOffset())
  const dia = String(data.getDate()).padStart(2, '0')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${dia} ${meses[data.getMonth()]} ${data.getFullYear()}`
}

function limparBusca() {
  router.push({ path: '/' })
}

async function handleExcluir(id: number) {
  console.log('Excluir:', id)
  pessoaSelecionada.value = null
  await refresh()
}

function handleEditar(id: number) {
  console.log('Editar:', id)
}
</script>