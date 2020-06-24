import * as _tf from "@tensorflow/tfjs";

export const tf = {
    metrics: {
        categoricalCrossentropy: (expected, actual) => {
            return _tf.metrics.categoricalCrossentropy(_tf.tensor1d(expected), _tf.tensor1d(actual))
        }
    }
}
