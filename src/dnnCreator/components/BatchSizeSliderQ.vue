<template>
  <div class="q-pa-md">
    <q-badge> Batch size: {{ basicModel }}</q-badge>
    <q-slider v-model="basicModel" markers :min="1" :max="30" @change="batchSizeChanged" />
  </div>
</template>

<script>
export default {
    data() {
        return {
            basicModel: 0
        }
    },
    methods: {
        batchSizeChanged: function(value) {
            console.log(value);
            this.$emit('batch-size-changed', value)
        }
    }
}
</script>