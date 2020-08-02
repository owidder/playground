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

import * as nn from "./nn";
import * as dataset from "./datasetTf";
import { Dataset } from "./datasetTf";
import { Model } from "./tf/model";
import { Player, OneStepCallback } from "./tf/player";
import { totalEpochsChanged, showNumberOfLayers, drawNetwork, updateUI, stepStarted, stepEnded, appendToLineChart, showDatasetUrl } from "./ui/ui";

/** Suffix added to the state when storing if a control is hidden or not. */
const HIDE_STATE_SUFFIX = "_hide";

/** A map between names and activation functions. */
export let activations: { [key: string]: nn.ActivationFunction } = {
    "relu": nn.Activations.RELU,
    "tanh": nn.Activations.TANH,
    "sigmoid": nn.Activations.SIGMOID,
    "linear": nn.Activations.LINEAR
};

export const activationNames: { [key: string]: string } =
    ['elu', 'hardSigmoid', 'linear', 'relu', 'relu6', 'selu', 'sigmoid', 'softmax', 'softplus', 'softsign', 'tanh'].reduce((_activationNames, name) => {
        return { ..._activationNames, [name]: name }
    }, {});

/** A map between names and regularization functions. */
export let regularizations: { [key: string]: nn.RegularizationFunction } = {
    "none": null,
    "L1": nn.RegularizationFunction.L1,
    "L2": nn.RegularizationFunction.L2
};

/** A map between dataset names and functions that generate classification data. */
export let datasets: { [key: string]: dataset.DataGenerator } = {
    "circle": dataset.classifyCircleData,
    "xor": dataset.classifyXORData,
    "gauss": dataset.classifyTwoGaussData,
    "spiral": dataset.classifySpiralData,
};

/** A map between dataset names and functions that generate regression data. */
export let regDatasets: { [key: string]: dataset.DataGenerator } = {
    "reg-plane": dataset.regressPlane,
    "reg-gauss": dataset.regressGaussian
};

export function getKeyFromValue(obj: any, value: any): string {
    for (let key in obj) {
        if (obj[key] === value) {
            return key;
        }
    }
    return undefined;
}

function endsWith(s: string, suffix: string): boolean {
    return s.substr(-suffix.length) === suffix;
}

function getHideProps(obj: any): string[] {
    let result: string[] = [];
    for (let prop in obj) {
        if (endsWith(prop, HIDE_STATE_SUFFIX)) {
            result.push(prop);
        }
    }
    return result;
}

/**
 * The data type of a state variable. Used for determining the
 * (de)serialization method.
 */
export enum Type {
    STRING,
    NUMBER,
    ARRAY_NUMBER,
    ARRAY_STRING,
    BOOLEAN,
    OBJECT
}

export enum Problem {
    CLASSIFICATION,
    REGRESSION
}

export let problems = {
    "classification": Problem.CLASSIFICATION,
    "regression": Problem.REGRESSION
};

export interface Property {
    name: string;
    type: Type;
    keyMap?: { [key: string]: any };
}

// Add the GUI state.
export class State {

    private model: Model;
    private player: Player;
    private dataset: Dataset;
    public getModel = () => this.model;
    public getPlayer = () => this.player;
    public getDataset = () => this.dataset;

    constructor(dataset?: Dataset) {
        if (dataset) {
            this.initModel(dataset)
        } else {
            this.networkShape = []
        }
    }

    private static PROPS: Property[] = [
        { name: "activationName", type: Type.STRING, keyMap: activationNames },
        { name: "networkShape", type: Type.ARRAY_NUMBER },
        { name: "datasetUrl", type: Type.STRING },
        { name: "batchSize", type: Type.NUMBER },
    ];

    [key: string]: any;
    activationName = "tanh";
    networkShape: number[];
    datasetUrl = "./datasets/irisFlower.json";
    batchSize = 10;

    seed: string;

    changeDatasetUrl = (url: string) => {
        this.datasetUrl = url;
        this.serialize();
        location.reload();
    }

    initPlayer() {
        const oneStepCallback: OneStepCallback = async () => {
            await this.model.fitStep(this.batchSize)
        }
        this.player = new Player(oneStepCallback, stepStarted, stepEnded)
    }

    initModel(dataset?: Dataset): void {
        this.dataset = dataset ? dataset : this.dataset;
        const inputShape = this.dataset.getInputShape();
        const outputShape = this.dataset.getOutputShape();

        if (!this.networkShape || this.networkShape.length == 0) {
            this.networkShape = [inputShape, outputShape];
        } else {
            this.networkShape = [inputShape, ...this.networkShape.slice(1, this.networkShape.length - 1), outputShape];
        }
        this.numLayers = this.networkShape.length;

        this.model = new Model(this.networkShape, this.activationName, this.dataset);

        this.initPlayer();

        this.model.registerTotalEpochsChangedCallback(totalEpochsChanged);
        this.model.registerEpochEndCallback(appendToLineChart);

        this.serialize();

        showNumberOfLayers(this.networkShape.length);

        drawNetwork(this.model.getNetwork(), this.changeNumberOfNodes);
        updateUI(true, this.model.getNetwork(), this.model.getTotalEpochs(), this.model.forEachNode);
    }

    doModelStep = (): void => {
        stepStarted();
        setTimeout(async () => {
            await this.model.fitStep(this.batchSize);
            stepEnded();
        }, 100)
    }

    setActivationName = (activationName: string) => {
        this.activationName = activationName;
        this.initModel();
    }

    setBatchSize = (batchSize: number) => {
        this.batchSize = batchSize;
        this.initModel();
    }

    addLayer = (): void => {
        this.networkShape.splice(this.networkShape.length - 2, 0, 2);
        this.initModel();
    }

    removeLayer = (): void => {
        if (this.networkShape.length < 3) {
            return;
        }
        this.networkShape.splice(this.networkShape.length - 2, 1);
        this.initModel();
    }

    changeNumberOfNodes = (layerIndex: number, diff: number): void => {
        const current = this.networkShape[layerIndex];
        if (current + diff > 0) {
            this.networkShape[layerIndex] = current + diff;
        }
        this.initModel();
    }

    /**
     * Deserializes the state from the url hash.
     */
    static deserializeState(dataset?: Dataset): State {
        let map: { [key: string]: string } = {};
        for (let keyvalue of window.location.hash.slice(1).split("&")) {
            let [name, value] = keyvalue.split("=");
            map[name] = value;
        }
        let state = new State(dataset);

        function hasKey(name: string): boolean {
            return name in map && map[name] != null && map[name].trim() !== "";
        }

        function parseArray(value: string): string[] {
            return value.trim() === "" ? [] : value.split(",");
        }

        // Deserialize regular properties.
        State.PROPS.forEach(({ name, type, keyMap }) => {
            switch (type) {
                case Type.OBJECT:
                    if (keyMap == null) {
                        throw Error("A key-value map must be provided for state " +
                            "variables of type Object");
                    }
                    if (hasKey(name) && map[name] in keyMap) {
                        state[name] = keyMap[map[name]];
                    }
                    break;
                case Type.NUMBER:
                    if (hasKey(name)) {
                        // The + operator is for converting a string to a number.
                        state[name] = +map[name];
                    }
                    break;
                case Type.STRING:
                    if (hasKey(name)) {
                        state[name] = map[name];
                    }
                    break;
                case Type.BOOLEAN:
                    if (hasKey(name)) {
                        state[name] = (map[name] === "false" ? false : true);
                    }
                    break;
                case Type.ARRAY_NUMBER:
                    if (name in map) {
                        state[name] = parseArray(map[name]).map(Number);
                    }
                    break;
                case Type.ARRAY_STRING:
                    if (name in map) {
                        state[name] = parseArray(map[name]);
                    }
                    break;
                default:
                    throw Error("Encountered an unknown type for a state variable");
            }
        });

        // Deserialize state properties that correspond to hiding UI controls.
        getHideProps(map).forEach(prop => {
            state[prop] = (map[prop] === "true") ? true : false;
        });
        state.numHiddenLayers = state.networkShape.length - 2;
        if (state.seed == null) {
            state.seed = Math.random().toFixed(5);
        }
        Math.seedrandom(state.seed);
        return state;
    }

    /**
     * Serializes the state into the url hash.
     */
    serialize() {
        // Serialize regular properties.
        let props: string[] = [];
        State.PROPS.forEach(({ name, type, keyMap }) => {
            let value = this[name];
            // Don't serialize missing values.
            if (value == null) {
                return;
            }
            if (type === Type.OBJECT) {
                value = getKeyFromValue(keyMap, value);
            } else if (type === Type.ARRAY_NUMBER ||
                type === Type.ARRAY_STRING) {
                value = value.join(",");
            }
            props.push(`${name}=${value}`);
        });
        // Serialize properties that correspond to hiding UI controls.
        getHideProps(this).forEach(prop => {
            props.push(`${prop}=${this[prop]}`);
        });
        window.location.hash = props.join("&");
    }

    /** Returns all the hidden properties. */
    getHiddenProps(): string[] {
        let result: string[] = [];
        for (let prop in this) {
            if (endsWith(prop, HIDE_STATE_SUFFIX) && String(this[prop]) === "true") {
                result.push(prop.replace(HIDE_STATE_SUFFIX, ""));
            }
        }
        return result;
    }

    setHideProperty(name: string, hidden: boolean) {
        this[name + HIDE_STATE_SUFFIX] = hidden;
    }
}
