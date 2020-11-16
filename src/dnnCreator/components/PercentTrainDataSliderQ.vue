<template>
  <div class="q-pa-md">
    <q-badge>
      Train data: {{ trainDataCount }} ({{ percentTrainData }} %)</q-badge
    >
    <q-badge>
      Test data: {{ testDataCount }} ({{ percentTestData }} %)</q-badge
    >
    <q-slider
      v-model="percentTrainData"
      markers
      :min="1"
      :max="99"
      @change="percentTrainDataChanged"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      percentTrainData: Number(this.$props.initialValue),
    };
  },
  computed: {
    trainDataCount: function () {
      return Math.round(this.$props.totalDataCount * (this.percentTrainData / 100));
    },
    testDataCount: function() {
        return this.$props.totalDataCount - this.trainDataCount
    },
    percentTestData: function() {
        return Math.round((this.testDataCount / this.$props.totalDataCount) * 100)
    }
  },
  props: ["initialValue", "totalDataCount"],
  methods: {
    percentTrainDataChanged: function (value) {
      this.$emit("percent-train-data-changed", value);
    },
  },
};
</script>