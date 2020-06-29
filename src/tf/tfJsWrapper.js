import * as _tf from "@tensorflow/tfjs";

export const tf = {
    layers: {
        dense: (config) => _tf.layers.dense(config),
    },
    metrics: {
        categoricalCrossentropy: (expected, actual) => _tf.metrics.categoricalCrossentropy(_tf.tensor1d(expected), _tf.tensor1d(actual)),
    },
    sequential: () => _tf.sequential(),
    tensor2d: (arr, shape) => _tf.tensor2d(err, shape),
    train: {
        adam: () => _tf.train.adam(),
    }
}
