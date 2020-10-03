<template>
  <div class="sliders">
    <b-field :label="getPercentTrainDataLabel()">
      <b-slider
        size="is-small"
        :value="20"
        type="is-light"
        v-model="percentTrainData"
        :min="10"
        :max="90"
        :custom-formatter="(val) => val + '%'"
      >
        <template v-for="val in [20, 40, 60, 80]">
          <b-slider-tick :value="val" :key="val">{{ val }}</b-slider-tick>
        </template>
      </b-slider>
    </b-field>
    <h5>Train data count: {{ getNumberOfTrainData() }}</h5>
    <h5>Test data count: {{ getNumberOfTestData() }}</h5>
  </div>
</template>
<script>
export default {
  data() {
    return {
      percentTrainData: 70,
    };
  },
  props: ["totalDataCount"],
  methods: {
    getPercentTrainDataLabel() {
      return `Train data: ${this.percentTrainData} %`;
    },
    getNumberOfTrainData() {
      return (this.totalDataCount * this.percentTrainData) / 100;
    },
    getNumberOfTestData() {
      return this.totalDataCount - this.getNumberOfTrainData();
    },
  },
};
</script>