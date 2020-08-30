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

let totalHistory: TotalHistory;
const confusionData: {getPredictionFunction?: GetPredictionFunction, classNames?: string[]} = {};

const historyPath = (modelId: string) => `dnnHistory/${modelId}`;
const confusionMatrixPath = (modelId: string) => `dnnConfusionData/${modelId}`;

export const saveVisData = (modelId: string) => {
    saveHistory(modelId);
    saveConfusionMatrix(modelId);
}

const saveHistory = (modelId: string): void => {
    localStorage.setItem(historyPath(modelId), JSON.stringify(totalHistory));
}

const saveConfusionMatrix = async (modelId: string) => {
    const confusionMatrix = await computeCurrentConfusionMatrix();
    localStorage.setItem(confusionMatrixPath(modelId), JSON.stringify(confusionMatrix));
}

const computeCurrentConfusionMatrix = async (): Promise<ConfusionMatrix> => {
    const {expected, predicted} = confusionData.getPredictionFunction();
    return tfvis.metrics.confusionMatrix(expected, predicted);
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

export const renderSavedModels = (bookmarks: Bookmark[], classNames: string[]) => {
    bookmarks.forEach(bookmark => {
        showModelConfiguration(bookmark);
        showSavedHistory(bookmark.modelId, bookmark.name);
        showSavedConfusionMatrix(bookmark.modelId, bookmark.name, classNames);
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
        console.log(await predicted.data());
        console.log(await expected.data());
        const confusionMatrix = await tfvis.metrics.confusionMatrix(expected, predicted);
        showConfusionMatrix(confusionMatrix, classNames, CURRENT_MODEL_TAB_NAME);
    }
}

export const showConfusionMatrix = (confusionMatrix: ConfusionMatrix, classNames: string[], tab: string) => {
    const container = { name: "Confusion Matrix", tab };
    tfvis.render.confusionMatrix(container, { values: confusionMatrix, tickLabels: classNames });
}

resetHistory();