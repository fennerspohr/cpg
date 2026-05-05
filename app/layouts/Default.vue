<template>
  <div class="h-screen bg-base-200 flex flex-col overflow-hidden">
    
 <Navbar @open-cities="isModalOpen = true" />
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
    <ModalLocal v-if="isModalOpen" @close="isModalOpen = false" />
  </div>
</template>

<script lang="ts" setup>
const isModalOpen = ref(false)
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>