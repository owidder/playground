import * as tf from "@tensorflow/tfjs";

export const categoricalCrossentropy = (expected, actual) => {
    return tf.metrics.categoricalCrossentropy(tf.tensor1d(expected), tf.tensor1d(actual))
}
