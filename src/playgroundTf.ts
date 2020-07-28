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
import { Dataset, loadDataSource, splitTrainAndTest } from "./datasetV5";
import { makeGUI, resetLineChart, showDataSource } from "./ui/ui";
import { State } from "./stateTf";

const start = async () => {
    const state = State.deserializeState();

    const datasetUrl = state.datasetUrl && state.datasetUrl.length > 0 ? state.datasetUrl : "./datasets/irisFlower.json";

    const dataSource = await loadDataSource(datasetUrl);
    showDataSource(dataSource);
    const dataset = new Dataset(dataSource, "label");
    state.initModel(dataset);

    const reset = () => {
        state.initModel(dataset);
        resetLineChart();

    }

    makeGUI(reset, state.getPlayer().togglePlayPause, state.doModelStep, state.addLayer, state.removeLayer, state.setActivationName);
}

start();