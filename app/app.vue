<template>
  <NuxtLayout>
    <!-- <NuxtPage /> -->
    <Familytree :data="arvore" main="26"/>
  </NuxtLayout>
</template>

<script setup>
import Familytree from './pages/familytree.vue';

// Sending a query param
// import {ref} from 'vue';
// const pessoa = ref();
// const response = ref();
const arvore = ref();

// async function getPessoa(){
//   pessoa.value = await $fetch('/api/pessoa/', {
//   query: { nome: 'ana' }
// })
// console.log(pessoa.value)
// }


arvore.value = await $fetch('/api/arvore/',{
    query: { id: 26}
  })
  // console.log(arvore.value)


// async function postLocal(){
//   response.value = await $fetch('/api/local', {
//     method: 'POST',
//     body: {
//       descricao: 'tuparendi'
//     }
//   });
//   console.log(response.value)
// };
</script>
