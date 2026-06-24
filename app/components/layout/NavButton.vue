<template>
  <component
    :is="to ? nuxtLink : 'button'"
    v-bind="to ? { to } : { type: 'button' }"
    class="nav-btn group"
  >
    <Icon :name="icon" class="icon-style" :class="iconClass" />
    <span class="label-style">{{ label }}</span>
  </component>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  icon: string
  to?: string
  iconClass?: string
}>()

const nuxtLink = resolveComponent('NuxtLink')
</script>

<style scoped>
@reference "../../assets/css/main.css";

.nav-btn {
  @apply flex flex-col items-center justify-center w-24 h-16 bg-base-100
         border-2 border-t-white border-l-white border-r-base-300 border-b-base-300
         hover:bg-base-200 active:border-t-base-300 active:border-l-base-300
         active:border-r-white active:border-b-white;
}

.icon-style {
  @apply text-2xl transition-transform group-active:scale-90;
}

.label-style {
  @apply text-[9px] mt-1 font-bold uppercase tracking-tight text-center leading-tight;
}
</style>
