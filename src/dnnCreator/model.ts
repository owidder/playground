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

import * as tf from "@tensorflow/tfjs";

import { Dataset } from "./datasetTf";

import { Sequential } from "@tensorflow/tfjs-layers/dist/models";
import { DenseLayerArgs } from "@tensorflow/tfjs-layers/dist/layers/core";
import { ActivationIdentifier } from "@tensorflow/tfjs-layers/dist/keras_format/activation_config";
import { History } from "@tensorflow/tfjs-layers/dist/base_callbacks";
import { Logs } from "@tensorflow/tfjs-layers/dist/logs";

import { TfNode, TfLink, NodeIterator } from "./networkTypes";
import { range } from "./mlUtil";
import { updateUI } from "./ui";
import { Scalar, loadLayersModel, LayersModel, Tensor, Tensor1D, layers } from "@tensorflow/tfjs";
import { Layer } from "@tensorflow/tfjs-layers/dist/engine/topology";

export type TotalEpochsChangedCallback = (currentTotalEpoch) => void;
export type GetPredictionFunction = () => { expected: Tensor1D, predicted: Tensor1D };
export type EpochEndCallback = (trainLoss: number, testLoss: number, getPredictionFunction: GetPredictionFunction, classNames: string[]) => void;

export const createModelId = (networkShape: number[], activations: string[], url: string, batchSize: number, percTrainData: number, shuffleseed: number): string => {
    const sanitizedUrl = url.replace(/\W/g, "_");
    return `${networkShape.join("-")}__${activations.join("-")}__${sanitizedUrl}__${batchSize}__${percTrainData}__${shuffleseed}`;
}

export const loadModel = async (networkShape: number[], activations: string[], batchSize: number, url: string, percTrainData: number, shuffleseed: number): Promise<LayersModel> => {
    const modelId = createModelId(networkShape, activations, url, batchSize, percTrainData, shuffleseed);
    if (localStorage.getItem(`tensorflowjs_models/${modelId}/model_topology`)) {
        return await loadLayersModel(`localstorage://${modelId}`);
    }
}

export const getLayersFromSavedModel = async (networkShape: number[], activations: string[], batchSize: number, url: string, percTrainData: number, shuffleseed: number): Promise<Layer[]> => {
    const loadedSequentialModel = await loadModel(networkShape, activations, batchSize, url, percTrainData, shuffleseed) as Sequential;
    const layersCount = loadedSequentialModel.getConfig().layers.length;
    return range(0, layersCount).map(layerIndex => loadedSequentialModel.getLayer(undefined, layerIndex));
}

export const removeModel = (modelId: string): void => {
    const items = Object.keys(localStorage);
    items.forEach(item => {
        if (item.startsWith(`tensorflowjs_models/${modelId}`)) {
            localStorage.removeItem(item);
        }
    })
}

export const createModel = (networkShape: number[], activations: string[]) => {
    const model = tf.sequential();

    networkShape.slice(1).forEach((numberOfNodesInLayer, layerIndex) => {
        const config: DenseLayerArgs = {
            activation: activations[layerIndex] as ActivationIdentifier,
            units: numberOfNodesInLayer,
            name: `${layerIndex}`,
            inputShape: layerIndex == 0 ? [networkShape[0]] : undefined
        }
        model.add(tf.layers.dense(config))
    })

    return model
}

export class Model {

    private _sequential: Sequential;
    private _dataset: Dataset;
    private _network: TfNode[][];
    private totalEpochs = 0;
    private totalEpochsChangedCallbacks: TotalEpochsChangedCallback[] = [];
    private epochEndCallbacks: EpochEndCallback[] = [];
    private currentTrainLoss: number;
    private currentTestLoss: number;
    private activations: string[];
    private batchSize: number;
    private percTrainData: number;
    private shuffleseed: number;

    public getCurrentTrainLoss = () => this.currentTrainLoss;
    public getCurrentTestLoss = () => this.currentTestLoss;
    public getTotalEpochs = () => this.totalEpochs;
    public getActivations = () => this.activations;
    public getBatchSize = () => this.batchSize;

    public getModelId(): string {
        return createModelId(this.getNetworkShape(), this.activations, this._dataset.getDataSource().url, this.batchSize, this.percTrainData, this.shuffleseed);
    }

    public async saveModel() {
        const saveResult = await this._sequential.save(`localstorage://${this.getModelId()}`);
        console.log(saveResult);
    }

    public registerTotalEpochsChangedCallback = (totalEpochsChangedCallback: TotalEpochsChangedCallback) => {
        this.totalEpochsChangedCallbacks.push(totalEpochsChangedCallback);
    }

    public registerEpochEndCallback = (epochEndCallback: EpochEndCallback) => {
        this.epochEndCallbacks.push(epochEndCallback);
    }

    constructor(networkShape: number[], activations: string[], dataset: Dataset, batchSize: number, percTrainData: number, shuffleseed: number, loadedModel?: Sequential) {
        this._dataset = dataset;
        this.activations = activations;
        this.batchSize = batchSize;
        this.percTrainData = percTrainData;
        this.shuffleseed = shuffleseed;

        if (loadedModel) {
            this._sequential = loadedModel;
        } else {
            this._sequential = createModel(networkShape, activations);
        }

        this._sequential.compile({
            loss: "categoricalCrossentropy",
            optimizer: tf.train.adam()
        });

        this._sequential.summary();
    }

    public download = async (): Promise<void> => {
        await this._sequential.save(`downloads://${this.getModelId()}`);
    }

    private getPrediction: GetPredictionFunction = () => {
        const testData = this._dataset.getTestInputTensor();
        const result = this._sequential.predict(testData) as Tensor1D;
        const predicted = result.argMax(-1) as Tensor1D;
        const expected = this._dataset.getTestOutputTensor().argMax(-1) as Tensor1D;
        return { expected, predicted }
    }

    private onEpochEnd = (epoch: number, logs: Logs): void => {
        this.currentTrainLoss = logs.loss;
        const testLossTensor = this._sequential.evaluate(this._dataset.getTestInputTensor(), this._dataset.getTestOutputTensor()) as Scalar;
        this.currentTestLoss = testLossTensor.dataSync()[0];
        this.epochEndCallbacks.forEach(eec => {
            eec(this.currentTrainLoss, this.currentTestLoss, this.getPrediction, this._dataset.getLabelValues());
        })

        this.totalEpochs++;
        this.totalEpochsChangedCallbacks.forEach(tecc => {
            tecc(this.totalEpochs)
        })
    }

    public fitStep = async (epochs = 10): Promise<History> => {
        const inputTensor = this._dataset.getTrainInputTensor();
        const outputTensor = this._dataset.getTrainOutputTensor();

        const history = await this._sequential.fit(inputTensor, outputTensor, {
            callbacks: { onEpochEnd: this.onEpochEnd }, epochs, batchSize: this.batchSize
        });

        this.updateNetwork();
        return history;
    }

    public numberOfLayers = (): number => {
        return this._sequential.getConfig().layers.length + 1
    }

    public layerSize = (layerIndex: number): number => {
        if (layerIndex == 0) {
            return this._sequential.getConfig().layers[0].config.batchInputShape[1];
        } else {
            return this._sequential.getConfig().layers[layerIndex - 1].config.units;
        }
    }

    public maxLayerSize = (): number => {
        return Math.max(...range(0, this.numberOfLayers()).map(this.layerSize))
    }

    public getLayers = (): Layer[] => {
        return range(0, this.numberOfLayers() - 1).map(layerIndex => this._sequential.getLayer(undefined, layerIndex));
    }

    public static nodeId = (layerIndex: number, nodeIndex: number) => `${layerIndex}-${nodeIndex}`;

    private createInputLinks = (layerIndex: number, nodeIndex: number, weights: number[]): TfLink[] => {
        const numberOfOutputLinks = this.layerSize(layerIndex);
        const thisNodeId = Model.nodeId(layerIndex, nodeIndex);
        const links = weights.filter((_, i) => (i % numberOfOutputLinks) == nodeIndex)
            .map((weight, i) => new TfLink(Model.nodeId(layerIndex - 1, i), thisNodeId, weight));
        return links
    }

    private createNodesOfLayer = (layerIndex: number): TfNode[] => {
        if (layerIndex == 0) {
            const featureName = this._dataset.getFeatureNames();
            return range(0, this.layerSize(0)).map((i) => new TfNode(Model.nodeId(0, i), undefined, undefined, featureName[i]))
        } else {
            const weights: number[] = Array.from(this._sequential.getLayer("", layerIndex - 1).getWeights()[0].dataSync());
            const biases: number[] = Array.from(this._sequential.getLayer("", layerIndex - 1).getWeights()[1].dataSync());
            const nodes = biases.map((bias, i) => {
                const links = this.createInputLinks(layerIndex, i, weights);
                const name = layerIndex == this.numberOfLayers() - 1 ? this._dataset.getLabelValues()[i] : undefined;
                return new TfNode(Model.nodeId(layerIndex, i), links, bias, name)
            })

            return nodes
        }
    }

    private updateWeights = (layer: TfNode[], index: number): void => {
        if (index == 0) {
            return;
        }

        const weights: number[] = Array.from(this._sequential.getLayer("", index - 1).getWeights()[0].dataSync());
        const biases: number[] = Array.from(this._sequential.getLayer("", index - 1).getWeights()[1].dataSync());

        const numberOfOutputLinks = layer.length;
        weights.forEach((weight, index) => {
            const nodeIndex = index % numberOfOutputLinks;
            const node = layer[nodeIndex];
            const linkIndex = Math.floor(index / numberOfOutputLinks);
            const link = node.inputLinks[linkIndex];
            link.weight = weight;
        })

        biases.forEach((bias, index) => {
            const node = layer[index];
            node.bias = bias;
        })
    }

    public getNetwork = (): TfNode[][] => {
        if (!this._network) {
            this._network = range(0, this.numberOfLayers()).map((layerIndex: number) => {
                return this.createNodesOfLayer(layerIndex)
            })
        }

        return this._network
    }

    public getNetworkShape = (): number[] => {
        return this.getNetwork().map(layer => layer.length);
    }

    public updateNetwork = (): void => {
        this._network.forEach(this.updateWeights);
        updateUI(false, this._network, this.totalEpochs, this.forEachNode);
    }

    public resetNetwork = (): void => {
        this._network = null;
    }

    public forEachNode: NodeIterator = (ignoreInputs: boolean, accessor: (node: TfNode) => any): void => {
        this.getNetwork().slice(ignoreInputs ? 1 : 0).forEach(layer => {
            layer.forEach(accessor)
        })
    }
}
