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
        <template v-for="item in menuItems" :key="item.label">
          <div v-if="item.divider" class="h-10 mx-1 border-l border-[#808080] border-r-white" />

          <NavButton
            v-else-if="item.label === 'Cidade' || item.label === 'Buscar'"
            :label="item.label"
            :icon="item.icon"
            :icon-class="item.iconClass"
            @click="item.label === 'Cidade' ? $emit('open-cities') : $emit('open-search')"
            class="cursor-pointer"
          />

          <NavButton
            v-else
            :label="item.label || ''"
            :icon="item.icon || ''"
            :to="item.to"
            :icon-class="item.iconClass"
          />
        </template>
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
          <Icon
            name="lucide:search"
            class="absolute left-2 text-gray-400 text-sm pointer-events-none"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { MenuItem } from "~/types/menuItems";

const router = useRouter();
const quickSearch = ref('');

// eventos que o layouts/default.vue vai capturar
defineEmits(['open-cities', 'open-search']);

//executa a busca ao pressionar Enter no input lateral

function handleQuickSearch() {
  const termo = quickSearch.value.trim();
  
  // se o campo estiver vazio e der enter, ele reseta a lista
  if (!termo) {
    router.push('/');
    return;
  }

  // redireciona para a index com o parâmetro 'q'
  // a index.vue vai detectar a mudança via route.query.q
  router.push({ path: '/', query: { q: termo } });
  
  // limpa o input após a busca (opcional, dependendo da sua preferência)
  quickSearch.value = '';
}

const menuItems: MenuItem[] = [
  {
    label: "Lista",
    icon: "lucide:layout-list",
    iconClass: "text-blue-800",
    to: "/",
  },
  { 
    label: "Buscar", 
    icon: "lucide:search", 
    iconClass: "text-[#404040]" 
  },
  {
    label: "Adicionar",
    icon: "lucide:user-plus",
    iconClass: "text-green-800",
    to: "/adicionar",
  },
  { 
    label: "Cidade", 
    icon: "lucide:map-pin", 
    iconClass: "text-yellow-700" 
  },

  { divider: true },
  
    { 
    label: "Detalhes", 
    icon: "lucide:clipboard-list", 
    iconClass: "text-orange-900",
    to: "/logs" 
  },
  { 
    label: "Arvore", 
    icon: "lucide:folder-tree", 
    iconClass: "text-blue-600",
    to: "/arvore"
  },
];
</script>

<style scoped>
button:active {
  border-top-color: #808080;
  border-left-color: #808080;
  border-right-color: #ffffff;
  border-bottom-color: #ffffff;
}
</style>