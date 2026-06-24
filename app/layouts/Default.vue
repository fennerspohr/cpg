<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <Navbar
      @open-cities="abrirCidades"
    />

    <main class="flex-1 overflow-hidden">
      <slot />
    </main>

    <div class="fixed inset-0 pointer-events-none z-50">
      <ModalLocal
        v-if="modalCidadeAberto"
        :z-index="zIndexDe('local')"
        :ativa="topoZOrdem === 'local'"
        @close="fecharCidades"
        @trazer-para-frente="trazerParaFrente('local')"
      />

      <JanelaDetalhes
        v-for="p in fichasAbertas"
        :key="'ficha-' + p.id"
        :pessoa="p"
        :z-index="zIndexDe('f-' + p.id)"
        :offset="fichasAbertas.indexOf(p)"
        :ativa="topoZOrdem === 'f-' + p.id"
        @fechar="fecharFicha(p.id)"
        @abrir-pessoa="abrirFicha"
        @excluir="excluirPessoa"
        @editar="(id) => editarPessoa(p.id, id)"
        @ver-arvore="abrirArvore"
        @trazer-para-frente="trazerParaFrente('f-' + $event)"
      />

      <JanelaArvore
        v-for="a in arvoresAbertas"
        :key="'arvore-' + a.id"
        :pessoa-id="a.id"
        :nome="a.nome"
        :z-index="zIndexDe('a-' + a.id)"
        :offset="arvoresAbertas.indexOf(a)"
        :ativa="topoZOrdem === 'a-' + a.id"
        @fechar="fecharArvore(a.id)"
        @abrir-pessoa="abrirFichaPorId"
        @trazer-para-frente="trazerParaFrente('a-' + $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { abrir, aoReceberNavegacao } = useJanela()

const pararNavegacao = aoReceberNavegacao((path) => router.push(path))
onUnmounted(() => pararNavegacao?.())

const modalCidadeAberto = ref(false)
const fichasAbertas     = ref<Pessoa[]>([])
const arvoresAbertas     = ref<{ id: number; nome: string }[]>([])

// z-order unificado — chaves: 'f-ID' para fichas, 'a-ID' para árvores
const zOrdem = ref<string[]>([])

const topoZOrdem = computed(() => zOrdem.value.at(-1) ?? '')

function zIndexDe(key: string) {
  return 110 + zOrdem.value.indexOf(key)
}

function trazerParaFrente(key: string) {
  const idx = zOrdem.value.indexOf(key)
  if (idx === -1 || idx === zOrdem.value.length - 1) return
  zOrdem.value.splice(idx, 1)
  zOrdem.value.push(key)
}

function abrirFicha(p: Pessoa) {
  const key = 'f-' + p.id
  if (fichasAbertas.value.find(f => f.id === p.id)) {
    trazerParaFrente(key)
  } else {
    fichasAbertas.value.push(p)
    zOrdem.value.push(key)
  }
}

async function abrirFichaPorId(id: number) {
  const lista = await $fetch<Pessoa[]>('/api/pessoa', { query: { nome: String(id) } })
  const p = lista?.find(x => x.id === id)
  if (p) abrirFicha(p)
}

function editarPessoa(fichaId: number, pessoaId: number) {
  fecharFicha(fichaId)
  router.push('/editar/' + pessoaId)
}

function fecharFicha(id: number) {
  fichasAbertas.value = fichasAbertas.value.filter(f => f.id !== id)
  zOrdem.value = zOrdem.value.filter(z => z !== 'f-' + id)
}

async function excluirPessoa(id: number) {
  try {
    await $fetch('/api/pessoa', { method: 'DELETE', body: { id } })
    fecharFicha(id)
    mutacaoContador.value++
  } catch (err) {
    const msg = (err as { data?: { message?: string }; message?: string })?.data?.message
      ?? (err instanceof Error ? err.message : 'Tente novamente.')
    alert('Erro ao excluir: ' + msg)
  }
}

function abrirCidades() {
  // No Electron abre janela real; no navegador cai na janela flutuante embutida.
  if (abrir('local')) return
  if (modalCidadeAberto.value) {
    trazerParaFrente('local')
    return
  }
  modalCidadeAberto.value = true
  zOrdem.value.push('local')
}

function fecharCidades() {
  modalCidadeAberto.value = false
  zOrdem.value = zOrdem.value.filter(z => z !== 'local')
}

function abrirArvore(id: number) {
  const key = 'a-' + id
  if (arvoresAbertas.value.find(a => a.id === id)) {
    trazerParaFrente(key)
    return
  }
  const p = fichasAbertas.value.find(f => f.id === id)
  arvoresAbertas.value.push({ id, nome: p ? `${p.nome} ${p.sobrenome}` : `ID ${id}` })
  zOrdem.value.push(key)
}

function fecharArvore(id: number) {
  arvoresAbertas.value = arvoresAbertas.value.filter(a => a.id !== id)
  zOrdem.value = zOrdem.value.filter(z => z !== 'a-' + id)
}

provide('abrirFicha', abrirFicha)
const mutacaoContador = ref(0)
provide('mutacaoContador', mutacaoContador)
</script>
