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
import { makeGUI, resetLineChart, showDataSource, setSelectComponentByValue, showBookmarks } from "./ui/ui";
import { State } from "./stateTf";
import { addBookmark } from "./tf/bookmarks";
import { humanReadable } from "./util/mlUtil";

const state = State.deserializeState();

const addCurrentBookmark = () => {
    const trainLoss = state.getModel().getCurrentTrainLoss();
    const testLoss = state.getModel().getCurrentTestLoss();
    const name = `${humanReadable(trainLoss)} / ${humanReadable(testLoss)} (${state.getModel().getTotalEpochs()})`;
    const url = location.href;

    addBookmark({ name, url });
}

const start = async () => {

    const datasetUrl = state.datasetUrl && state.datasetUrl.length > 0 ? state.datasetUrl : "./datasets/irisFlower.json";

    const dataSource = await loadDataSource(datasetUrl);
    showDataSource(dataSource);
    const dataset = new Dataset(dataSource, "label");
    state.initModel(dataset);

    const reset = () => {
        state.initModel(dataset);
        resetLineChart();

    }

    makeGUI(reset, state.getPlayer().togglePlayPause, state.doModelStep, state.addLayer, state.removeLayer, state.setActivationName, state.changeDatasetUrl, addCurrentBookmark);
    setSelectComponentByValue("activations", state.activationName);
    setSelectComponentByValue("datasources", state.datasetUrl);
}

start();