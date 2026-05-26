<template>
  <Familytree :data="arvore" main="1"/>
</template>

<script setup>
import Familytree from './familytree.vue';

const arvore = ref();

arvore.value = await $fetch('/api/arvore/', {
  query: { id: 1 }
});
</script>