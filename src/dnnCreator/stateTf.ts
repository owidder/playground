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

import { Dataset } from "./datasetTf";
import { Model, loadModel } from "./model";
import { Player, OneStepCallback } from "./player";
import { totalEpochsChanged, showNumberOfLayers, drawNetwork, updateUI, stepStarted, stepEnded, appendToLineChart } from "./ui";
import { swapArrayElements } from "./mlUtil";
import { LayersModel, Sequential, Logs } from "@tensorflow/tfjs";
import { addToHistory, showConfusionMatrix } from "./vis";

/** Suffix added to the state when storing if a control is hidden or not. */
const HIDE_STATE_SUFFIX = "_hide";

export const activationNamesArray = ['elu', 'hardSigmoid', 'linear', 'relu', 'relu6', 'selu', 'sigmoid', 'softmax', 'softplus', 'softsign', 'tanh'];

export const activationNames: { [key: string]: string } =
    activationNamesArray.reduce((_activationNames, name) => {
        return { ..._activationNames, [name]: name }
    }, {});

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

    private refreshCallback: () => void;
    public setRefreshCallback = (refreshCallback: () => void) => this.refreshCallback = refreshCallback;

    private static PROPS: Property[] = [
        { name: "activationName", type: Type.STRING, keyMap: activationNames },
        { name: "networkShape", type: Type.ARRAY_NUMBER },
        { name: "datasetUrl", type: Type.STRING },
        { name: "batchSize", type: Type.NUMBER },
        { name: "percTrainData", type: Type.NUMBER },
        { name: "activations", type: Type.ARRAY_STRING },
    ];

    [key: string]: any;
    networkShape: number[] = [];
    datasetUrl = "./datasets/irisFlower.json";
    batchSize = 10;
    percTrainData = 80;
    activations = ["softmax"];

    seed: string;

    changeDatasetUrl = (url: string): void => {
        this.datasetUrl = url;
        this.serialize();
        location.reload();
    }

    changePercTrainData = (percTrainData: number): void => {
        this.percTrainData = percTrainData;
        this.refreshModel();
    }

    initPlayer() {
        const oneStepCallback: OneStepCallback = async () => {
            await this.model.fitStep(1)
        }
        this.player = new Player(oneStepCallback, stepStarted, stepEnded)
    }

    refreshModel(): void {
        this.serialize();
        this.refreshCallback();
    }

    async initModel(dataset?: Dataset): Promise<void> {
        this.dataset = dataset ? dataset : this.dataset;
        const inputShape = this.dataset.getInputShape();
        const outputShape = this.dataset.getOutputShape();

        if (!this.networkShape || this.networkShape.length == 0) {
            this.networkShape = [inputShape, outputShape];
        } else {
            this.networkShape = [inputShape, ...this.networkShape.slice(1, this.networkShape.length - 1), outputShape];
        }
        this.numLayers = this.networkShape.length;

        const loadedModel: LayersModel = await loadModel(this.networkShape, this.activations, this.batchSize, this.datasetUrl);
        this.model = new Model(this.networkShape, this.activations, this.dataset, this.batchSize, loadedModel as Sequential);

        this.initPlayer();

        this.model.registerTotalEpochsChangedCallback(totalEpochsChanged);
        this.model.registerEpochEndCallback(appendToLineChart);
        this.model.registerEpochEndCallback(addToHistory);
        this.model.registerEpochEndCallback((_dummy1, _dummy2, getPrediction, classNames) => showConfusionMatrix(getPrediction, classNames));

        this.serialize();

        showNumberOfLayers(this.networkShape.length);

        drawNetwork(this.model.getNetwork(),
            this.changeNumberOfNodes,
            (index) => this.addLayerAfterLayerWithIndex(index),
            (index) => this.removeLayerWithIndex(index),
            (activation, index) => this.changeActivationAtIndex(activation, index - 1),
            (index1, index2) => this.swapLayers(index1, index2),
            this.activations);
        updateUI(true, this.model.getNetwork(), this.model.getTotalEpochs(), this.model.forEachNode);
    }


    doModelStep = (): void => {
        stepStarted();
        setTimeout(async () => {
            await this.model.fitStep(1);
            stepEnded();
        }, 100)
    }

    setBatchSize = (batchSize: number) => {
        this.batchSize = batchSize;
        this.refreshModel();
    }

    addLayerAfterLayerWithIndex = (layerIndex: number): void => {
        this.networkShape.splice(layerIndex + 1, 0, 2);
        this.activations.splice(layerIndex, 0, "sigmoid");
        this.refreshModel();
    }

    removeLayerWithIndex = (index: number): void => {
        this.networkShape.splice(index, 1);
        this.activations.splice(index - 1, 1);
        this.refreshModel();
    }

    changeActivationAtIndex = (activation: string, index: number): void => {
        this.activations[index] = activation;
        this.refreshModel();
    }

    changeNumberOfNodes = (layerIndex: number, diff: number): void => {
        const current = this.networkShape[layerIndex];
        if (current + diff > 0) {
            this.networkShape[layerIndex] = current + diff;
        }
        this.refreshModel();
    }

    swapLayers = (layerIndex1: number, layerIndex2: number): void => {
        swapArrayElements(this.networkShape, layerIndex1, layerIndex2);
        swapArrayElements(this.activations, layerIndex1 - 1, layerIndex2 - 1);
        this.refreshModel();
    }

    /**
     * Deserializes the state from the url hash.
     */
    static deserializeState(): State {
        let map: { [key: string]: string } = {};
        for (let keyvalue of window.location.hash.slice(1).split("&")) {
            let [name, value] = keyvalue.split("=");
            map[name] = value;
        }
        let state = new State();

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
