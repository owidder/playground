<template>
  <q-list>
    <q-item @click="$emit('add-bookmark-clicked')" clickable>
      <q-item-section avatar>
        <q-icon color="primary" :name="bookmark"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label>Add bookmark</q-item-label>
      </q-item-section>
    </q-item>

    <q-item @click="$emit('download-clicked')" clickable>
      <q-item-section avatar>
        <q-icon color="primary" :name="download"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label>Download</q-item-label>
      </q-item-section>
    </q-item>

    <q-item @click="$emit('show-charts-clicked')" clickable>
      <q-item-section avatar>
        <q-icon color="primary" :name="chart"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label>Show charts</q-item-label>
      </q-item-section>
    </q-item>

    <q-item @click="startStopButtonClicked" clickable>
      <q-item-section avatar>
        <q-icon color="primary" :name="startStopIcon()"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{startStopText()}}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item @click="$emit('train-one-step-clicked')" clickable>
      <q-item-section avatar>
        <q-icon color="primary" :name="oneStep"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label>Train one step</q-item-label>
      </q-item-section>
    </q-item>

    <q-item @click="$emit('shuffle-data-clicked')" clickable>
      <q-item-section avatar>
        <q-icon color="primary" :name="shuffle"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label>Shuffle data</q-item-label>
      </q-item-section>
    </q-item>

  </q-list>

</template>

<script>
import {
  farBookmark,
  fasCloudDownloadAlt,
  fasChartLine,
  fasRunning,
  fasStopCircle,
  fasStepForward,
  fasRandom,
} from "@quasar/extras/fontawesome-v5";

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
  methods: {
    buttonClicked(callback, id) {
      callback();
      deselect(id);
    },
    startStopButtonClicked() {
      this.trainingIsOn = !this.trainingIsOn;
      this.$emit("start-stop-training-button-clicked", this.trainingIsOn);
    },
    startStopIcon() {
        return this.trainingIsOn ? this.stop : this.train
    },
    startStopText() {
        return this.trainingIsOn ? "Stop training" : "Start training"
    }
  },
  created() {
    this.bookmark = farBookmark;
    this.download = fasCloudDownloadAlt;
    this.chart = fasChartLine;
    this.train = fasRunning;
    this.stop = fasStopCircle;
    this.oneStep = fasStepForward;
    this.shuffle = fasRandom;
  },
};
</script>

<style scoped lang="scss">
.my-card {
  width: 100%;
  max-width: 300px;
}
</style>
