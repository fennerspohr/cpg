<template>
  <div class="h-screen w-screen overflow-hidden">
    <JanelaDetalhes
      v-if="pessoa"
      :pessoa="pessoa"
      janela-real
      @fechar="fechar"
      @abrir-pessoa="abrirPessoa"
      @ver-arvore="abrirArvore"
      @editar="editar"
      @excluir="excluir"
    />
    <div v-else class="h-full flex items-center justify-center text-sm text-win-text uppercase tracking-widest animate-pulse">
      Carregando...
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'janela' })

const route = useRoute()
const { abrir, fechar, notificarRefresh, navegarNaJanelaPrincipal } = useJanela()

const id = Number(route.query.id)

const { data: pessoas } = await useFetch<Pessoa[]>('/api/pessoa', { query: { nome: id } })
const pessoa = computed(() => pessoas.value?.[0] ?? null)

function abrirPessoa(p: Pessoa) {
  abrir('detalhes', { id: p.id, nome: p.nome })
}

function abrirArvore(pid: number) {
  abrir('arvore', { id: pid, nome: pessoa.value?.nome ?? '' })
}

function editar(pid: number) {
  navegarNaJanelaPrincipal('/editar/' + pid)
  fechar()
}

async function excluir(pid: number) {
  try {
    await $fetch('/api/pessoa', { method: 'DELETE', body: { id: pid } })
    notificarRefresh()
    fechar()
  } catch (err) {
    const msg = (err as { data?: { message?: string }; message?: string })?.data?.message
      ?? (err instanceof Error ? err.message : 'Tente novamente.')
    alert('Erro ao excluir: ' + msg)
  }
}
</script>
