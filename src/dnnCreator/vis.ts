import * as tfvis from "@tensorflow/tfjs-vis";
import { exp } from "@tensorflow/tfjs";

export const initVisor = () => {
    tfvis.visor().toggle();
}

export const toggleVisor = () => {
    tfvis.visor().toggle();
}

export const graphCallbacks = () => {
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
        name: 'show.fitCallbacks',
        tab: 'Training',
        styles: {
            height: '1000px'
        }
    };

    return tfvis.show.fitCallbacks(container, metrics);
}
