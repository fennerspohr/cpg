<template>
  <div class="h-full p-4 flex flex-col font-sans text-base-content bg-[#c0c0c0]">
    
    <div class="flex-none flex items-center justify-between bg-primary border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-2 py-1 mb-2 shadow-sm">
      <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
        <Icon name="lucide:users" class="text-sm" />
        Lista de Pessoas Cadastradas — [{{ people?.length || 0 }} registro(s)]
        <span v-if="route.query.q" class="text-[10px] lowercase font-normal opacity-80">
          (Filtrando por: "{{ route.query.q }}")
        </span>
      </h2>
      <div class="flex items-center gap-2">
        <button v-if="route.query.q" @click="limparBusca" class="text-[9px] bg-[#d4d0c8] px-2 border border-black text-black hover:bg-white uppercase font-bold">
          Limpar Filtro
        </button>
        <button @click="refresh()" class="hover:bg-blue-800 p-0.5 rounded transition-colors" :class="{ 'animate-spin': pending }">
          <Icon name="lucide:refresh-cw" class="text-xs text-white" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white shadow-[inset_0_0_0_1px_#000]">
      <table class="w-full text-left border-collapse select-none">
        <thead class="sticky top-0 z-10">
          <tr class="bg-base-100">
            <th class="p-1 border-r border-b border-t-white border-l-white border-r-base-300 border-b-base-300 text-[10px] font-bold uppercase text-[#404040] w-14 text-center">ID</th>
            <th class="p-1 border-r border-b border-t-white border-l-white border-r-base-300 border-b-base-300 text-[10px] font-bold uppercase text-[#404040]">Sobrenome</th>
            <th class="p-1 border-r border-b border-t-white border-l-white border-r-base-300 border-b-base-300 text-[10px] font-bold uppercase text-[#404040]">Nome</th>
            <th class="p-1 border-r border-b border-t-white border-l-white border-r-base-300 border-b-base-300 text-[10px] font-bold uppercase text-[#404040]">Data de Nascimento</th>
            <th class="p-1 border-r border-b border-t-white border-l-white border-r-base-300 border-b-base-300 text-[10px] font-bold uppercase text-[#404040] w-16 text-center">Sexo</th>
            <th class="p-1 border-b border-t-white border-l-white border-r-base-300 border-b-base-300 text-[10px] font-bold uppercase text-[#404040] w-28">Ações</th>
          </tr>
        </thead>
        
        <tbody class="text-sm">
          <PersonList
            v-for="person in people" 
            :key="person.id" 
            :person="person"
            @edit="handleEdit"
            @delete="handleDelete"
          />

          <tr v-if="!people?.length && !pending">
            <td colspan="6" class="p-10 text-center text-gray-400 italic">
              Nenhum registro encontrado para a busca atual.
            </td>
          </tr>
          
          <tr v-if="pending">
             <td colspan="6" class="p-4 text-center text-xs uppercase animate-pulse">Buscando no banco de dados...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-2 flex justify-between items-center px-1">
      <span class="text-[9px] text-gray-500 uppercase font-bold">CPG - Sistema de Genealogia</span>
      <NuxtLink to="/adicionar" class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 px-4 py-1 text-[10px] font-bold uppercase hover:bg-white active:border-t-base-300">
        Cadastrar Nova Ficha
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

// A mágica acontece aqui: 
// O primeiro argumento do useFetch é uma função reativa. 
// Sempre que route.query.q mudar, ele refaz o fetch.
const { data: people, refresh, pending } = await useFetch<any[]>(() => {
  const searchTerm = route.query.q;
  // Se houver termo, usa a rota com query string, senão traz todos
  return searchTerm 
    ? `/api/pessoa?nome=${searchTerm}` 
    : '/api/pessoa';
}, {
  watch: [() => route.query.q] // Monitora mudanças na URL
});

function limparBusca() {
  router.push({ path: '/' });
}

function handleEdit(id: number) {
  console.log('Editar pessoa:', id);
}

function handleDelete(id: number) {
  if (confirm('Deseja realmente excluir este registro?')) {
     console.log('Deletar pessoa:', id);
     // implementar chamada DELETE aqui futuramente
  }
}
</script>