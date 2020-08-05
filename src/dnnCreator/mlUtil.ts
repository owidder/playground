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

import { DataPoint } from "./networkTypes";

// kudos to: https://dev.to/ycmjason/how-to-create-range-in-javascript-539i
function* _range(start: number, end: number) {
    if (start === end) return;
    yield start;
    yield* _range(start + 1, end);
}

export const range = (start: number, end: number): number[] => {
    return Array.from(_range(start, end))
}

export const oneHot = (dimension: number, index: number): (0 | 1)[] => {
    return range(0, dimension).map((_, i) => i == index ? 1 : 0)
}

export const maxLayerSize = (layers: any[][]): number => {
    return Math.max(...layers.map(layer => layer.length))
}

export const assertValidityOfDataPoints = (dataPoints: DataPoint[], labelName: string) => {
    const expectedAttributeNames = Object.keys(dataPoints[0]).sort().join(",");
    dataPoints.forEach((dataPoint, i) => {
        const attributeNames = Object.keys(dataPoint).sort().join(",");
        if(expectedAttributeNames !== attributeNames) {
            throw new Error(`Attributes do not fit. Index: ${i}, expected: ${expectedAttributeNames}, actual: ${attributeNames}`)
        }
        Object.keys(dataPoint).forEach(key => {
            if(key == labelName) {
                const _type = typeof dataPoint[key];
                if(_type !== "string") {
                    throw new Error(`label "${key}" has wrong type "${_type}". Index: ${i}`)
                }
            } else {
                const _type = typeof dataPoint[key];
                if(_type !== "number") {
                    throw new Error(`feature "${key}" has wrong type "${_type}". Index: ${i}`)
                }
            }
        })
    })
}

export const getDataFromDataPoint = (dataPoint: DataPoint, featureNames: string[]): number[] => {
    return featureNames.map(featureName => (dataPoint[featureName] as number))
}

export const createOneHotEncoding = (dataPoint: DataPoint, labelValues: string[], labelName: string): (0 | 1)[] => {
    const index = labelValues.indexOf(dataPoint[labelName] as string);
    return oneHot(labelValues.length, index)
}

export const createLabelValues = (dataPoints: DataPoint[], labelName: string): string[] => {
    const labelValuesSet: Set<string> = dataPoints.reduce((_labelValuesSet, dataPoint) => {
        return _labelValuesSet.add(dataPoint[labelName] as string)
    }, new Set<string>());

    return Array.from(labelValuesSet).sort();
}

export const humanReadable = (n: number): string => {
    return n.toFixed(3);
}
