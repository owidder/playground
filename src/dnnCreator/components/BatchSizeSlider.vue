<template>
  <div id="batch-size-slider" class="sliders">
    <b-field :label="getBatchSizeLabel()">
      <b-slider
        id="batch-size-slider"
        size="is-small"
        :value="20"
        type="is-light"
        v-model="batchSize"
        :min="1"
        :max="30"
        @change="changeCallback"
      >
        <template v-for="val in [1, 10, 20, 30]">
          <b-slider-tick :value="val" :key="val">{{ val }}</b-slider-tick>
        </template>
      </b-slider>
    </b-field>
  </div>
</template>
<script>
export default {
  data() {
    return {
      batchSize: this.initialBatchSize,
    };
  },
  props: ["changeCallback", "initialBatchSize"],
  methods: {
    getBatchSizeLabel() {
      return `Batch size: ${this.batchSize}`;
    },
  },
};
</script>