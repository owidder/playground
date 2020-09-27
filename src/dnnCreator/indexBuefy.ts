import Vue from 'vue';
import Buefy from 'buefy';
import NetworkTable from "./components/NetworkTable.vue"

import { Dataset, loadDataSource } from "./datasetTf";
import { State } from "./stateTf";
import { DataSource } from "./networkTypes";
import { addBookmark, initBookmarks, getBookmarks, Bookmark } from "./bookmarks";
import {showDataSource} from "./ui";

import "buefy/dist/buefy.css"
import "bulma/css/bulma.css"

Vue.use(Buefy);

export const drawNetworkTable = () => {
    new Vue({
        el: "#network-table",
        render: h => h(NetworkTable)
    })
}

const state = State.deserializeState();

const refresh = async (dataSource: DataSource) => {
    const dataset = new Dataset(dataSource, "label", state.percTrainData, state.shuffleseed);
    //showTrainAndTestNumbers(state.percTrainData, dataset.getTrainData().length, dataset.getTestData().length);
    await state.initModel(dataset);

    //setSelectComponentByValue("datasources", state.datasetUrl);
    //initBatchSizeComponent(state.batchSize);
    //initTrainAndTestNumbersComponent(state.percTrainData);
    //showDatasetUrl(state.datasetUrl);
    //refreshHistory();
    drawNetworkTable()
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