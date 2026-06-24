<template>
  <th
    @click="emit('sort', field)"
    class="px-2 py-1 text-[10px] font-bold uppercase text-black cursor-pointer select-none bg-base-100 hover:brightness-105 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white whitespace-nowrap"
    :class="sort.field === field
      ? 'border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white'
      : 'border-2 border-t-white border-l-white border-r-base-300 border-b-base-300'"
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
const emit = defineEmits<{ sort: [field: string] }>()

defineProps<{
  label: string
  field: string
  sort: { field: string; dir: 'asc' | 'desc' }
}>()
</script>
