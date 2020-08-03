/* Copyright 2016 Google Inc. All Rights Reserved.

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
import "./css/stylesNew.css";
import "./css/stylesTf.scss";
import { Dataset, loadDataSource } from "./datasetTf";
import { makeGUI, showDataSource, setSelectComponentByValue, showDatasetUrl, initBatchSizeComponent, showTrainAndTestNumbers, initTrainAndTestNumbersComponent } from "./ui/ui";
import { State } from "./stateTf";
import { addBookmark, initBookmarks } from "./tf/bookmarks";
import { humanReadable } from "./util/mlUtil";
import { DataSource } from "./tf/networkTypes";

const state = State.deserializeState();

const addCurrentBookmark = () => {
    const trainLoss = state.getModel().getCurrentTrainLoss();
    const testLoss = state.getModel().getCurrentTestLoss();
    const name = `${humanReadable(trainLoss)} / ${humanReadable(testLoss)} (${state.getModel().getTotalEpochs()})`;
    const url = location.href;
    const networkShape = state.getModel().getNetworkShape();
    const activation = state.getModel().getActivationName();
    const batchSize = state.batchSize;
    const percTrainData = state.percTrainData;

    addBookmark({ name, url, networkShape, activation, batchSize, percTrainData });
}

const newDataset = (dataSource: DataSource, ratioInPercent: number): void => {

}

const start = async () => {

    const datasetUrl = state.datasetUrl && state.datasetUrl.length > 0 ? state.datasetUrl : "./datasets/irisFlower.json";

    const dataSource = await loadDataSource(datasetUrl);
    showDataSource(dataSource);
    const dataset = new Dataset(dataSource, "label", state.percTrainData);
    showTrainAndTestNumbers(state.percTrainData, dataset.getTrainData().length, dataset.getTestData().length);
    state.initModel(dataset);

    const reset = () => {
        location.reload();
    }

    initBookmarks(state.datasetUrl);
    makeGUI(reset, state.getPlayer().togglePlayPause, state.doModelStep, state.addLayer, state.removeLayer, state.setActivationName, state.changeDatasetUrl, addCurrentBookmark, state.setBatchSize, state.changePercTrainData);
    setSelectComponentByValue("activations", state.activationName);
    setSelectComponentByValue("datasources", state.datasetUrl);
    initBatchSizeComponent(state.batchSize);
    initTrainAndTestNumbersComponent(state.percTrainData);
    showDatasetUrl(state.datasetUrl);
}

start();