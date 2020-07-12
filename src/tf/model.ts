import * as tf from "@tensorflow/tfjs";

 import {Dataset} from "../datasetV5";
import {TfNode} from "./tfNode";

import {Sequential} from "@tensorflow/tfjs-layers/dist/models";
import {DenseLayerArgs} from "@tensorflow/tfjs-layers/dist/layers/core";
import {ActivationIdentifier} from "@tensorflow/tfjs-layers/dist/keras_format/activation_config";
import {History} from "@tensorflow/tfjs-layers/dist/base_callbacks";

import {TfLink} from "./tfLink";
import {range} from "../util/mlUtil";

export class Model {

    private _sequential: Sequential;
    private _dataset: Dataset;
    private _networkCache: TfNode[][];

    constructor(networkShape: number[], activationName: string, dataset: Dataset) {
        this._dataset = dataset;

        this._sequential = tf.sequential();

        networkShape.slice(1).forEach((numberOfNodesInLayer, layerIndex) => {
            const config: DenseLayerArgs = {
                activation: layerIndex == networkShape.length-1 ? "softmax" : (activationName as ActivationIdentifier),
                units: numberOfNodesInLayer,
                name: `${layerIndex}`
            }
            if(layerIndex == 0) {
                config.inputShape = [networkShape[0]]
            }
            this._sequential.add(tf.layers.dense(config))
        })
    
        this._sequential.summary();

        this._sequential.compile({
            loss: "categoricalCrossentropy",
            optimizer: tf.train.adam()
        });
    }

    public fitStep = async (): Promise<History> => {
        this._networkCache = undefined;

        const inputTensor = this._dataset.getTrainInputTensor();
        const outputTensor = this._dataset.getTrainOutputTensor();
        const history = await this._sequential.fit(inputTensor, outputTensor, {epochs: 5});
        const weights = this._sequential.getLayer("", 1).getWeights();
        const kernelWeights = await weights[0].data();
        const biasWeights = await weights[1].data();
        console.log(kernelWeights);
        console.log(biasWeights);
        console.log(history.history.loss[0])
        return history;
    }

    // including input layer
    public numberOfLayers = (): number => {
        return this._sequential.getConfig().layers.length + 1
    }

    public layerSize = (layerIndex: number): number => {
        if(layerIndex == 0) {
            return this._sequential.getConfig().layers[0].config.batchInputShape[1];
        } else {
            return this._sequential.getConfig().layers[layerIndex-1].config.units;
        }
    }

    public static nodeId = (layerIndex: number, nodeIndex: number) => `${layerIndex}-${nodeIndex}`;

    private createInputLinks = (layerIndex: number, nodeIndex: number, weights: number[]): TfLink[] => {
        const numberOfInputLinks = this.layerSize(layerIndex-1);
        const thisNodeId = Model.nodeId(layerIndex, nodeIndex);
        const links = weights.slice(nodeIndex*numberOfInputLinks, (nodeIndex+1)*numberOfInputLinks)
            .map((weight, i) => new TfLink(Model.nodeId(layerIndex-1, i), thisNodeId, weight));
        return links
    }

    private createNodesOfLayer = (layerIndex: number): TfNode[] => {
        if(layerIndex == 0) {
            return range(0, this.layerSize(0)).map((i) => new TfNode(Model.nodeId(0, i)))
        } else {
            const weights: number[] = Array.from(this._sequential.getLayer("", layerIndex-1).getWeights()[0].dataSync());
            const biases: number[] = Array.from(this._sequential.getLayer("", layerIndex-1).getWeights()[1].dataSync());
    
            const nodes = biases.map((bias, i) => {
                const links = this.createInputLinks(layerIndex, i, weights);
                return new TfNode(Model.nodeId(layerIndex, i), links, bias)
            })
    
            return nodes
            }
    }

    public getNetwork = (): TfNode[][] => {
        if(!this._networkCache) {
            this._networkCache = range(0, this.numberOfLayers()).map((layerIndex: number) => {
                return this.createNodesOfLayer(layerIndex)
            })
        }

        return this._networkCache
    }

    public forEachNode = (ignoreInputs: boolean, accessor: (node: TfNode) => any) => {
        this.getNetwork().slice(ignoreInputs ? 1 : 0).forEach(layer => {
            layer.forEach(accessor)
        })
    }
}
