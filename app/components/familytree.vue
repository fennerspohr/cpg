<template>
  <div :id="chartId" class="f3" style="width:100%;height:100%;margin:auto;"></div>
</template>

<script>
import * as d3 from 'd3';
import * as f3 from 'family-chart';
import 'family-chart/styles/family-chart.css';
     
export default {
  name: "FamilyChart",
  props: { data: Array, main: String },

  data() {
    // ID único por instância — evita colisão quando múltiplas árvores abertas
    return {
      chartId: `FamilyChart-${Math.random().toString(36).slice(2, 9)}`
    }
  },

  mounted() {
    const { data, main, chartId } = this
    create(data, main, chartId)
    
    function create(data, main, chartId) {
      const f3Chart = f3.createChart('#' + chartId, data)
        .setTransitionTime(1000)
        .setCardXSpacing(320)
        .setCardYSpacing(160)
        .setSingleParentEmptyCard(true, { label: 'Desconhecido' })
        .setShowSiblingsOfMain(true)
        .setOrientationVertical()
    
      f3Chart.setCardHtml()
        .setCardDisplay([["first name", "last name"], ["birth year"], ["death year"]])
        .setCardDim({ "width": 260 })
        .setMiniTree(true)
        .setStyle('rect')
        .setOnHoverPathToMain()
        .setOnCardClick(() => {})

      f3Chart.updateMainId(main)
      f3Chart.updateTree({ initial: true })
    }
  }
};
</script>