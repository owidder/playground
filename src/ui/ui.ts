import * as d3 from 'd3';

const setNextStepDisabled = (disabled: boolean) => {
    (<HTMLInputElement> document.getElementById("next-step-tf-button")).disabled = disabled;
}

export const modelOutdated = () => {
    d3.select("#build-button").classed("outdated", true);
    setNextStepDisabled(true);
}

export const modelCurrent = () => {
    d3.select("#build-button").classed("outdated", false);
    setNextStepDisabled(false);
}

export const stepStarted = () => {
    setNextStepDisabled(true);
}

export const stepEnded = () => {
    setNextStepDisabled(false);
}

export const playPause = (isPlaying: boolean) => {
    d3.select("#play-pause-button").classed("playing", isPlaying);
}