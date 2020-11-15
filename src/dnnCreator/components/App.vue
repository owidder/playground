<template>
  <div id="q-app">
    <div class="q-pa-md">
      <q-layout
        view="hHh lpr lff"
        container
        style="height: 2000px"
        class="shadow-2 rounded-borders"
      >
        <q-header reveal class="bg-black">
          <q-toolbar>
            <q-btn
              flat
              @click="drawerLeft = !drawerLeft"
              round
              dense
              icon="menu"
            ></q-btn>
            <q-toolbar-title>Header</q-toolbar-title>
          </q-toolbar>
        </q-header>

        <q-drawer
          v-model="drawerLeft"
          :width="200"
          :breakpoint="700"
          bordered
          content-class="bg-grey-3"
        >
          <dnn-menu
            @add-bookmark-clicked="addBookmarkCallback()"
            @download-clicked="downloadCallback()"
            @show-charts-clicked="showChartsCallback()"
            @start-stop-training-button-clicked="startStopTrainingButtonClicked"
            @train-one-step-clicked="trainOneStepCallback()"
            @shuffle-data-clicked="shuffleDataClickedCallback()"
          ></dnn-menu>

          <batch-size-slider @batch-size-changed="batchSizeChangedCallback" :initial-value="initialBatchSizeValue"></batch-size-slider>
          <percent-train-data-slider @percent-train-data-changed="percentTrainDataChangedCallback" :initial-value="initialPercentTrainDataValue"></percent-train-data-slider>

        </q-drawer>

        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md"></q-page>
        </q-page-container>
      </q-layout>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      drawerLeft: true,
    };
  },
  props: [
    "addBookmarkCallback",
    "downloadCallback",
    "showChartsCallback",
    "startStopTrainingCallback",
    "trainOneStepCallback",
    "shuffleDataClickedCallback",
    "batchSizeChangedCallback",
    "percentTrainDataChangedCallback",
    "initialBatchSizeValue",
    "initialPercentTrainDataValue"
  ],
  methods: {
    startStopTrainingButtonClicked: function (onOff) {
      this.$props.startStopTrainingCallback(onOff);
    },
    batchSizeChanged: function(value) {
        this.$props.batchSizeChangedCallback(value)
    },
    percentTrainDataChanged: function(value) {
         this.$props.percentTrainDataChanged(value)
    }
  },
};
</script>