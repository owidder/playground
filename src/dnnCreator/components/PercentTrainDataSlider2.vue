template>
  <div class="q-pa-md">
    <q-badge> Batch size: {{ basicModel }}</q-badge>
    <q-slider v-model="trainDataPercent" markers :min="1" :max="30" label label-always />
  </div>
</template>

<script>
export default {
    data() {
        return {
            trainDataPercent: 60
        }
    },
    computed: {
        trainDataCount
    }
}
</script>