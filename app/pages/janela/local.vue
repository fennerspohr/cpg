<template>
  <div class="h-screen w-screen overflow-hidden">
    <ModalLocal janela-real @close="fechar" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'janela' })

const { fechar } = useJanela()
</script>
