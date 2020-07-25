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
import { Dataset } from "./datasetV5";
import * as dataReader from "./data/dataReader";
import { makeGUI, resetLineChart } from "./ui/ui";
import { State } from "./stateTf";

const state = State.deserializeState();

const dataset = new Dataset(dataReader.train, dataReader.test, "species");
state.initModel(dataset);

const reset = () => {
  state.initModel(dataset);
  resetLineChart();

}

makeGUI(reset, state.getPlayer().togglePlayPause, state.doModelStep, state.addLayer, state.removeLayer, state.setActivationName);
