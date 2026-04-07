<template>
  <tr 
  class="group cursor-pointer border-b border-base-300 transition-colors"
    :class="[
      person.sexo === 'M' ? 'bg-male hover:bg-male/40' : 'bg-female hover:bg-female/40',
      'cursor-pointer border-b border-base-200 transition-colors'
    ]"
  >
    <td class="px-2 py-1 border-r border-base-200 text-xs font-mono">{{ person.id}}</td>
    <td class="px-2 py-1 border-r border-base-200 font-bold uppercase">{{ person.sobrenome }}</td>
    <td class="px-2 py-1 border-r border-base-200">{{ person.nome }}</td>
    <td class="px-2 py-1 border-r border-base-200">{{ person.data_de_nascimento || '--- --- ----' }}</td>
    <td class="px-2 py-1 border-r border-base-200 text-center font-bold">{{ person.sexo }}</td>
    <!--poder deletar ou editar pessoa-->
    <td class="px-2 py-1 flex gap-2">
      <button @click.stop="$emit('edit', person.id)" class="hover:underline text-blue-800 text-[10px]">Editar</button>
      <button @click.stop="$emit('delete', person.id)" class="hover:underline text-red-800 text-[10px]">Deletar</button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Person } from '~/types/person'

defineProps<{ person: Person }>();
defineEmits(['edit', 'delete']);
</script>