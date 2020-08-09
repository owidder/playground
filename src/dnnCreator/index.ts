/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import "material-design-lite/material.css";
import "../css/stylesNew.css";
import "../css/stylesTf.scss";
import { Dataset, loadDataSource } from "./datasetTf";
import { makeGUI, showDataSource, setSelectComponentByValue, showDatasetUrl, initBatchSizeComponent, showTrainAndTestNumbers, initTrainAndTestNumbersComponent } from "./ui";
import { State } from "./stateTf";
import { addBookmark, initBookmarks } from "./bookmarks";
import { humanReadable } from "./mlUtil";
import { DataSource } from "./networkTypes";

const state = State.deserializeState();

const addCurrentBookmark = () => {
    const trainLoss = state.getModel().getCurrentTrainLoss();
    const testLoss = state.getModel().getCurrentTestLoss();
    const name = `${humanReadable(trainLoss)} / ${humanReadable(testLoss)} (${state.getModel().getTotalEpochs()})`;
    const url = location.href;
    const networkShape = state.getModel().getNetworkShape();
    const activations = state.getModel().getActivations();
    const batchSize = state.batchSize;
    const percTrainData = state.percTrainData;

    addBookmark({ name, url, networkShape, activations, batchSize, percTrainData });
}

const refresh = (dataSource: DataSource) => {
    const dataset = new Dataset(dataSource, "label", state.percTrainData);
    showTrainAndTestNumbers(state.percTrainData, dataset.getTrainData().length, dataset.getTestData().length);
    state.initModel(dataset);

    const reset = () => {
        location.reload();
    }

    makeGUI(reset, state.getPlayer().togglePlayPause, state.doModelStep, state.changeDatasetUrl, addCurrentBookmark, state.setBatchSize, state.changePercTrainData);
    setSelectComponentByValue("datasources", state.datasetUrl);
    initBatchSizeComponent(state.batchSize);
    initTrainAndTestNumbersComponent(state.percTrainData);
    showDatasetUrl(state.datasetUrl);
}

const start = async () => {

    const datasetUrl = state.datasetUrl && state.datasetUrl.length > 0 ? state.datasetUrl : "./datasets/irisFlower.json";
    const dataSource = await loadDataSource(datasetUrl);
    showDataSource(dataSource);
    state.setRefreshCallback(() => refresh(dataSource));
    initBookmarks(state.datasetUrl);

    refresh(dataSource);
}

start();