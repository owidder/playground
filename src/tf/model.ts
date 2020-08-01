import * as tf from "@tensorflow/tfjs";

import { Dataset } from "../datasetTf";

import { Sequential } from "@tensorflow/tfjs-layers/dist/models";
import { DenseLayerArgs } from "@tensorflow/tfjs-layers/dist/layers/core";
import { ActivationIdentifier } from "@tensorflow/tfjs-layers/dist/keras_format/activation_config";
import { History } from "@tensorflow/tfjs-layers/dist/base_callbacks";
import { Logs } from "@tensorflow/tfjs-layers/dist/logs";

import { TfNode, TfLink, NodeIterator } from "./networkTypes";
import { range } from "../util/mlUtil";
import { updateUI, stepStarted, stepEnded } from "../ui/ui";
import { Scalar } from "@tensorflow/tfjs";

export type TotalEpochsChangedCallback = (currentTotalEpoch) => void;
export type EpochEndCallback = (trainLoss: number, testLoss: number) => void;

export class Model {

    private _sequential: Sequential;
    private _dataset: Dataset;
    private _network: TfNode[][];
    private totalEpochs = 0;
    private totalEochsChangedCallbacks: TotalEpochsChangedCallback[] = [];
    private epochEndCallbacks: EpochEndCallback[] = [];
    private currentTrainLoss: number;
    private currentTestLoss: number;
    private activationName: string;

    public getCurrentTrainLoss = () => this.currentTrainLoss;
    public getCurrentTestLoss = () => this.currentTestLoss;
    public getTotalEpochs = () => this.totalEpochs;
    public getActivationName = () => this.activationName;

    public registerTotalEpochsChangedCallback = (totalEpochsChangedCallback: TotalEpochsChangedCallback) => {
        this.totalEochsChangedCallbacks.push(totalEpochsChangedCallback);
    }

    public registerEpochEndCallback = (epochEndCallback: EpochEndCallback) => {
        this.epochEndCallbacks.push(epochEndCallback);
    }

    constructor(networkShape: number[], activationName: string, dataset: Dataset) {
        this._dataset = dataset;
        this.activationName = activationName;

        this._sequential = tf.sequential();

        networkShape.slice(1).forEach((numberOfNodesInLayer, layerIndex) => {
            const config: DenseLayerArgs = {
                activation: layerIndex == networkShape.length - 2 ? "softmax" : (activationName as ActivationIdentifier),
                units: numberOfNodesInLayer,
                name: `${layerIndex}`
            }
            if (layerIndex == 0) {
                config.inputShape = [networkShape[0]]
            }
            this._sequential.add(tf.layers.dense(config))
        })

        this._sequential.compile({
            loss: "categoricalCrossentropy",
            optimizer: tf.train.adam()
        });

        this._sequential.summary();
    }

    private onEpochEnd = (epoch: number, logs: Logs): void => {
        this.currentTrainLoss = logs.loss;
        const testLossTensor = this._sequential.evaluate(this._dataset.getTestInputTensor(), this._dataset.getTestOutputTensor()) as Scalar;
        this.currentTestLoss = testLossTensor.dataSync()[0];
        this.epochEndCallbacks.forEach(eec => {
            eec(this.currentTrainLoss, this.currentTestLoss);
        })

        this.totalEpochs++;
        this.totalEochsChangedCallbacks.forEach(tecc => {
            tecc(this.totalEpochs)
        })
    }

    public fitStep = async (epochs = 10): Promise<History> => {
        const inputTensor = this._dataset.getTrainInputTensor();
        const outputTensor = this._dataset.getTrainOutputTensor();

        const history = await this._sequential.fit(inputTensor, outputTensor, {
            callbacks: { onEpochEnd: this.onEpochEnd }, epochs
        });

        this.updateNetwork();
        return history;
    }

    // including input layer
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
