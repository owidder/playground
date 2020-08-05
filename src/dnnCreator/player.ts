/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import { playPause } from "./ui";

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
