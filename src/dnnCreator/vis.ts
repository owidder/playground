import * as tfvis from "@tensorflow/tfjs-vis";
import { exp } from "@tensorflow/tfjs";

export const initVisor = () => {
    tfvis.visor().toggle();
}

export const toggleVisor = () => {
    tfvis.visor().toggle();
}
