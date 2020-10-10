<template>
  <div id="percent-train-data-slider" class="sliders">
    <b-field :label="getPercentTrainDataLabel()">
      <b-slider
        id="percent-train-data-slider"
        size="is-small"
        :value="20"
        type="is-light"
        v-model="percentTrainData"
        :min="10"
        :max="90"
        :custom-formatter="(val) => val + '%'"
        @change="changeCallback"
      >
        <template v-for="val in [20, 40, 60, 80]">
          <b-slider-tick :value="val" :key="val">{{ val }}</b-slider-tick>
        </template>
      </b-slider>
    </b-field>
    <h5>Train data count: {{ trainDataCount }}</h5>
    <h5>Test data count: {{ testDataCount }}</h5>
  </div>
</template>
<script>
export default {
  data() {
    return {
      percentTrainData: this.initialPercentTrainData,
    };
  },
  props: [
    "trainDataCount",
    "testDataCount",
    "changeCallback",
    "initialPercentTrainData",
  ],
  methods: {
    getPercentTrainDataLabel() {
      return `Train data: ${this.percentTrainData} %`;
    },
  },
};
</script>