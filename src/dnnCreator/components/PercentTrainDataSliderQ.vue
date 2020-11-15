<template>
  <div class="q-pa-md">
    <q-badge> Train data: {{ percentTrainData }} %</q-badge>
    <q-slider v-model="percentTrainData" markers :min="1" :max="99" @change="percentTrainDataChanged" />
  </div>
</template>

<script>
export default {
    data() {
        return {
            percentTrainData: Number(this.$props.initialValue)
        }
    },
    props: ["initialValue"],
    methods: {
        percentTrainDataChanged: function(value) {
            this.$emit("percent-train-data-changed", value)
        }
    }
}
</script>