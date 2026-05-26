<template>
  <!-- se for filho fica em grid -->
  <div v-if="compacto"
    class="flex items-center gap-2 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1.5">
    <div class="w-5 h-5 flex-none flex items-center justify-center text-white text-[9px] font-bold border border-[#808080]"
      :style="{ backgroundColor: vinculo.pessoa?.sexo === 'M' ? 'var(--color-male, #5588aa)' : 'var(--color-female, #aa5588)' }">
      {{ vinculo.pessoa?.sexo ?? '?' }}
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs font-bold uppercase truncate leading-tight">
        {{ vinculo.pessoa?.nome }} {{ vinculo.pessoa?.sobrenome }}
      </p>
      <p class="text-[9px] text-gray-500 font-mono">
        {{ anoNasc }} {{ vinculo.pessoa?.datamorte ? '† ' + anoMorte : '' }}
      </p>
    </div>
  </div>

  <!-- cartão normal -->
  <div v-else class="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-3 py-2 flex flex-col gap-1.5">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 flex-none flex items-center justify-center text-white text-xs font-bold border border-[#808080]"
        :style="{ backgroundColor: vinculo.pessoa?.sexo === 'M' ? 'var(--color-male, #5588aa)' : 'var(--color-female, #aa5588)' }">
        {{ vinculo.pessoa?.sexo ?? '?' }}
      </div>
      <div class="flex-1">
        <p class="text-sm font-bold uppercase leading-tight">
          {{ vinculo.pessoa?.nome }} {{ vinculo.pessoa?.sobrenome }}
        </p>
        <p class="text-[9px] text-gray-500 font-mono">
          {{ anoNasc ? '✦ ' + anoNasc : '' }}
          {{ vinculo.pessoa?.datamorte ? ' — † ' + anoMorte : '' }}
        </p>
      </div>
    </div>

    <!-- info de casamento (só para cônjuges) -->
    <div v-if="mostrarCasamento && vinculo.metadata" class="border-t border-dashed border-[#c0c0c0] pt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
      <div>
        <p class="text-[8px] font-bold uppercase text-[#808080]">Casamento</p>
        <p class="text-[10px]">{{ formatarData(vinculo.metadata.data_casamento) ?? '—' }}</p>
      </div>
      <div>
        <p class="text-[8px] font-bold uppercase text-[#808080]">Local</p>
        <p class="text-[10px]">{{ vinculo.metadata.local_casamento ?? '—' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  vinculo: any
  compacto?: boolean
  mostrarCasamento?: boolean
}>()

const anoNasc = computed(() => props.vinculo.pessoa?.datanasc?.substring(0, 4) ?? null)
const anoMorte = computed(() => props.vinculo.pessoa?.datamorte?.substring(0, 4) ?? null)

function formatarData(data: string | null): string | null {
  if (!data) return null
  const d = new Date(data)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  const dia = String(d.getDate()).padStart(2, '0')
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${dia} ${meses[d.getMonth()]} ${d.getFullYear()}`
}
</script>