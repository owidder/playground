import * as _tf from "@tensorflow/tfjs";

export const tf = {
    metrics: {
        categoricalCrossentropy: (expected, actual) => _tf.metrics.categoricalCrossentropy(_tf.tensor1d(expected), _tf.tensor1d(actual)),
    },
    sequential: () => _tf.sequential(),
    layers: {
        dense: (config) => _tf.layers.dense(config),
    },
    train: {
        adam: () => _tf.train.adam(),
    }
}
