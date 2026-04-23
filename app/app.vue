<template>
  <div @click="getArvore()">
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
    <!-- {{ pessoa }} -->
  </div>
</template>

<script setup>
// Sending a query param
import {ref} from 'vue';
const pessoa = ref();
const response = ref();
const arvore = ref();

async function getPessoa(){
  pessoa.value = await $fetch('/api/pessoa/', {
  query: { nome: 'ana' }
})
console.log(pessoa.value)
}

async function getArvore(){
  arvore.value = await $fetch('/api/pessoa/',{
    query: { id: 1, tipo:'tree'}
  })
  console.log(arvore.value)
}

async function postLocal(){
  response.value = await $fetch('/api/local', {
    method: 'POST',
    body: {
      descricao: 'tuparendi'
    }
  });
  console.log(response.value)
};
</script>
