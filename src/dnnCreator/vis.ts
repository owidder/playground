import * as tfvis from "@tensorflow/tfjs-vis";
import { Bookmark } from "./bookmarks";
import { GetPredictionFunction } from "./model";

export const initVisor = () => {
    tfvis.visor().toggle();
}

export const toggleVisor = () => {
    tfvis.visor().toggle();
}

export interface TotalHistory {
    train_loss: number[],
    test_loss: number[]
}

let totalHistory: TotalHistory;

const historyPath = (modelId: string) => `dnnHistory/${modelId}`;

export const saveHistory = (modelId: string): void => {
    localStorage.setItem(historyPath(modelId), JSON.stringify(totalHistory));
}

const historyFromLocalStorage = (modelId: string): TotalHistory | undefined => {
    const historyString = localStorage.getItem(historyPath(modelId));
    if (historyString && historyString.length > 0) {
        return JSON.parse(historyString) as TotalHistory;
    }
}

export const loadHistory = (modelId: string): TotalHistory => {
    const _totalHistory = historyFromLocalStorage(modelId);
    totalHistory = _totalHistory ? _totalHistory : totalHistory;
    showCurrentHistory();

    return totalHistory;
}

export const showSavedHistory = (modelId: string, name: string): void => {
    const history = historyFromLocalStorage(modelId);
    if (history) {
        showHistory(history, name, name);
    }
}

export const renderSavedModels = (bookmarks: Bookmark[]) => {
    bookmarks.forEach(bookmark => {
        showSavedHistory(bookmark.modelId, bookmark.name);
        showModelConfiguration(bookmark);
    })

    switchToCurrentHistoryTab();
}

export const deleteHistory = (modelId: string) => {
    localStorage.removeItem(historyPath(modelId));
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

const CURRENT_HISTORY_TAB_NAME = "Current";

const showCurrentHistory = () => {
    showHistory(totalHistory, "Loss", CURRENT_HISTORY_TAB_NAME);
}

export const switchToCurrentHistoryTab = () => {
    tfvis.visor().setActiveTab(CURRENT_HISTORY_TAB_NAME);
}

export const showModelConfiguration = (bookmark: Bookmark) => {
    const headers = ["network shape", "activation functions", "batch size"];
    const values = [
        [bookmark.networkShape, bookmark.activations, bookmark.batchSize],
    ];

    tfvis.render.table({ name: bookmark.name, tab: bookmark.name }, { headers, values });
}

export const showHistory = (history: TotalHistory, name: string, tab: string) => {
    const metrics = ["train_loss", "test_loss"];
    const container = {
        name,
        tab,
    };

    tfvis.show.history(container, { history: history as any }, metrics);
}

export const updateConfusionMatrix = async (getPrediction: GetPredictionFunction, classNames: string[]) => {
    if (tfvis.visor().isOpen()) {
        const { expected, predicted } = getPrediction();
        console.log(await predicted.data());
        console.log(await expected.data());
        const confusionMatrix = await tfvis.metrics.confusionMatrix(expected, predicted);
        const container = { name: "Confusion", tab: CURRENT_HISTORY_TAB_NAME };
        tfvis.render.confusionMatrix(container, { values: confusionMatrix, tickLabels: classNames });
    }
}

resetHistory();