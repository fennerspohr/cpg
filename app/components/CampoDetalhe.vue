<template>
  <div class="flex flex-col gap-0.5">
    <span class="text-[9px] font-bold uppercase text-gray-500 tracking-wider">{{ label }}</span>
    <div class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-0.5 text-[11px] text-gray-800 min-h-[22px]">
      {{ valor ?? '—' }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  valor: string | null | undefined
}>()
</script>