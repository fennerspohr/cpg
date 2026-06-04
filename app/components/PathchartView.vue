<template>
  <div>
    <PathChart
      v-if="parsedData.length"
      :data="parsedData"
      :main="mainId"
      @card-click="handleCardClick"
    />
  </div>
</template>

<script>
import PathChart from './Pathchart.vue';

export default {
  name: 'PathChartView',
  components: { PathChart },

  props: {
    data: { type: Array, required: true },
    main: { type: String, required: true },
  },

  computed: {
    parsedData() {
      return this.data || [];
    },

    mainId() {
      return String(this.main);
    },
  },

  methods: {
    handleCardClick(person) {
      console.log('clicked:', person);
      // Add your navigation or modal logic here,
      // same as .setOnCardClick(() => {}) in the old component
    },
  },
};
</script>