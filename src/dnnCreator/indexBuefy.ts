import Vue from 'vue';
import Buefy from 'buefy';
import NetworkTable from "./components/NetworkTable.vue"
import AddButton from "./components/AddButton.vue";
import DownloadButton from "./components/DownloadButton.vue";
import ChartButton from "./components/ChartButton.vue";
import StartTrainingButton from "./components/StartTrainingButton.vue";
import TrainOneStepButton from "./components/TrainOneStepButton.vue";
import ShuffleDataButton from "./components/ShuffleDataButton.vue";
import BatchSizeSlider from "./components/BatchSizeSlider.vue";
import PercentTrainDataSlider from "./components/PercentTrainDataSlider.vue"

import { Dataset, loadDataSource } from "./datasetTf";
import { State } from "./stateTf";
import { DataSource } from "./networkTypes";
import { addBookmark, initBookmarks, getBookmarks, Bookmark } from "./bookmarks";
import { showDataSource, makeGUI, setSelectComponentByValue } from "./ui";

import "buefy/dist/buefy.css"
import "bulma/css/bulma.css"
import "@mdi/font/css/materialdesignicons.css"

import "../css/stylesBuefy.scss"

Vue.use(Buefy);

export const drawComponent = (selector: string, content: any, props = {}) => {
    if (document.querySelector(selector)) {
        new Vue({
            el: selector,
            render: h => h(content, { props })
        })
    }
}

const state = State.deserializeState();

const refresh = async (dataSource: DataSource) => {
    const dataset = new Dataset(dataSource, "label", state.percTrainData, state.shuffleseed);
    //showTrainAndTestNumbers(state.percTrainData, dataset.getTrainData().length, dataset.getTestData().length);
    await state.initModel(dataset);

    setSelectComponentByValue("datasources", state.datasetUrl);
    //initBatchSizeComponent(state.batchSize);
    //initTrainAndTestNumbersComponent(state.percTrainData);
    //showDatasetUrl(state.datasetUrl);
    //refreshHistory();
    drawComponent("#network-table-container", NetworkTable);
    drawComponent("#add-button-container", AddButton)
    drawComponent("#download-button-container", DownloadButton);
    drawComponent("#chart-button-container", ChartButton);
    drawComponent("#start-training-button-container", StartTrainingButton);
    drawComponent("#train-one-step-button-container", TrainOneStepButton);
    drawComponent("#shuffle-data-button-container", ShuffleDataButton);
    drawComponent("#batch-size-slider-container", BatchSizeSlider);
    drawComponent("#percent-train-data-slider-container", PercentTrainDataSlider, {
        trainDataCount: dataset.getTrainData().length,
        testDataCount: dataset.getTestData().length,
        changeCallback: state.changePercTrainData
    })

    makeGUI({ changeDatasetUrl: state.changeDatasetUrl })
}

const start = async () => {

    const dataSource = await loadDataSource(state.datasetUrl);
    showDataSource(dataSource);
    state.setRefreshCallback(() => refresh(dataSource));
    initBookmarks(state.datasetUrl);

    await refresh(dataSource);
    // initVisor();

    // showAllSavedHistories();
}

start()