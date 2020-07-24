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
import * as tf from "@tensorflow/tfjs";
import { Model } from "./tf/model";
import { Dataset } from "./datasetV5";
import * as dataReader from "./data/dataReader";
import {AppendingLineChart} from "./linechartV5";

import {makeGUI} from "./ui/ui";

import {
  State,
  datasets,
  regDatasets,
  activations,
  problems,
  regularizations,
  getKeyFromValue,
  Problem
} from "./stateTf";

import { DataPoint } from "./datasetV5";
import * as d3 from 'd3';
import 'd3-selection-multi';

function _makeGUI() {
  d3.select("#reset-button").on("click", () => {
    reset();
  });

  d3.select("#play-pause-button").on("click", function () {
    state.getPlayer().togglePlayPause();
  });

  d3.select("#next-step-tf-button").on("click", () => {
    state.doModelStep();
  })

  d3.select("#add-layers").on("click", state.addLayer);

  d3.select("#remove-layers").on("click", state.removeLayer);

  let activationDropdown = d3.select("#activations").on("change", function () {
    state.activation = activations[(this as any).value];
    state.activationName = (this as any).value;
    reset();
  });
  activationDropdown.property("value",
    getKeyFromValue(activations, state.activation));

}

const reset = () => {
  state.initModel(dataset);
}

const state = State.deserializeState();

let trainData: DataPoint[] = [];
let testData: DataPoint[] = [];
trainData = dataReader.train;
testData = dataReader.test;

const dataset = new Dataset(trainData, testData, "species");
state.initModel(dataset);

makeGUI(reset, state.getPlayer().togglePlayPause, state.doModelStep, state.addLayer, state.removeLayer, state.setActivationName);
