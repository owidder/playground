<template>
  <div id="sidebar-menu" class="sidebar-page">
    <section class="sidebar-layout">
      <b-sidebar
        position="static"
        mobile="fullwidth"
        :expand-on-hover="false"
        :reduce="false"
        type="is-light"
        open
      >
        <div class="p-1">
          <b-menu>
            <b-menu-list>
              <b-menu-item
                id="add-bookmark"
                icon="book-plus"
                label="Add bookmark"
                @click="buttonClicked(addBookmarkCallback, 'add-bookmark')"
              ></b-menu-item>
              <b-menu-item
                icon="cloud-download"
                label="Download"
                @click="downloadCallback"
              ></b-menu-item>
              <b-menu-item
                id="show-charts"
                icon="chart-bell-curve"
                label="Show charts"
                @click="buttonClicked(showChartsCallback, 'show-charts')"
              ></b-menu-item>
              <b-menu-item
                id="start-stop-training"
                :icon="trainingButtonIcon"
                :label="trainingButtonText"
                @click="startStopButtonClicked"
              ></b-menu-item>
            </b-menu-list>
          </b-menu>
        </div>
      </b-sidebar>
    </section>
  </div>
</template>

<script>
import * as d3 from "d3";

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
};
</script>

<style scoped lang="scss">
.p-1 {
  padding: 1em;
}
.sidebar-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  .sidebar-layout {
    display: flex;
    flex-direction: row;
    min-height: 100%;
    width: 100%;
  }
}
</style>