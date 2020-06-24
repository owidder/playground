const tf = require("@tensorflow/tfjs");

const labels = tf.tensor1d([1., 0., 0.]);
const predictions = tf.tensor1d([1., 0., 0.]);
const t = tf.metrics.categoricalCrossentropy(labels, predictions);


const getData = async (t) => {
    const d = await t.data();
    const v = d[0];
    console.log(v)
}

t.print();
getData(t);
