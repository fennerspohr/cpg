<template>
  <div class="h-full p-4 flex flex-col font-sans text-base-content bg-[#c0c0c0]">
    
    <div class="flex-none flex items-center justify-between bg-primary border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-2 py-1 mb-2 shadow-sm">
      <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
        <Icon name="lucide:users" class="text-sm" />
        Lista de Pessoas Cadastradas — [{{ people?.length || 0 }} registro(s)]
      </h2>
      <button @click="refresh()" class="hover:bg-gray-200 p-0.5 rounded">
        <Icon name="lucide:refresh-cw" class="text-xs text-gray-600" />
      </button>
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

          <tr v-if="!people?.length">
            <td colspan="6" class="p-10 text-center text-gray-400 italic">
              Nenhuma pessoa cadastrada no sistema.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup lang="ts">
const { data: people, refresh } = await useFetch<any[]>('/api/pessoa', {
  default: () => []
});

function handleEdit(id: number) {
  console.log('Editar pessoa:', id);
  // Futuramente colocaremos a navegação/modal de edição aqui
}

function handleDelete(id: number) {
  console.log('Deletar pessoa:', id);
  // Futuramente chamaremos a exclusão do banco aqui
}
</script>