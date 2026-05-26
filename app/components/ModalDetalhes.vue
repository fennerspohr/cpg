<template>
  <div class="fixed inset-0 z-50 pointer-events-none">

    <!-- Janelas de ficha -->
    <JanelaDetalhes
      v-for="(p, idx) in pilhaJanelas"
      :key="'ficha-' + p.id"
      :pessoa="p"
      :z-index="50 + idx"
      :offset="idx"
      @fechar="fecharJanela(idx)"
      @abrir-pessoa="abrirPessoa"
      @excluir="(id) => { emit('excluir', id); fecharJanela(idx) }"
      @editar="(id) => { emit('editar', id); fecharJanela(idx) }"
      @ver-arvore="abrirArvore"
    />

    <!-- Janela de árvore -->
    <JanelaArvore
      v-for="(a, idx) in pilhaArvores"
      :key="'arvore-' + a.id"
      :pessoa-id="a.id"
      :nome="a.nome"
      :z-index="80 + idx"
      :offset="idx"
      @fechar="fecharArvore(idx)"
    />

  </div>
</template>

<script setup lang="ts">
interface Pessoa {
  id: number
  nome: string
  sobrenome: string
  sexo: string | null
  datanasc: string | null
  datamorte: string | null
  databatismo: string | null
  localnasc: number | null
  localbatismo: number | null
  localmorte: number | null
  obs: string | null
}

interface ArvoreItem { id: number; nome: string }

const props = defineProps<{ pessoa: Pessoa }>()
const emit = defineEmits<{
  fechar: []
  excluir: [id: number]
  editar: [id: number]
}>()

const pilhaJanelas = ref<Pessoa[]>([props.pessoa])
const pilhaArvores = ref<ArvoreItem[]>([])

function abrirPessoa(p: Pessoa) {
  if (!pilhaJanelas.value.find(j => j.id === p.id)) {
    pilhaJanelas.value.push(p)
  }
}

function fecharJanela(idx: number) {
  pilhaJanelas.value.splice(idx, 1)
  if (pilhaJanelas.value.length === 0 && pilhaArvores.value.length === 0) {
    emit('fechar')
  }
}

function abrirArvore(id: number) {
  if (pilhaArvores.value.find(a => a.id === id)) return
  const pessoa = pilhaJanelas.value.find(p => p.id === id)
  pilhaArvores.value.push({
    id,
    nome: pessoa ? `${pessoa.nome} ${pessoa.sobrenome}` : `ID ${id}`
  })
}

function fecharArvore(idx: number) {
  pilhaArvores.value.splice(idx, 1)
  if (pilhaJanelas.value.length === 0 && pilhaArvores.value.length === 0) {
    emit('fechar')
  }
}
</script>