<template>
  <div class="path-chart">
    <div class="path-inner" :style="{ width: totalWidth + 'px', height: totalHeight + 'px' }">
      <svg
        :width="totalWidth"
        :height="totalHeight"
        style="position:absolute; top:0; left:0; pointer-events:none; z-index:0;"
      >
        <g v-for="(conn, i) in connections" :key="'conn-'+i">
          <path
            :d="conn.path"
            fill="none"
            stroke="#aaa"
            stroke-width="1.5"
          />
          <!-- Relationship label -->
          <text
            :x="conn.labelX"
            :y="conn.labelY - 4"
            text-anchor="middle"
            fill="#888"
            font-size="11"
            font-family="sans-serif"
            font-style="italic"
          >{{ conn.label }}</text>
        </g>
      </svg>

      <div
        v-for="(person, index) in visibleData"
        :key="person.id"
        class="f3-card"
        :class="[genderClass(person), { 'is-main': String(person.id) === String(main) }]"
        :style="cardStyle(index)"
        @click="$emit('card-click', person)"
      >
        <div class="card-name">
          {{ person.data['first name'] }} {{ person.data['last name'] }}
        </div>
        <div class="card-year" v-if="person.data['birth year'] && person.data['birth year'].trim()">
          {{ person.data['birth year'] }}<span v-if="person.data['death year'] && person.data['death year'].trim()"> – {{ person.data['death year'] }}</span>
        </div>
        <div class="card-year" v-else-if="person.data['death year'] && person.data['death year'].trim()">
          † {{ person.data['death year'] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const CARD_W = 220;
const CARD_H = 72;
const H_GAP  = 60;
const V_GAP  = 90;
const COLS   = 3;
const PAD    = 50;

export default {
  name: 'PathChart',
  props: {
    data:  { type: Array,  required: true },
    main:  { type: String, required: true },
  },
  emits: ['card-click'],

  computed: {
    visibleData() {
      return this.data.filter(p => !p.to_add);
    },

    cardPositions() {
      return this.visibleData.map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const actualCol = row % 2 === 0 ? col : (COLS - 1 - col);
        return {
          x: PAD + actualCol * (CARD_W + H_GAP),
          y: PAD + row * (CARD_H + V_GAP),
        };
      });
    },

    centers() {
      return this.cardPositions.map(p => ({
        x: p.x + CARD_W / 2,
        y: p.y + CARD_H / 2,
      }));
    },

    totalWidth() {
      const cols = Math.min(this.visibleData.length, COLS);
      return PAD * 2 + cols * CARD_W + (cols - 1) * H_GAP;
    },

    totalHeight() {
      const rows = Math.ceil(this.visibleData.length / COLS);
      return PAD * 2 + rows * CARD_H + (rows - 1) * V_GAP;
    },

    connections() {
      const conns = [];
      for (let i = 0; i < this.visibleData.length - 1; i++) {
        const from = this.centers[i];
        const to   = this.centers[i + 1];

        let x1, y1, x2, y2, d;

        if (Math.abs(from.y - to.y) < 5) {
          // Same row — horizontal
          if (to.x > from.x) {
            x1 = from.x + CARD_W / 2;
            x2 = to.x   - CARD_W / 2;
          } else {
            x1 = from.x - CARD_W / 2;
            x2 = to.x   + CARD_W / 2;
          }
          y1 = from.y;
          y2 = to.y;
          d = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else {
          // Different row — elbow
          x1 = from.x;
          y1 = from.y + CARD_H / 2;
          x2 = to.x;
          y2 = to.y   - CARD_H / 2;
          const midY = (y1 + y2) / 2;
          d = Math.abs(x1 - x2) < 5
            ? `M ${x1} ${y1} L ${x2} ${y2}`
            : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
        }

        conns.push({
          path: d,
          label: this.relLabel(i),
          labelX: (x1 + x2) / 2,
          labelY: (y1 + y2) / 2,
        });
      }
      return conns;
    },
  },

  methods: {
    cardStyle(index) {
      const pos = this.cardPositions[index];
      return {
        position: 'absolute',
        left:   pos.x + 'px',
        top:    pos.y + 'px',
        width:  CARD_W + 'px',
        height: CARD_H + 'px',
      };
    },

    genderClass(person) {
      const g = (person.data.gender || '').toUpperCase();
      if (g === 'M') return 'gender-m';
      if (g === 'F') return 'gender-f';
      return 'gender-u';
    },

    relLabel(i) {
      const from = this.visibleData[i];
      const to   = this.visibleData[i + 1];
      if (!from || !to) return '';
      const toId = String(to.id);
      if (from.rels?.children?.includes(toId)) return 'pai/mãe de';
      if (from.rels?.parents?.includes(toId))  return 'filho/a de';
      if (from.rels?.spouses?.includes(toId))  return 'cônjuge de';
      return '';
    },
  },
};
</script>

<style scoped>
.path-chart {
  width: 100%;
  min-height: 900px;
  background: rgb(208, 208, 203);
  overflow: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 0;
  box-sizing: border-box;
}

.path-inner {
  position: relative;
  flex-shrink: 0;
}

/* ── Card base ── */
.f3-card {
  position: absolute;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 10px 16px;
  transition: filter 0.15s ease;
  z-index: 1;
}

.f3-card:hover {
  filter: brightness(1.08);
}

/* Gender fills — matching the screenshot palette */
.f3-card.gender-m { background: #6e9fb0; }
.f3-card.gender-f { background: #b87080; }
.f3-card.gender-u { background: #888; }

/* Main person gets a subtle inset ring like family-chart card-main */
.f3-card.is-main {
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.6), 0 2px 10px rgba(0,0,0,0.15);
}

.card-name {
  font-family: sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  text-align: center;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.card-year {
  font-family: sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  margin-top: 4px;
  text-align: center;
}
</style>