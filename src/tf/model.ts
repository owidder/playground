import * as tf from "@tensorflow/tfjs";

import {State} from "../stateTf";
import {Dataset} from "../datasetV5";

import {Sequential} from "@tensorflow/tfjs-layers/dist/models";
import {DenseLayerArgs} from "@tensorflow/tfjs-layers/dist/layers/core";
import {ActivationIdentifier} from "@tensorflow/tfjs-layers/dist/keras_format/activation_config";
import {History} from "@tensorflow/tfjs-layers/dist/base_callbacks";

export class Model {

    private _sequential: Sequential;
    private _state: State;
    private _dataset: Dataset;

    constructor(state: State, dataset: Dataset) {
        this._state = state;
        this._dataset = dataset;

        this._sequential = tf.sequential();

        state.networkShape.slice(1).forEach((numberOfNodesInLayer, layerIndex) => {
            const config: DenseLayerArgs = {
                activation: layerIndex == state.networkShape.length-1 ? "softmax" : (state.activationName as ActivationIdentifier),
                units: numberOfNodesInLayer,
            }
            if(layerIndex == 0) {
                config.inputShape = [state.networkShape[0]]
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
        return this._sequential.fit(this._dataset.getTrainInputTensor(), this._dataset.getTrainOutputTensor());
    }
}
