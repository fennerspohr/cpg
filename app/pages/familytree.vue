
<template>
  <div id="FamilyChart" class="f3" style="width:100%;height:900px;margin:auto;background-color:rgb(33,33,33);color:#fff;"></div>
</template>

<script>
import * as d3 from 'd3';  // npm install d3 or yarn add d3
import * as f3 from 'family-chart';  // npm install family-chart@0.9.0 or yarn add family-chart@0.9.0
import 'family-chart/styles/family-chart.css';
     
export default {
  name: "FamilyChart",
  props:{data: Array, main: String},
  mounted() {
    create(this.data, this.main)
    
    function create(data, main) {
      const f3Chart = f3.createChart('#FamilyChart', data)
        .setTransitionTime(1000)
        .setCardXSpacing(320)
        .setCardYSpacing(160)
        .setSingleParentEmptyCard(true, {label: 'Desconhecido'})
        .setShowSiblingsOfMain(true)
        .setOrientationVertical()
    
      const f3Card = f3Chart.setCardHtml()
        .setCardDisplay([["first name","last name"], ["birth year"],["death year"]])
        .setCardDim({"width":260})
        .setMiniTree(true)
        .setStyle('rect')
        .setOnHoverPathToMain()
        .setOnCardClick(() => {})
        // .setMiniTree()
      f3Chart.updateMainId(main)

      f3Chart.updateTree({initial: true})

      // f3Card.onCardClick(() => {})
      // f3Chart.updateTree()
    }
    
    // function data() {
    //   return [{"id": "21","rels": {"parents": [],"spouses":["24"],"children":[]},"data":{"gender": "M","first name": "Clovis","last name": "S","birth year": "null","birth place": "undefined","death year": "null","death place": "undefined"}},{"id": "22","rels": {"parents": ["24"],"spouses":[],"children":[]},"data":{"gender": "F","first name": "isadora","last name": "S","birth year": "null","birth place": "undefined","death year": "null","death place": "undefined"}},{"id": "23","rels": {"parents": [],"spouses":[],"children":["24"]},"data":{"gender": "F","first name": "Leoni","last name": "F","birth year": "null","birth place": "undefined","death year": "null","death place": "undefined"}},{"id": "24","rels": {"parents": ["23"],"spouses":["21"],"children":["22"]},"data":{"gender": "F","first name": "Lilei","last name": "S","birth year": "1972","birth place": "undefined","death year": "null","death place": "undefined"}}]
        
    // }
    
  }
};
</script>