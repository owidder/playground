import * as d3 from 'd3';


export const modelOutdated = () => {
    d3.select("#build-button").classed("outdated", true);
}
