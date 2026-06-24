<template>
  <div class="h-screen w-screen overflow-hidden">
    <JanelaArvore
      :pessoa-id="id"
      :nome="nome"
      janela-real
      @fechar="fechar"
      @abrir-pessoa="abrirPessoa"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'janela' })

const route = useRoute()
const { abrir, fechar } = useJanela()

const id = Number(route.query.id)
const nome = String(route.query.nome ?? '')

function abrirPessoa(pid: number) {
  abrir('detalhes', { id: pid })
}
</script>
