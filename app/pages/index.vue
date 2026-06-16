<template>
  <div class="h-full flex flex-col font-sans bg-[#c0c0c0]">

    <!-- Barra de título -->
    <div class="flex-none flex items-center justify-between bg-primary border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 py-1.5 mx-3 mt-3 mb-2">
      <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
        <Icon name="lucide:users" class="text-sm" />
        Lista de Pessoas Cadastradas
        <span class="font-normal opacity-75">— {{ sortedPeople.length }} registro(s)</span>
        <span v-if="route.query.q" class="text-[10px] lowercase font-normal opacity-80">
          &nbsp;· filtrando por "{{ route.query.q }}"
        </span>
      </h2>
      <div class="flex items-center gap-2">
        <button v-if="route.query.q" @click="router.push('/')"
          class="text-[9px] bg-base-100 px-2 py-0.5 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 text-black hover:brightness-110 uppercase font-bold active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white">
          × Limpar Filtro
        </button>
        <button @click="refresh()" title="Atualizar lista"
          class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-6 h-6 flex items-center justify-center hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white">
          <Icon name="lucide:refresh-cw" class="text-xs text-black" :class="{ 'animate-spin': pending }" />
        </button>
      </div>
    </div>

    <!-- Tabela -->
    <div class="scroll-area flex-1 overflow-auto mx-3 border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white">
      <table class="w-full text-left border-collapse table-fixed">
        <colgroup>
          <col class="w-14" />
          <col class="w-52" />
          <col />
          <col class="w-24" />
          <col class="w-20" />
          <col class="w-20" />
        </colgroup>
        <thead class="sticky top-0 z-10 bg-base-100">
          <tr>
            <SortableHeader label="ID"         field="id"        :sort="sort" @sort="setSort" class="text-center" />
            <SortableHeader label="Sobrenome"  field="sobrenome" :sort="sort" @sort="setSort" />
            <SortableHeader label="Nome"       field="nome"      :sort="sort" @sort="setSort" />
            <SortableHeader label="Nasc."      field="datanasc"  :sort="sort" @sort="setSort" class="text-center" />
            <SortableHeader label="Óbito"      field="datamorte" :sort="sort" @sort="setSort" class="text-center" />
            <SortableHeader label="Sexo"       field="sexo"      :sort="sort" @sort="setSort" class="text-center" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="6" class="py-10 text-center text-xs uppercase animate-pulse bg-white text-[#606060] tracking-widest">
              Buscando no banco de dados...
            </td>
          </tr>
          <tr v-else-if="!sortedPeople.length">
            <td colspan="6" class="py-14 text-center text-sm italic bg-white text-gray-400">
              Nenhum registro encontrado.
            </td>
          </tr>
          <tr
            v-else
            v-for="p in sortedPeople"
            :key="p.id"
            @click="abrirFicha?.(p)"
            class="cursor-pointer border-b border-base-300 hover:brightness-95 active:brightness-90 transition-[filter]"
            :style="{ backgroundColor: p.sexo === 'M' ? 'var(--color-male)' : 'var(--color-female)' }"
          >
            <td class="px-2 py-2 text-center font-mono text-xs font-bold text-[#404040] border-r border-base-300">
              {{ String(p.id).padStart(3, '0') }}
            </td>
            <td class="px-3 py-2 font-bold uppercase text-sm text-black border-r border-base-300 truncate">
              {{ p.sobrenome }}
            </td>
            <td class="px-3 py-2 text-sm text-black border-r border-base-300 truncate">
              {{ p.nome }}
            </td>
            <td class="px-2 py-2 text-xs font-mono text-center border-r border-base-300 text-[#303030]">
              {{ p.datanasc?.substring(0, 4) ?? '—' }}
            </td>
            <td class="px-2 py-2 text-xs font-mono text-center border-r border-base-300"
              :class="p.datamorte ? 'text-[#505050]' : 'text-[#b8b8b8]'">
              {{ p.datamorte?.substring(0, 4) ?? '—' }}
            </td>
            <td class="px-2 py-2 text-xs text-center font-semibold border-r border-base-300"
              :class="p.sexo === 'M' ? 'text-blue-800' : p.sexo === 'F' ? 'text-pink-800' : 'text-gray-400'">
              {{ p.sexo === 'M' ? 'Masc.' : p.sexo === 'F' ? 'Fem.' : '?' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Barra de status W95 -->
    <div class="flex-none bg-base-100 border-t-2 border-t-base-300 border-b border-b-white flex items-center gap-4 px-3.5 py-3.5">
      <div class="border border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-px">
        <span class="text-[9px] font-bold uppercase tracking-wide text-black">Centro de Pesquisas Genealógicas de Nova Palma (CPG)</span>
      </div>
      <div class="border border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-px">
        <span class="text-[9px] text-black">{{ sortedPeople.length }} registro(s)</span>
      </div>
      <div v-if="route.query.q" class="border border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-px">
        <span class="text-[9px] text-black italic">Filtro ativo: "{{ route.query.q }}"</span>
      </div>
      <div class="ml-auto border border-t-base-300 border-l-base-300 border-r-white border-b-white px-2 py-px">
        <span class="text-[9px] text-black" :class="{ 'animate-pulse': pending }">
          {{ pending ? 'Carregando...' : 'Pronto' }}
        </span>
      </div>
    </div>

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
  databatismo: string | null
  localnasc: number | null
  localbatismo: number | null
  localmorte: number | null
  obs: string | null
}

type SortField = keyof Pessoa
type SortDir   = 'asc' | 'desc'

const route  = useRoute()
const router = useRouter()

const abrirFicha      = inject<(p: Pessoa) => void>('abrirFicha')
const mutacaoContador = inject<Ref<number>>('mutacaoContador')

const sort = ref<{ field: SortField; dir: SortDir }>({ field: 'id', dir: 'asc' })

const { data: people, refresh, pending } = await useFetch<Pessoa[]>(
  () => route.query.q ? `/api/pessoa?nome=${route.query.q}` : '/api/pessoa',
  { watch: [() => route.query.q] }
)

watch(mutacaoContador!, () => refresh())

const sortedPeople = computed(() => {
  if (!people.value) return []
  return [...people.value].sort((a, b) => {
    const cmp = String(a[sort.value.field] ?? '').localeCompare(
      String(b[sort.value.field] ?? ''), 'pt-BR', { numeric: true }
    )
    return sort.value.dir === 'asc' ? cmp : -cmp
  })
})

function setSort(field: string) {
  const f = field as SortField
  sort.value = sort.value.field === f
    ? { field: f, dir: sort.value.dir === 'asc' ? 'desc' : 'asc' }
    : { field: f, dir: 'asc' }
}
</script>

<style scoped>
/* Scrollbar estilo Windows 95 */
.scroll-area::-webkit-scrollbar {
  width: 17px;
  height: 17px;
}
.scroll-area::-webkit-scrollbar-track {
  background: repeating-conic-gradient(#b8b8b8 0% 25%, #d0d0d0 0% 50%) 0 0 / 2px 2px;
}
.scroll-area::-webkit-scrollbar-thumb {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #ffffff;
  border-left-color: #ffffff;
  border-right-color: #808080;
  border-bottom-color: #808080;
  min-height: 24px;
}
.scroll-area::-webkit-scrollbar-thumb:hover {
  background: #c8c4bc;
}
.scroll-area::-webkit-scrollbar-button {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #ffffff;
  border-left-color: #ffffff;
  border-right-color: #808080;
  border-bottom-color: #808080;
  width: 17px;
  height: 17px;
  display: block;
}
.scroll-area::-webkit-scrollbar-button:active {
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: #ffffff;
  border-bottom-color: #ffffff;
}
.scroll-area::-webkit-scrollbar-corner {
  background: #d4d0c8;
}
</style>
