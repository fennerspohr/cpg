<template>
  <tr 
    class="group border-b border-gray-400 cursor-default select-none transition-colors hover:bg-gray-200"
    :style="{ backgroundColor: person.sexo === 'M' ? '#00ffff' : '#ff00ff' }"
  >
    <td class="px-2 py-0.5 border-r border-gray-400 text-black font-mono text-xs text-center font-bold">
      {{ String(person.id).padStart(3, '0') }}
    </td>
    
    <td class="px-2 py-0.5 border-r border-gray-400 font-bold uppercase text-black text-sm">
      {{ person.sobrenome }}
    </td>
    
    <td class="px-2 py-0.5 border-r border-gray-400 text-black text-sm">
      {{ person.nome }}
    </td>
    
    <td class="px-2 py-0.5 border-r border-gray-400 text-black text-sm">
      {{ formatarDataWin95(person.datanasc) }}
    </td>
    
    <td class="px-2 py-0.5 border-r border-gray-400 text-center font-bold text-black text-sm w-16">
      {{ person.sexo }}
    </td>
    
  </tr>
</template>

<script setup lang="ts">
// Importamos o tipo se você tiver ele definido em types/person.ts
import type { Person } from '~/types/person'

defineProps<{ person: Person }>()
defineEmits(['edit', 'delete'])

// Função auxiliar para formatar a data exatamente como na imagem (ex: 04 Jul 1877)
function formatarDataWin95(dataSrt: string | null): string {
  if (!dataSrt) return '--- --- ----'
  
  const data = new Date(dataSrt)
  // Ajuste para evitar problemas de fuso horário que mudam o dia
  data.setMinutes(data.getMinutes() + data.getTimezoneOffset())

  const dia = String(data.getDate()).padStart(2, '0')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const mes = meses[data.getMonth()]
  const ano = data.getFullYear()
  
  return `${dia} ${mes} ${ano}`
}
</script>