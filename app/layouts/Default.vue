<template>
  <div class="h-screen flex flex-col overflow-hidden bg-[#c0c0c0]">
    <Navbar @open-cities="isModalCityOpen = true" @open-search="isModalSearchOpen = true" />
    
    <main class="flex-1 overflow-auto">
      <slot />
    </main>

    <ModalLocal v-if="isModalCityOpen" @close="isModalCityOpen = false" />
    <ModalBusca v-if="isModalSearchOpen" @close="isModalSearchOpen = false" />
  </div>
</template>

<script setup lang="ts">
const isModalCityOpen = ref(false)
const isModalSearchOpen = ref(false)
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>