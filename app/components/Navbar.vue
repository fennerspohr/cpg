<template>
  <header class="bg-[#d4d0c8] w-full select-none flex flex-col shadow-sm border-b border-[#808080]">
    <div class="bg-[#0a246a] px-3 py-1 flex items-center shadow-[inset_0_1px_0_#4a6bbd]">
      <span class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
        <Icon name="lucide:monitor" class="text-sm" />
        Sistema CPG - Nova Palma v1.0
      </span>
    </div>

    <div class="flex items-center justify-between p-2 border-t-2 border-t-white">
      <div class="flex items-center gap-1">

        <!-- Grupo 1: navegação principal -->
        <NavButton label="Lista de Pessoas"  icon="lucide:layout-list" icon-class="text-blue-800"   to="/" />
        <NavButton label="Adicionar Pessoa"  icon="lucide:user-plus"   icon-class="text-green-800"  to="/adicionar" />
        <NavButton label="Cidades"           icon="lucide:map-pin"     icon-class="text-yellow-700" @click="$emit('open-cities')" />

        <div class="h-12 mx-1 border-l border-base-300 border-r-white self-center" />

        <!-- Grupo 2: buscas -->
        <NavButton label="Buscar Relação"  icon="lucide:git-branch"  icon-class="text-purple-700" to="/buscar" />
        <NavButton label="Buscar Árvore"   icon="lucide:folder-tree" icon-class="text-blue-600"   to="/arvore" />

        <div class="h-12 mx-1 border-l border-base-300 border-r-white self-center" />

        <!-- Grupo 3: utilitários -->
        <NavButton label="Estatísticas"  icon="lucide:bar-chart-2" icon-class="text-teal-700"   to="/estatisticas" />
        <NavButton label="Backup"        icon="lucide:download"    icon-class="text-orange-700" @click="baixarBackup" />
        <NavButton label="Ajuda"         icon="lucide:circle-help" icon-class="text-gray-600"   @click="ajudaAberta = true" />

      </div>

      <div class="flex items-center gap-3 pr-4">
        <label class="text-[10px] font-bold uppercase text-[#404040]">Busca Rápida:</label>
        <div class="relative flex items-center">
          <input
            v-model="quickSearch"
            type="text"
            placeholder="Nome ou ID..."
            @keyup.enter="handleQuickSearch"
            class="h-7 w-56 pl-7 pr-2 text-xs bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white outline-none focus:bg-[#ffffcc] placeholder:italic"
          />
          <Icon name="lucide:search" class="absolute left-2 text-gray-400 text-sm pointer-events-none" />
        </div>
      </div>
    </div>
  </header>

  <!-- Modal de Ajuda -->
  <Teleport to="body">
    <div v-if="ajudaAberta" class="fixed inset-0 z-200 flex items-center justify-center bg-black/30"
      @click.self="ajudaAberta = false">
      <div class="bg-base-100 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-[2px_2px_0_#000]"
        style="width: 460px">

        <div class="flex items-center justify-between bg-[#000080] px-2 py-1 mx-0.5 mt-0.5">
          <span class="text-white text-xs font-bold flex items-center gap-1.5">
            <Icon name="lucide:circle-help" class="text-sm" />
            Ajuda — Sistema CPG
          </span>
          <button @click="ajudaAberta = false"
            class="bg-base-100 border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 w-5 h-5 flex items-center justify-center text-xs font-bold hover:brightness-110">
            ×
          </button>
        </div>

        <div class="p-4 flex flex-col gap-3 text-xs">

          <div v-for="grupo in ajuda" :key="grupo.titulo"
            class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 px-3 pt-0.5 pb-2">
            <p class="text-[9px] font-bold uppercase text-[#404040] mb-1.5 border-b border-base-300 pb-0.5">{{ grupo.titulo }}</p>
            <div class="flex flex-col gap-1">
              <div v-for="item in grupo.itens" :key="item.acao" class="flex gap-2">
                <span class="font-bold text-black w-36 shrink-0">{{ item.acao }}</span>
                <span class="text-[#404040]">{{ item.desc }}</span>
              </div>
            </div>
          </div>

        </div>

        <div class="flex justify-end px-4 pb-3">
          <button @click="ajudaAberta = false"
            class="border-2 border-t-white border-l-white border-r-base-300 border-b-base-300 bg-base-100 text-[10px] font-bold uppercase py-1 px-6 hover:brightness-110 active:border-t-base-300 active:border-l-base-300 active:border-r-white active:border-b-white">
            Fechar
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const router      = useRouter()
const quickSearch = ref('')
const ajudaAberta = ref(false)

defineEmits(['open-cities'])

function handleQuickSearch() {
  const termo = quickSearch.value.trim()
  if (!termo) { router.push('/'); return }
  router.push({ path: '/', query: { q: termo } })
  quickSearch.value = ''
}

function baixarBackup() {
  window.open('/api/download-backup', '_blank')
}

const ajuda = [
  {
    titulo: 'Navegação',
    itens: [
      { acao: 'Lista de Pessoas',  desc: 'Tabela com todos os cadastros. Clique numa pessoa para abrir a ficha.' },
      { acao: 'Adicionar Pessoa',  desc: 'Formulário para novo cadastro com vínculos familiares.' },
      { acao: 'Cidades',           desc: 'Gerenciar localidades usadas nos eventos (nascimento, batismo, óbito).' },
    ],
  },
  {
    titulo: 'Buscas',
    itens: [
      { acao: 'Buscar Relação',  desc: 'Encontra o caminho de parentesco entre duas pessoas.' },
      { acao: 'Buscar Árvore',   desc: 'Visualiza a árvore genealógica a partir de uma pessoa.' },
      { acao: 'Busca Rápida',    desc: 'Campo à direita: pesquisa por nome ou ID e filtra a lista.' },
    ],
  },
  {
    titulo: 'Ficha de Pessoa',
    itens: [
      { acao: 'Editar',   desc: 'Abre o formulário pré-preenchido para alterar dados e vínculos.' },
      { acao: 'Excluir',  desc: 'Remove a pessoa e todos os seus vínculos do banco de dados.' },
      { acao: 'Parentes', desc: 'Aba com listagem plana de todos os parentes diretos.' },
      { acao: 'Árvore',   desc: 'Aba para abrir a árvore genealógica em janela separada.' },
    ],
  },
  {
    titulo: 'Utilitários',
    itens: [
      { acao: 'Estatísticas',  desc: 'Painel com totais, distribuição por sexo e sobrenomes mais frequentes.' },
      { acao: 'Backup',        desc: 'Baixa um arquivo de backup completo do banco de dados.' },
    ],
  },
]
</script>

<style scoped>
button:active {
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: #ffffff;
  border-bottom-color: #ffffff;
}
</style>
