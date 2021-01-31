<template>
  <div id="q-app">
    <div class="q-pa-md">
      <q-layout
        view="hHh lpr lff"
        container
        style="height: 95vh"
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

          <batch-size-slider
            @batch-size-changed="batchSizeChangedCallback"
            :initial-value="initialBatchSizeValue"
          ></batch-size-slider>
          <percent-train-data-slider
            @percent-train-data-changed="percentTrainDataChangedCallback"
            :initial-value="initialPercentTrainDataValue"
            :total-data-count="totalDataCount"
          ></percent-train-data-slider>
        </q-drawer>

        <q-page-container>
          <q-page style="padding-top: 60px" :style-fn="myTweak" class="q-pa-md">
            <div id="network" class="column">
              <div class="move-and-remove"></div>
              <svg id="svg" width="510" height="450">
                <defs>
                  <marker
                    id="markerArrow"
                    markerWidth="7"
                    markerHeight="13"
                    refX="1"
                    refY="6"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                  >
                    <path d="M2,11 L7,6 L2,2" />
                  </marker>
                </defs>
              </svg>
              <!-- Hover card -->
              <div id="hovercard">
                <div>
                  <span class="type">Weight/Bias</span> is
                  <span class="value">0.2</span>.
                </div>
              </div>
            </div>
          </q-page>
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
    "initialPercentTrainDataValue",
    "totalDataCount",
  ],
  methods: {
    startStopTrainingButtonClicked: function (onOff) {
      this.$props.startStopTrainingCallback(onOff);
    },
    batchSizeChanged: function (value) {
      this.$props.batchSizeChangedCallback(value);
    },
    percentTrainDataChanged: function (value) {
      this.$props.percentTrainDataChanged(value);
    },
    myTweak(offset) {
      // "offset" is a Number (pixels) that refers to the total
      // height of header + footer that occupies on screen,
      // based on the QLayout "view" prop configuration

      // this is actually what the default style-fn does in Quasar
      return {};
    },
  },
};
</script>