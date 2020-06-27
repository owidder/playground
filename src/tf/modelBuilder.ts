import {tf} from "./tfJsWrapper";

import {State} from "../stateTf";

let _model;

export const buildModel = (state: State): any => {
    const model = tf.sequential();

    state.networkShape.slice(1).forEach((numerOfNodesInLayer, layerIndex) => {
        const config: any = {
            activation: layerIndex == state.networkShape.length-1 ? "softmax" : state.activationName,
            units: numerOfNodesInLayer,
        }
        if(layerIndex == 0) {
            config.inputShape = state.networkShape[0]
        }
        model.add(tf.layers.dense(config))
    })

    model.compile({
        loss: "categoricalCrossentropy",
        optimizer: tf.train.adam()
    })

    _model = model

    return model
}

export const getModel = () => _model
