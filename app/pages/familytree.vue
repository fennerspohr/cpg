
<template>
  <div id="FamilyChart" class="f3" style="width:100%;height:900px;margin:auto;background-color:rgb(33,33,33);color:#fff;"></div>
</template>

<script>
import * as d3 from 'd3';  // npm install d3 or yarn add d3
import * as f3 from 'family-chart';  // npm install family-chart@0.9.0 or yarn add family-chart@0.9.0
import 'family-chart/styles/family-chart.css';
     
export default {
  name: "FamilyChart",
  mounted() {
    create(data())
    
    function create(data) {
      const f3Chart = f3.createChart('#FamilyChart', data)
        .setTransitionTime(1000)
        .setCardXSpacing(320)
        .setCardYSpacing(160)
        .setSingleParentEmptyCard(true, {label: 'Desconhecido'})
        .setShowSiblingsOfMain(true)
        .setOrientationVertical()
    
      const f3Card = f3Chart.setCardHtml()
        .setCardDisplay([["first name","last name"],["birth year","birth place"],["death year","death place"]])
        .setCardDim({"width":260})
        .setMiniTree(true)
        .setStyle('rect')
        .setOnHoverPathToMain()
    
      
    
      f3Chart.updateTree({initial: true})
    }
    
    function data() {
      return [
        {
          "id": "0",
          "rels": {
            "parents": [
              "1a4a3f4a-14ed-489e-a230-d25f886e1af6"
            ],
            "spouses": [
              "f2042096-dcfd-4ef3-939f-03ddf1126e98"
            ],
            "children": [
              "cd70ba39-3402-453c-adb3-8f7ed5486857",
              "22d114bb-9b02-4cb1-8da0-101928e0de20"
            ]
          },
          "data": {
            "first name": "Clóvis",
            "last name": "Spohr",
            "birthday": 1970,
            "avatar": "https://static8.depositphotos.com/1009634/988/v/950/depositphotos_9883921-stock-illustration-no-user-profile-picture.jpg",
            "gender": "M",
            "birth year": "1968"
          }
        },
        {
          "id": "1a4a3f4a-14ed-489e-a230-d25f886e1af6",
          "data": {
            "gender": "F",
            "first name": "Reni",
            "last name": "Spohr",
            "birth year": "1920",
            "birth place": "Roque Gonzales",
            "death year": "2027",
            "death place": "Roque Gonzales"
          },
          "rels": {
            "children": [
              "0"
            ]
          }
        },
        {
          "id": "f2042096-dcfd-4ef3-939f-03ddf1126e98",
          "data": {
            "gender": "F",
            "first name": "Lilei",
            "last name": "Fenner",
            "birth year": "1972"
          },
          "rels": {
            "children": [
              "cd70ba39-3402-453c-adb3-8f7ed5486857",
              "22d114bb-9b02-4cb1-8da0-101928e0de20"
            ],
            "spouses": [
              "0"
            ]
          }
        },
        {
          "id": "cd70ba39-3402-453c-adb3-8f7ed5486857",
          "data": {
            "gender": "M",
            "first name": "Gustavo",
            "last name": "Spohr",
            "birth year": "2011"
          },
          "rels": {
            "parents": [
              "0",
              "f2042096-dcfd-4ef3-939f-03ddf1126e98"
            ]
          }
        },
        {
          "id": "22d114bb-9b02-4cb1-8da0-101928e0de20",
          "data": {
            "gender": "F",
            "first name": "Isadora",
            "last name": "Spohr",
            "birth year": "2004",
            "birth place": "Tuparendi",
            "death year": "",
            "death place": ""
          },
          "rels": {
            "parents": [
              "0",
              "f2042096-dcfd-4ef3-939f-03ddf1126e98"
            ]
          }
        }
      ]
    }
    
  }
};
</script>
