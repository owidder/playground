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
import "./css/styles.css";
import "./css/stylesTf.scss";
import * as tf from "@tensorflow/tfjs";
import { Model } from "./tf/model";
import { Dataset } from "./datasetV5";
import * as dataReader from "./data/dataReader";

import * as ui from "./ui/ui";

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
import { step } from "@tensorflow/tfjs";
import { TfNode } from "./tf/tfNode";
import { TfLink } from "./tf/tfLink";

// let mainWidth: number;

let dataset: Dataset;
// let model: Model;

// More scrolling
d3.select(".more button").on("click", function () {
  let position = 800;
  d3.transition()
    .duration(1000)
    .tween("scroll", scrollTween(position));
});

function scrollTween(offset) {
  return function () {
    let i = d3.interpolateNumber(window.pageYOffset ||
      document.documentElement.scrollTop, offset);
    return function (t) { scrollTo(0, i(t)); };
  };
}

const RECT_SIZE = 30;
const BIAS_SIZE = 5;
const NUM_SAMPLES_CLASSIFY = 500;
const NUM_SAMPLES_REGRESS = 1200;
const DENSITY = 100;

enum HoverType {
  BIAS, WEIGHT
}

interface InputFeature {
  f: (x: number, y: number) => number;
  label?: string;
}

let INPUTS: { [name: string]: InputFeature } = {
  "x": { f: (x, y) => x, label: "X_1" },
  "y": { f: (x, y) => y, label: "X_2" },
  "xSquared": { f: (x, y) => x * x, label: "X_1^2" },
  "ySquared": { f: (x, y) => y * y, label: "X_2^2" },
  "xTimesY": { f: (x, y) => x * y, label: "X_1X_2" },
  "sinX": { f: (x, y) => Math.sin(x), label: "sin(X_1)" },
  "sinY": { f: (x, y) => Math.sin(y), label: "sin(X_2)" },
};

let HIDABLE_CONTROLS = [
  ["Show test data", "showTestData"],
  ["Discretize output", "discretize"],
  ["Play button", "playButton"],
  ["Step button", "stepButton"],
  ["Reset button", "resetButton"],
  ["Learning rate", "learningRate"],
  ["Activation", "activation"],
  ["Regularization", "regularization"],
  ["Regularization rate", "regularizationRate"],
  ["Problem type", "problem"],
  ["Which dataset", "dataset"],
  ["Ratio train data", "percTrainData"],
  ["Noise level", "noise"],
  ["Batch size", "batchSize"],
  ["# of hidden layers", "numHiddenLayers"],
];

function makeGUI() {
  d3.select("#reset-button").on("click", () => {
    reset();
  });

  d3.select("#play-pause-button").on("click", function () {
    state.getPlayer().togglePlayPause();
  });

  d3.select("#next-step-tf-button").on("click", () => {
    state.doModelStep();
  })

  let regDatasetKey = getKeyFromValue(regDatasets, state.regDataset);
  d3.select(`canvas[data-regDataset=${regDatasetKey}]`)
    .classed("selected", true);

  d3.select("#add-layers").on("click", state.addLayer);

  d3.select("#remove-layers").on("click", state.removeLayer);

  let activationDropdown = d3.select("#activations").on("change", function () {
    state.activation = activations[(this as any).value];
    state.activationName = (this as any).value;
    reset();
  });
  activationDropdown.property("value",
    getKeyFromValue(activations, state.activation));

  let learningRate = d3.select("#learningRate").on("change", function () {
    state.learningRate = +(this as any).value;
    state.serialize();
  });
  learningRate.property("value", state.learningRate);

  let regularDropdown = d3.select("#regularizations").on("change",
    function () {
      state.regularization = regularizations[(this as any).value];
      reset();
    });
  regularDropdown.property("value",
    getKeyFromValue(regularizations, state.regularization));

  let regularRate = d3.select("#regularRate").on("change", function () {
    state.regularizationRate = +(this as any).value;
    reset();
  });
  regularRate.property("value", state.regularizationRate);

  let x = d3.scaleLinear().domain([-1, 1]).range([0, 144]);
  let xAxis = d3.axisBottom(x)
    .tickValues([-1, 0, 1])
    .tickFormat(d3.format("d"));
  d3.select("#colormap g.core").append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,10)")
    .call(xAxis);

  if (state.hideText) {
    d3.select("#article-text").style("display", "none");
    d3.select("div.more").style("display", "none");
    d3.select("header").style("display", "none");
  }
}

function reset() {
  state.initModel(dataset);
}

function initTutorial() {
  if (state.tutorial == null || state.tutorial === '' || state.hideText) {
    return;
  }
  d3.selectAll("article div.l--body").remove();
  let tutorial = d3.select("article").append("div")
    .attr("class", "l--body");
  d3.html(`tutorials/${state.tutorial}.html`).then(htmlFragment => {
    tutorial.node().appendChild(htmlFragment);
    let title = tutorial.select("title");
    if (title.size()) {
      d3.select("header h1").styles({
        "margin-top": "20px",
        "margin-bottom": "20px",
      })
        .text(title.text());
      document.title = title.text();
    }
  });
}

let state = State.deserializeState();

let trainData: DataPoint[] = [];
let testData: DataPoint[] = [];
trainData = dataReader.train;
testData = dataReader.test;

dataset = new Dataset(trainData, testData, "species");
state.initModel(dataset);

initTutorial();
makeGUI();
