import * as tfvis from "@tensorflow/tfjs-vis";

interface Historyish {[key: string]: number[]}

export const initVisor = () => {
    tfvis.visor().toggle();
}

export const toggleVisor = () => {
    tfvis.visor().toggle();
}

const totalHistory: Historyish = {
    loss: [],
    acc: []
};

export const addToHistory = (loss: number, acc: number) => {
    totalHistory.loss.push(loss);
    totalHistory.acc.push(acc);
    showHistory();
}

export const showHistory = () => {
    const metrics = ["loss", "acc"];
    const container = {
        name: 'show.history',
        tab: 'History',
        styles: {
            height: '1000px'
        }
    };

    tfvis.show.history(container, {history: totalHistory}, metrics);
}
