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

import { Tensor2D } from "@tensorflow/tfjs-core/dist/tensor";

import * as tf from "@tensorflow/tfjs";

import { oneHot } from "./mlUtil";
import { DataPoint, DataSource } from "./networkTypes";
import { assertValidityOfDataPoints, getDataFromDataPoint, createOneHotEncoding, createLabelValues } from "./mlUtil";

/**
 * A two dimensional example: x and y coordinates with the label.
 */
export type Example2D = {
    x: number,
    y: number,
    label: number
};

export type TrainAndTest = {
    train: DataPoint[];
    test: DataPoint[];
}

export const loadDataSource = async (url: string): Promise<DataSource> => {
    const response = await fetch(url);
    const json = await response.json();
    return (json as DataSource);
}

export const splitTrainAndTest = (data: DataPoint[], testRatio: number): TrainAndTest => {
    const testSize = Math.floor(data.length * testRatio);
    const trainSize = data.length - testSize;
    const train = data.slice(0, trainSize);
    const test = data.slice(trainSize);
    return { train, test }
}

export class Dataset {

    private dataSource: DataSource;
    private trainAndTest: TrainAndTest;
    private labelValues: string[];
    private featureNames: string[]; 
    private labelName: string;
    private inputShape: number;
    private outputShape: number;
    private trainInputTensor: Tensor2D;
    private trainOutputTensor: Tensor2D;
    private testInputTensor: Tensor2D;
    private testOutputTensor: Tensor2D;

    public getDataSource = () => this.dataSource;
    public getTrainData = () => this.trainAndTest.train;
    public getTestData = () => this.trainAndTest.test;
    public getLabelValues = () => this.labelValues;
    public getFeatureNames = () => this.featureNames;
    public getLabelName = () => this.labelName;
    public getInputShape = () => this.inputShape;
    public getOutputShape = () => this.outputShape;
    public getTrainInputTensor = () => this.trainInputTensor;
    public getTrainOutputTensor = () => this.trainOutputTensor;
    public getTestInputTensor = () => this.testInputTensor;
    public getTestOutputTensor = () => this.testOutputTensor;

    constructor(dataSource: DataSource, _labelName: string, percTrainData: number) {
        assertValidityOfDataPoints(dataSource.data, _labelName);

        this.dataSource = dataSource;
        this.trainAndTest = splitTrainAndTest(dataSource.data, 1 - (percTrainData/100));
        this.labelName = _labelName;

        this.labelValues = createLabelValues(dataSource.data, _labelName);
        this.outputShape = this.labelValues.length;

        this.featureNames = Object.keys(dataSource.data[0]).filter(key => key !== _labelName).sort(); 
        this.inputShape = this.featureNames.length;

        this.trainInputTensor = tf.tensor2d(this.trainAndTest.train.map(dataPoint => getDataFromDataPoint(dataPoint, this.featureNames)), [this.trainAndTest.train.length, this.inputShape]);
        const outputTrain = this.trainAndTest.train.map(dataPoint => createOneHotEncoding(dataPoint, this.labelValues, _labelName));
        this.trainOutputTensor = tf.tensor2d(outputTrain, [this.trainAndTest.train.length, this.outputShape]);

        this.testInputTensor = tf.tensor2d(this.trainAndTest.test.map(dataPoint => getDataFromDataPoint(dataPoint, this.featureNames)), [this.trainAndTest.test.length, this.inputShape]);
        const outputTest = this.trainAndTest.test.map(dataPoint => createOneHotEncoding(dataPoint, this.labelValues, _labelName));
        this.testOutputTensor = tf.tensor2d(outputTest, [this.trainAndTest.test.length, this.outputShape]);
    }

    createOneHotEncoding = (dataPoint: DataPoint): (0 | 1)[] => {
        const index = this.labelValues.indexOf(String(dataPoint[this.labelName]));
        return oneHot(this.labelValues.length, index)
    }
}
