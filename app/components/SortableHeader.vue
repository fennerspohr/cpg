<template>
  <th
    @click="$emit('sort', field)"
    class="px-2 py-1 text-[10px] font-bold uppercase text-black cursor-pointer select-none border-r border-b border-[#808080] bg-[#d4d0c8] hover:brightness-105 active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white whitespace-nowrap"
    :class="[sort.field === field ? 'border-t-[#808080] border-l-[#808080] border-r-white border-b-white' : 'border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]']"
  >
    <div class="flex items-center gap-1">
      {{ label }}
      <span class="text-[9px]">
        <template v-if="sort.field === field">{{ sort.dir === 'asc' ? '▲' : '▼' }}</template>
        <template v-else><span class="opacity-40">⇅</span></template>
      </span>
    </div>
  </th>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  field: string
  sort: { field: string; dir: 'asc' | 'desc' }
}>()

defineEmits<{ sort: [field: string] }>()
</script>