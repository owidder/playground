<template>
  <div class="q-pa-md">
    <q-badge> Batch size: {{ batchSize }}</q-badge>
    <q-slider v-model="batchSize" markers :min="1" :max="30" @change="batchSizeChanged" />
  </div>
</template>

<script>
export default {
    data() {
        return {
            batchSize: Number(this.$props.initialValue)
        }
    },
    props: ["initialValue"],
    methods: {
        batchSizeChanged: function(value) {
            this.$emit('batch-size-changed', value)
        }
    }
}
</script>