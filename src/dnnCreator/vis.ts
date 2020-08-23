import * as tfvis from "@tensorflow/tfjs-vis";
import { exp, mod } from "@tensorflow/tfjs";

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

const EMPTY_HISTORY = {
    train_loss: [],
    test_loss: []
};

let totalHistory: TotalHistory = EMPTY_HISTORY;

const historyPath = (modelId: string) => `dnnHistory/${modelId}`;

export const saveHistory = (modelId: string): void => {
    localStorage.setItem(historyPath(modelId), JSON.stringify(totalHistory));
}

const historyFromLocalStorage = (modelId: string): TotalHistory | undefined => {
    const historyString = localStorage.getItem(historyPath(modelId));
    if(historyString && historyString.length > 0) {
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
    if(history) {
        showHistory(history, name, name);
    }
}

export const deleteHistory = (modelId: string) => {
    localStorage.removeItem(historyPath(modelId));
}

export const addToHistory = (train_loss: number, test_loss: number) => {
    totalHistory.train_loss.push(train_loss);
    totalHistory.test_loss.push(test_loss);
    if(tfvis.visor().isOpen()) {
        showCurrentHistory();
    }
}

export const resetHistory = () => {
    totalHistory = EMPTY_HISTORY;
}

const showCurrentHistory = () => {
    showHistory(totalHistory, "Performance of current model", "Current");
}

export const showHistory = (history: TotalHistory, name: string, tab: string) => {
    const metrics = ["train_loss", "test_loss"];
    const container = {
        name,
        tab,
        styles: {
            height: '1000px'
        }
    };

    tfvis.show.history(container, {history: history as any}, metrics);
}
