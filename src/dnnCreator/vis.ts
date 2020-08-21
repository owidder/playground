import * as tfvis from "@tensorflow/tfjs-vis";

export const initVisor = () => {
    tfvis.visor().toggle();
}

export const toggleVisor = () => {
    tfvis.visor().toggle();
}

const totalHistory = {
    train_loss: [],
    test_loss: []
};

export const addToHistory = (train_loss: number, test_loss: number) => {
    totalHistory.train_loss.push(train_loss);
    totalHistory.test_loss.push(test_loss);
    if(tfvis.visor().isOpen()) {
        showHistory();
    }
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

    tfvis.show.history(container, {history: totalHistory}, metrics);
}
