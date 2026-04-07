<template>
  <header class="bg-base-100 w-full select-none flex flex-col shadow-sm">
    <!--titulo do app-->
    <div
      class="bg-primary px-3 py-1 flex items-center shadow-[inset_0_1px_0_#4a6bbd]"
    >
      <span class="text-xs font-bold text-white uppercase tracking-widest">
        Sistema CPG - Nova Palma v1.0
      </span>
    </div>

    <!--menu principal de botões-->
    <div
      class="flex items-center justify-between p-2 border-b-2 border-base-300"
    >
      <div class="flex items-center gap-1">
        <template v-for="item in menuItems" :key="item.label">
          <!--sempre colocar o divisor quando for mudar o "bloco de botões"-->
          <div
            v-if="item.divider"
            class="h-13 mx-1 border-l border-base-300 border-r-white"
          />

          <!--botões em si-->
          <NavButton
            v-else
            :label="item.label || ''"
            :icon="item.icon || ''"
            :to="item.to"
            :icon-class="item.iconClass"
          />
        </template>
      </div>

      <!--pesquisar-->
      <div class="flex items-center gap-3 pr-4">
      
          <label class="text-xs font-semibold text-base-content"
            >Pesquisar por:</label
          >

          <div class="relative flex items-center">
            <input
              type="text"
              placeholder="Nome, sobrenome, ID..."
              class="h-7 w-56 pl-7 pr-2 text-xs bg-white border-2 border-t-base-300 border-l-base-300 border-r-white border-b-white outline-none focus:bg-yellow-50"
            />

            <Icon
              name="lucide:search"
              class="absolute left-2 text-base-content/40 text-sm pointer-events-none"
            />
          </div>
        </div>
      </div>
 
  </header>
</template>

<script setup lang="ts">
import type { MenuItem } from "~/types/menuItems";

const menuItems: MenuItem[] = [
  {
    label: "Lista",
    icon: "lucide:layout-list",
    iconClass: "text-blue-800",
    to: "/",
  },
  { label: "Buscar", icon: "lucide:search", iconClass: "text-gray-700" },
  {
    label: "Adicionar",
    icon: "lucide:user-plus",
    iconClass: "text-green-800",
    to: "/adicionar",
  },
  { label: "Logs", icon: "lucide:history", iconClass: "text-orange-900" },
  { divider: true },
  { label: "Ajuda", icon: "lucide:help-circle", iconClass: "text-blue-600" },
];
</script>
