import Vue from 'vue';
import Buefy from 'buefy';
import NetworkTable from "./components/NetworkTable.vue"
import AddButton from "./components/AddButton.vue";
import DownloadButton from "./components/DownloadButton.vue";

import { Dataset, loadDataSource } from "./datasetTf";
import { State } from "./stateTf";
import { DataSource } from "./networkTypes";
import { addBookmark, initBookmarks, getBookmarks, Bookmark } from "./bookmarks";
import {showDataSource, makeGUI, setSelectComponentByValue} from "./ui";

import "buefy/dist/buefy.css"
import "bulma/css/bulma.css"
import "@mdi/font/css/materialdesignicons.css"

import "../css/stylesBuefy.scss"

Vue.use(Buefy);

export const drawNetworkTable = () => {
    new Vue({
        el: "#network-table",
        render: h => h(NetworkTable)
    })
}

export const drawAddButton = () => {
    new Vue({
        el: "#add-button",
        render: h => h(AddButton)
    })
}

export const drawComponent = (selector: string, content: any) => {
    new Vue({
        el: selector,
        render: h => h(content)
    })
}

const state = State.deserializeState();

const refresh = async (dataSource: DataSource) => {
    const dataset = new Dataset(dataSource, "label", state.percTrainData, state.shuffleseed);
    //showTrainAndTestNumbers(state.percTrainData, dataset.getTrainData().length, dataset.getTestData().length);
    await state.initModel(dataset);

    makeGUI({changeDatasetUrl: state.changeDatasetUrl})

    setSelectComponentByValue("datasources", state.datasetUrl);
    //initBatchSizeComponent(state.batchSize);
    //initTrainAndTestNumbersComponent(state.percTrainData);
    //showDatasetUrl(state.datasetUrl);
    //refreshHistory();
    drawNetworkTable();
    drawAddButton();
    drawComponent("#download-button", DownloadButton);
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