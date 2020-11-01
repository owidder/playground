<template>
  <q-card class="my-card">
    <q-list>
      <q-item @click="click" clickable>
        <q-item-section avatar>
          <q-icon color="primary" :name="bookmark"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label>Add bookmark</q-item-label>
        </q-item-section>
      </q-item>

      <q-item @click="click" clickable>
        <q-item-section avatar>
          <q-icon color="primary" :name="download"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label>Download</q-item-label>
        </q-item-section>
      </q-item>

      <q-item @click="click" clickable>
        <q-item-section avatar>
          <q-icon color="primary" :name="chart"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label>Show charts</q-item-label>
        </q-item-section>
      </q-item>

      <q-item @click="click" clickable>
        <q-item-section avatar>
          <q-icon color="primary" :name="train"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label>Start training</q-item-label>
        </q-item-section>
      </q-item>

    </q-list>
  </q-card>
</template>

<script>
import * as d3 from "d3";
import { farBookmark, fasCloudDownloadAlt, fasChartLine, fasRunning } from "@quasar/extras/fontawesome-v5";


const deselect = (id) => {
  setTimeout(() => {
    d3.select(`#${id}`)
      .classed("is-active", false)
      .classed("is-expanded", false);
  }, 100);
};

export default {
  data() {
    return {
      trainingIsOn: false,
    };
  },
  computed: {
    trainingButtonText: function () {
      return this.trainingIsOn ? "Stop training" : "Start training";
    },
    trainingButtonIcon: function () {
      return this.trainingIsOn ? "stop-circle" : "run";
    },
  },
  props: [
    "addBookmarkCallback",
    "downloadCallback",
    "showChartsCallback",
    "startStopTrainingCallback",
    "trainOneStepCallback",
    "shuffleDataCallback",
  ],
  methods: {
    buttonClicked(callback, id) {
      callback();
      deselect(id);
    },
    startStopButtonClicked() {
      this.trainingIsOn = !this.trainingIsOn;
      this.buttonClicked(this.startStopTrainingCallback, "start-stop-training");
    },
  },
  created() {
      this.bookmark = farBookmark;
      this.download = fasCloudDownloadAlt;
      this.chart = fasChartLine;
      this.train = fasRunning;
  }
};
</script>

<style scoped lang="scss">
.my-card {
  width: 100%;
  max-width: 300px;
}
</style>
