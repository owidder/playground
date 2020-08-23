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

export const loadHistory = (modelId: string): TotalHistory => {
    const historyString = localStorage.getItem(historyPath(modelId));
    if(historyString && historyString.length > 0) {
        totalHistory = JSON.parse(historyString) as TotalHistory;
        showHistory();
    }

    return totalHistory;
}

export const deleteHistory = (modelId: string) => {
    localStorage.removeItem(historyPath(modelId));
}

export const addToHistory = (train_loss: number, test_loss: number) => {
    totalHistory.train_loss.push(train_loss);
    totalHistory.test_loss.push(test_loss);
    if(tfvis.visor().isOpen()) {
        showHistory();
    }
}

export const resetHistory = () => {
    totalHistory = EMPTY_HISTORY;
}

export const showHistory = () => {
    const metrics = ["train_loss", "test_loss"];
    const container = {
        name: 'show.history',
        tab: 'History',
        styles: {
            height: '1000px'
        }
    };

    tfvis.show.history(container, {history: totalHistory as any}, metrics);
}
