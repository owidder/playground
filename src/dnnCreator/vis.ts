import * as tfvis from "@tensorflow/tfjs-vis";
import { Bookmark } from "./bookmarks";
import { GetPredictionFunction } from "./model";
import { exp } from "@tensorflow/tfjs";

export const initVisor = () => {
    tfvis.visor().toggle();
}

export const toggleVisor = () => {
    tfvis.visor().toggle();
}

interface TotalHistory {
    train_loss: number[],
    test_loss: number[]
}

export type ConfusionMatrix = number[][];
export type ClassAccuracy = Array<{count: number, accuracy: number}>;

let totalHistory: TotalHistory;
const confusionData: {getPredictionFunction?: GetPredictionFunction, classNames?: string[]} = {};

const historyPath = (modelId: string) => `dnnHistory/${modelId}`;
const confusionMatrixPath = (modelId: string) => `dnnConfusionMatrix/${modelId}`;
const classAccuracyPath = (modelId: string) => `dnnClassAccuracy/${modelId}`;

export const saveVisData = (modelId: string) => {
    saveHistory(modelId);
    saveConfusionMatrix(modelId);
    saveClassAccuracy(modelId);
}

const saveHistory = (modelId: string): void => {
    localStorage.setItem(historyPath(modelId), JSON.stringify(totalHistory));
}

const saveConfusionMatrix = async (modelId: string) => {
    const {expected, predicted} = confusionData.getPredictionFunction();
    const confusionMatrix = await tfvis.metrics.confusionMatrix(expected, predicted);
    localStorage.setItem(confusionMatrixPath(modelId), JSON.stringify(confusionMatrix));
}

const saveClassAccuracy = async (modelId: string) => {
    const {expected, predicted} = confusionData.getPredictionFunction();
    const classAccuracy = await tfvis.metrics.perClassAccuracy(expected, predicted);
    localStorage.setItem(classAccuracyPath(modelId), JSON.stringify(classAccuracy));
}

const historyFromLocalStorage = (modelId: string): TotalHistory | undefined => {
    const historyString = localStorage.getItem(historyPath(modelId));
    if (historyString && historyString.length > 0) {
        return JSON.parse(historyString) as TotalHistory;
    }
}

const confusionMatrixFromLocalStorage = (modelId: string): ConfusionMatrix | undefined => {
     const confusionMatrixString = localStorage.getItem(confusionMatrixPath(modelId));
     if(confusionMatrixString && confusionMatrixString.length > 0) {
         return JSON.parse(confusionMatrixString);
     }
}

const classAccuracyFromLocalStorage = (modelId: string): ClassAccuracy | undefined => {
     const classAccuracyString = localStorage.getItem(classAccuracyPath(modelId));
     if(classAccuracyString && classAccuracyString.length > 0) {
         return JSON.parse(classAccuracyString);
     }
}

export const loadHistory = (modelId: string): TotalHistory => {
    const _totalHistory = historyFromLocalStorage(modelId);
    totalHistory = _totalHistory ? _totalHistory : totalHistory;
    showCurrentHistory();

    return totalHistory;
}

export const loadConfusionMatrix = (modelId: string, classNames: string[]) => {
    const confusionMatrix = confusionMatrixFromLocalStorage(modelId);
    if(confusionMatrix) {
        showConfusionMatrix(confusionMatrix, classNames, CURRENT_MODEL_TAB_NAME)
    }
}

export const loadClassAccuracy = (modelId: string, classNames: string[]) => {
    const classAccuracy = classAccuracyFromLocalStorage(modelId);
    if(classAccuracy) {
        showClassAccuracy(classAccuracy, classNames, CURRENT_MODEL_TAB_NAME)
    }
}

export const showSavedHistory = (modelId: string, name: string): void => {
    const history = historyFromLocalStorage(modelId);
    if (history) {
        showHistory(history, "Loss", name);
    }
}

export const showSavedConfusionMatrix = (modelId: string, name: string, classNames: string[]) => {
    const confusionMatrix = confusionMatrixFromLocalStorage(modelId);
    if(confusionMatrix) {
        showConfusionMatrix(confusionMatrix, classNames, name);
    }
}

export const showSavedClassAccuracy = (modelId: string, name: string, classNames: string[]) => {
    const classAccuracy = classAccuracyFromLocalStorage(modelId);
    if(classAccuracy) {
        showClassAccuracy(classAccuracy, classNames, name);
    }
}

export const renderSavedModels = (bookmarks: Bookmark[], classNames: string[]) => {
    bookmarks.forEach(bookmark => {
        showModelConfiguration(bookmark);
        showSavedHistory(bookmark.modelId, bookmark.name);
        showSavedConfusionMatrix(bookmark.modelId, bookmark.name, classNames);
        showSavedClassAccuracy(bookmark.modelId, bookmark.name, classNames);
    })

    switchToCurrentHistoryTab();
}

export const deleteVisData = (modelId: string) => {
    localStorage.removeItem(historyPath(modelId));
    localStorage.removeItem(confusionMatrixPath(modelId));
}

export const addToHistory = (train_loss: number, test_loss: number) => {
    totalHistory.train_loss.push(train_loss);
    totalHistory.test_loss.push(test_loss);
    if (tfvis.visor().isOpen()) {
        showCurrentHistory();
    }
}

export const resetHistory = () => {
    totalHistory = {
        test_loss: [],
        train_loss: []
    };
}

const CURRENT_MODEL_TAB_NAME = "Current";

const showCurrentHistory = () => {
    showHistory(totalHistory, "Loss", CURRENT_MODEL_TAB_NAME);
}

export const switchToCurrentHistoryTab = () => {
    tfvis.visor().setActiveTab(CURRENT_MODEL_TAB_NAME);
}

export const showModelConfiguration = (bookmark: Bookmark) => {
    const headers = ["network shape", "activation functions", "batch size", "number of epochs"];
    const values = [
        [bookmark.networkShape, bookmark.activations, bookmark.batchSize, bookmark.epochCount],
    ];

    tfvis.render.table({ name: "Configuration", tab: bookmark.name }, { headers, values });
}

export const showHistory = (history: TotalHistory, name: string, tab: string) => {
    const metrics = ["train_loss", "test_loss"];
    const container = {
        name,
        tab,
    };

    tfvis.show.history(container, { history: history as any }, metrics);
}

export const updateConfusionMatrix = async (getPredictionFunction: GetPredictionFunction, classNames: string[]) => {
    confusionData.getPredictionFunction = getPredictionFunction;
    confusionData.classNames = classNames;
    if (tfvis.visor().isOpen()) {
        const { expected, predicted } = getPredictionFunction();
        const confusionMatrix = await tfvis.metrics.confusionMatrix(expected, predicted);
        showConfusionMatrix(confusionMatrix, classNames, CURRENT_MODEL_TAB_NAME);
    }
}

export const updateClassAccuracy = async (getPredictionFunction: GetPredictionFunction, classNames: string[]) => {
    confusionData.getPredictionFunction = getPredictionFunction;
    confusionData.classNames = classNames;
    if (tfvis.visor().isOpen()) {
        const { expected, predicted } = getPredictionFunction();
        const classAccuracy = await tfvis.metrics.perClassAccuracy(expected, predicted);
        showClassAccuracy(classAccuracy, classNames, CURRENT_MODEL_TAB_NAME);
    }
}

export const showConfusionMatrix = (confusionMatrix: ConfusionMatrix, classNames: string[], tab: string) => {
    const container = { name: "Confusion Matrix", tab };
    tfvis.render.confusionMatrix(container, { values: confusionMatrix, tickLabels: classNames });
}

export const showClassAccuracy = (classAccuracy: ClassAccuracy, classNames: string[], tab: string) => {
    const container = { name: "Class Accuracy", tab };
    tfvis.show.perClassAccuracy(container, classAccuracy, classNames);
}

resetHistory();