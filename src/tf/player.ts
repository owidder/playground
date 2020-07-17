import {playPause} from "../ui/ui";

export type OneStepCallback = () => Promise<void>;

export class Player {
    private isPlaying = false;
    private stepIsRunning = false;
    private oneStepCallback: OneStepCallback;

    constructor(oneStepCallback: OneStepCallback) {
        this.oneStepCallback = oneStepCallback;
    }

    public doSteps = async () => {
        this.stepIsRunning = true;
        while(this.isPlaying) {
            await this.oneStepCallback();
        }
        this.stepIsRunning = false;
    }

    public play = () => {
        if(!this.stepIsRunning) {
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
        if(this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
}
