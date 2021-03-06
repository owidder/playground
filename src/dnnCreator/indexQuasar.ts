import Vue from 'vue';
import Quasar from 'quasar';

import { Dataset, loadDataSource } from "./datasetTf";
import { State } from "./stateTf";
import { DataSource } from "./networkTypes";
import { addBookmark, initBookmarks, getBookmarks, Bookmark } from "./bookmarks";
import { showDataSource, makeGUI, setSelectComponentByValue, drawNetwork, updateUI } from "./ui";
import { toggleVisor } from "./vis";

import SidebarMenuQuasar from "./components/SidebarMenuQuasar.vue";
import Bar from "./components/Bar.vue";
import DnnMenu from "./components/DnnMenu.vue";
import BatchSizeSlider from "./components/BatchSizeSliderQ.vue";
import PercentTrainDataSlider from "./components/PercentTrainDataSliderQ.vue";
import App from "./components/App.vue";

//require("./themes/app.ios.styl");
require("quasar/dist/quasar.css");
import "../css/stylesQuasar.scss";
import "material-design-lite/material.css";

Vue.use(Quasar);

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

    Vue.component("dnn-menu", DnnMenu);
    Vue.component("batch-size-slider", BatchSizeSlider);
    Vue.component("percent-train-data-slider", PercentTrainDataSlider);

    await state.initModel(dataset);

    drawComponent("#layout", App, {
        addBookmarkCallback: () => console.log("addBookmarkCallback"),
        downloadCallback: () => console.log("downloadCallback"),
        showChartsCallback: () => console.log("showChartsCallback"),
        startStopTrainingCallback: (onOff: boolean) => console.log(`startStopTrainingCallback: ${onOff}`),
        trainOneStepCallback: () => console.log("trainOneStepCallback"),
        shuffleDataClickedCallback: () => console.log("shuffleDataClickedCallback"),
        batchSizeChangedCallback: state.setBatchSize,
        percentTrainDataChangedCallback: state.changePercTrainData,
        initialBatchSizeValue: state.batchSize,
        initialPercentTrainDataValue: state.percTrainData,
        totalDataCount: dataSource.data.length
    })

    makeGUI({ changeDatasetUrl: state.changeDatasetUrl })

    drawNetwork(state.getModel().getNetwork(),
        state.changeNumberOfNodes,
        (index) => state.addLayerAfterLayerWithIndex(index),
        (index) => state.removeLayerWithIndex(index),
        (activation, index) => state.changeActivationAtIndex(activation, index - 1),
        (index1, index2) => state.swapLayers(index1, index2),
        state.activations);

    updateUI(true, state.getModel().getNetwork(), state.getModel().getTotalEpochs(), state.getModel().forEachNode);
}

const start = async () => {

    const dataSource = await loadDataSource(state.datasetUrl);
    setTimeout(() => {
        showDataSource(dataSource);

    }, 1000);
    state.setRefreshCallback(() => refresh(dataSource));
    initBookmarks(state.datasetUrl);

    await refresh(dataSource);
    // initVisor();

    // showAllSavedHistories();
}

start()