<template>
  <div class="h-full p-4 flex flex-col font-sans text-base-content">
    
    <div class="flex-none flex items-center justify-between bg-primary text-primary-content px-2 py-1 mb-1 shadow-[1px_1px_0px_#fff]">
      <h2 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
        <Icon name="lucide:users" class="text-sm" />
        Lista de Pessoas Cadastradas — [{{ people?.length || 0 }} nome(s)]
      </h2>
    </div>

    <div class="flex-1 border-2 border-base-300 bg-white overflow-auto min-h-0 custom-scrollbar">
      <table class="w-full text-left border-collapse select-none">
        <thead class="sticky top-0 z-10 bg-base-200 shadow-[inset_0_-1px_0_var(--color-base-300)]">
          <tr>
            <th v-for="header in ['ID', 'Família', 'Nome', 'Nascimento', 'Sexo', 'Ações']" 
                :key="header"
                class="border-r border-base-300 px-2 py-1 text-xs font-normal shadow-[inset_1px_1px_0_#fff]">
              {{ header }}
            </th>
          </tr>
        </thead>
        
        <tbody class="text-sm">
          <PersonRow
            v-for="person in people" 
            :key="person.id" 
            :person="person"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </tbody>
      </table>
      
      <div v-if="!people?.length" class="p-10 text-center text-xs text-base-content/50 italic">
        Nenhum registro encontrado no sistema.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Person } from '~/types/person'

const { data: people } = await useFetch<Person[]>('/api/people', {
  default: () => []
});

const handleEdit = (id: number) => console.log('Editing ID:', id);
const handleDelete = (id: number) => console.log('Deleting ID:', id);
</script>

<style scoped>
@reference "../assets/css/main.css";

.custom-scrollbar::-webkit-scrollbar { width: 16px; height: 16px; }
.custom-scrollbar::-webkit-scrollbar-track { @apply bg-base-200; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  @apply bg-base-200 border-2;
  border-color: #fff var(--color-base-300) var(--color-base-300) #fff;
}
</style>