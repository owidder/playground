<template>
    <div class="sliders">
        <b-field :label="getBatchSizeLabel()">
            <b-slider size="is-small" :value="20" type="is-light" v-model="batchSize" :min="1" :max="30">
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
            batchSize: 30
        }
    },
    methods: {
        getBatchSizeLabel() {
            return `Batch size: ${this.batchSize}`
        }
    }
}
</script>