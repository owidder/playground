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
import DefaultButton from "./components/DefaultButton.vue"
import SidebarMenu from "./components/SidebarMenu.vue"

import { Dataset, loadDataSource } from "./datasetTf";
import { State } from "./stateTf";
import { DataSource } from "./networkTypes";
import { addBookmark, initBookmarks, getBookmarks, Bookmark } from "./bookmarks";
import { showDataSource, makeGUI, setSelectComponentByValue } from "./ui";
import { toggleVisor } from "./vis";

import "buefy/dist/buefy.css"
import "bulma/css/bulma.css"
import "@mdi/font/css/materialdesignicons.css"

import "../css/stylesBuefy.scss"

Vue.use(Buefy);

export const drawComponent = (selector: string, content: any, props = {}): any | undefined => {
    if (document.querySelector(selector)) {
        return new Vue({
            el: selector,
            render: h => h(content, { props })
        })
    }
}

const state = State.deserializeState();

const addBookmarkCallback = () => {
    console.log("addBookmark")
}

const refresh = async (dataSource: DataSource) => {
    const dataset = new Dataset(dataSource, "label", state.percTrainData, state.shuffleseed);
    //showTrainAndTestNumbers(state.percTrainData, dataset.getTrainData().length, dataset.getTestData().length);
    await state.initModel(dataset);

    setSelectComponentByValue("datasources", state.datasetUrl);
    //initBatchSizeComponent(state.batchSize);
    //initTrainAndTestNumbersComponent(state.percTrainData);
    //showDatasetUrl(state.datasetUrl);
    //refreshHistory();

    Vue.component("default-button", DefaultButton);

    drawComponent("#sidebar-menu", SidebarMenu, { 
        addBookmarkCallback, 
        downloadCallback: state.getModel().download, 
        showChartsCallback: toggleVisor,
        startStopTrainingCallback: () => console.log("start/stop training"),
        trainOneStepCallback: () => console.log("train one step"),
        shuffleDataCallback: () => console.log("shuffle data"),
    });

    drawComponent("#network-table", NetworkTable);
    //drawComponent("#add-button", AddButton)
    //drawComponent("#download-button", DownloadButton);
    //drawComponent("#chart-button", ChartButton);
    //drawComponent("#start-training-button", StartTrainingButton);
    //drawComponent("#train-one-step-button", TrainOneStepButton);
    //drawComponent("#shuffle-data-button", ShuffleDataButton);
    drawComponent("#batch-size-slider", BatchSizeSlider, { changeCallback: state.setBatchSize, initialBatchSize: state.batchSize });
    const percentTrainDataSlider = drawComponent("#percent-train-data-slider", PercentTrainDataSlider, {
        trainDataCount: dataset.getTrainData().length,
        testDataCount: dataset.getTestData().length,
        changeCallback: state.changePercTrainData,
        initialPercentTrainData: state.percTrainData
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