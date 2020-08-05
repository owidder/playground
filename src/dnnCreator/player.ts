import { playPause } from "./ui";
import { thresholdScott } from "d3";

export type OneStepCallback = () => Promise<void>;
export type StoppedCallback = () => void;
export type StartedCallback = () => void;

export class Player {
    private isPlaying = false;
    private stepIsRunning = false;
    private oneStepCallback: OneStepCallback;
    private stoppedCallback: StoppedCallback;
    private startedCallback: StartedCallback;

    constructor(oneStepCallback: OneStepCallback, startedCallback: StartedCallback, stoppedCallback: StoppedCallback) {
        this.oneStepCallback = oneStepCallback;
        this.startedCallback = startedCallback;
        this.stoppedCallback = stoppedCallback;
    }

    public doSteps = () => {
        this.startedCallback();
        setTimeout(async () => {
            this.stepIsRunning = true;
            while (this.isPlaying) {
                await this.oneStepCallback();
            }
            this.stepIsRunning = false;
            this.stoppedCallback();
            }, 100)
    }

    public play = () => {
        if (!this.stepIsRunning) {
            playPause(true);
            this.isPlaying = true;
            this.doSteps();
        }
    }

    public pause = () => {
        playPause(false);
        this.isPlaying = false;
    }

    public togglePlayPause = () => {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
}
