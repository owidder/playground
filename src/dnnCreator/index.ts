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
import { makeGUI, showDataSource, setSelectComponentByValue, showDatasetUrl, initBatchSizeComponent, showTrainAndTestNumbers, initTrainAndTestNumbersComponent, setInitialEpochsCount, getTotalEpochsShownInUi, appendToLineChart, resetLineChart } from "./ui";
import { State } from "./stateTf";
import { addBookmark, initBookmarks, getBookmarks } from "./bookmarks";
import { humanReadable } from "./mlUtil";
import { DataSource } from "./networkTypes";
import { createModelId, removeModel } from "./model";
import { toggleVisor, initVisor, saveVisData, loadHistory, resetHistory, deleteVisData, renderSavedModels, loadConfusionMatrix } from "./vis";

const state = State.deserializeState();

const addCurrentBookmark = () => {
    const trainLoss = state.getModel().getCurrentTrainLoss();
    const testLoss = state.getModel().getCurrentTestLoss();
    const name = `${humanReadable(testLoss)} / ${humanReadable(trainLoss)} [${getTotalEpochsShownInUi()}]`;
    const url = location.href;
    const networkShape = [...state.getModel().getNetworkShape()];
    const activations = [...state.getModel().getActivations()];
    const batchSize = state.batchSize;
    const percTrainData = state.percTrainData;
    const modelId = createModelId(networkShape, activations, batchSize, state.datasetUrl);

    addBookmark({ name, url, networkShape, activations, batchSize, percTrainData, modelId });
    state.getModel().saveModel();
    saveVisData(state.getModel().getModelId());

    location.reload();
}

const removeBookmark = (modelId: string): void => {
    removeModel(modelId);
    deleteVisData(modelId);
}

const refreshHistory = () => {
    resetHistory();
    const modelId = state.getModel().getModelId();
    const history = loadHistory(modelId);

    const classNames = state.getDataset().getLabelValues();
    loadConfusionMatrix(modelId, classNames);

    const epochCount = history.test_loss.length;
    setInitialEpochsCount(epochCount);

    resetLineChart();
    for(let i = 0; i < epochCount; i++) {
        appendToLineChart(history.train_loss[i], history.test_loss[i]);
    }
}

const refresh = async (dataSource: DataSource) => {
    const dataset = new Dataset(dataSource, "label", state.percTrainData);
    showTrainAndTestNumbers(state.percTrainData, dataset.getTrainData().length, dataset.getTestData().length);
    await state.initModel(dataset);

    makeGUI(state.getModel().download,
        state.getPlayer().togglePlayPause,
        state.doModelStep,
        state.changeDatasetUrl,
        addCurrentBookmark,
        state.setBatchSize,
        state.changePercTrainData,
        removeBookmark,
        toggleVisor,
    );
    setSelectComponentByValue("datasources", state.datasetUrl);
    initBatchSizeComponent(state.batchSize);
    initTrainAndTestNumbersComponent(state.percTrainData);
    showDatasetUrl(state.datasetUrl);
    refreshHistory();
}

const showAllSavedHistories = () => {
    const bookmarks = getBookmarks();
    renderSavedModels(bookmarks);
}

const start = async () => {

    const dataSource = await loadDataSource(state.datasetUrl);
    showDataSource(dataSource);
    state.setRefreshCallback(() => refresh(dataSource));
    initBookmarks(state.datasetUrl);

    await refresh(dataSource);
    initVisor();

    showAllSavedHistories();
}

start();