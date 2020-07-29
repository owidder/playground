import * as d3 from 'd3';
import 'd3-selection-multi';
import { Selection, ContainerElement } from "d3-selection/index";

import { TfNode, TfLink, NodeIterator, ChangeNumberOfNodesCallback, HoverType, DataSource } from "../tf/networkTypes";
import { maxLayerSize } from "../util/mlUtil";
import { AppendingLineChart } from "../linechartV5";

const NODE_SIZE = 30;
const NODE_GAP = 25;
const NODE_OFFSET = 10;
const BIAS_SIZE = 5;

const setNextStepDisabled = (disabled: boolean) => {
    (<HTMLInputElement>document.getElementById("next-step-tf-button")).disabled = disabled;
}

const setResetDisabled = (disabled: boolean) => {
    (<HTMLInputElement>document.getElementById("reset-button")).disabled = disabled;
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
    setResetDisabled(true);
}

export const stepEnded = () => {
    setNextStepDisabled(false);
    setResetDisabled(false);
}

export const playPause = (isPlaying: boolean) => {
    d3.select("#play-pause-button").classed("playing", isPlaying);
}

export const showNumberOfLayers = (numLayers: number): void => {
    let suffix = numLayers !== 1 ? "s" : "";
    d3.select("#layers-label").text("Layer" + suffix);
    d3.select("#num-layers").text(numLayers);
}

const linkWidthScale = d3.scaleLinear()
    .domain([0, 5])
    .range([1, 10])
    .clamp(true);

const colorScale = d3.scaleLinear<string, number>()
    .domain([-1, 0, 1])
    .range(["#f59322", "#e8eaeb", "#0877bd"])
    .clamp(true);

function updateWeightsUI(network: TfNode[][], container: Selection<SVGPathElement, TfLink, HTMLElement, any>, totalEochs: number) {
    for (let layerIdx = 1; layerIdx < network.length; layerIdx++) {
        let currentLayer = network[layerIdx];
        // Update all the nodes in this layer.
        for (let i = 0; i < currentLayer.length; i++) {
            let node = currentLayer[i];
            for (let j = 0; j < node.inputLinks.length; j++) {
                let link = node.inputLinks[j];
                container.select(`#link${link.sourceId}-${link.destId}`)
                    .styles({
                        "stroke-dashoffset": totalEochs / 3,
                        "stroke-width": linkWidthScale(Math.abs(link.weight)),
                        "stroke": colorScale(link.weight)
                    })
                    .datum(link);
            }
        }
    }
}

function updateBiasesUI(nodeIterator: NodeIterator) {
    nodeIterator(true, node => {
        d3.select(`rect#bias-${node.id}`).style("fill", colorScale(node.bias));
    })
}

export const totalEpochsChanged = (totalEpochs: number): void => {
    function zeroPad(n: number): string {
        let pad = "000000";
        return (pad + n).slice(-pad.length);
    }

    function addCommas(s: string): string {
        return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    d3.select("#iter-number").text(addCommas(zeroPad(totalEpochs)));
}

export const updateUI = (firstStep = false, network: TfNode[][], totalEpochs: number, nodeIterator: NodeIterator): void => {
    updateWeightsUI(network, d3.select("g.core"), totalEpochs);
    updateBiasesUI(nodeIterator);
    if (firstStep) {
        totalEpochsChanged(0);
    }
}

function addPlusMinusControl(x: number, layerIdx: number, network: TfNode[][], changeNumberOfNodesCallback: ChangeNumberOfNodesCallback) {
    let div = d3.select("#network").append("div")
        .classed("plus-minus-neurons", true)
        .style("left", `${x - 10}px`);

    let firstRow = div.append("div").attr("class", `ui-numNodes${layerIdx}`);
    firstRow.append("button")
        .attr("class", "mdl-button mdl-js-button mdl-button--icon")
        .on("click", () => {
            changeNumberOfNodesCallback(layerIdx, +1);
        })
        .append("i")
        .attr("class", "material-icons")
        .text("add");

    firstRow.append("button")
        .attr("class", "mdl-button mdl-js-button mdl-button--icon")
        .on("click", () => {
            changeNumberOfNodesCallback(layerIdx, -1);
            // parametersChanged = true;
        })
        .append("i")
        .attr("class", "material-icons")
        .text("remove");

    const numberOfNodes = network[layerIdx].length;
    const suffix = numberOfNodes > 1 ? "s" : "";
    div.append("div").text(
        numberOfNodes + " neuron" + suffix
    );
}

function updateHoverCard(type: HoverType, nodeOrLink?: TfNode | TfLink,
    coordinates?: [number, number]) {
    const hovercard = d3.select("#hovercard");
    if (type == null) {
        hovercard.style("display", "none");
        d3.select("#svg").on("click", null);
        return;
    }

    const value = (type === HoverType.WEIGHT) ?
        (nodeOrLink as TfLink).weight :
        (nodeOrLink as TfNode).bias;
    let name = (type === HoverType.WEIGHT) ? "Weight" : "Bias";
    hovercard.styles({
        "left": `${coordinates[0] + 20}px`,
        "top": `${coordinates[1]}px`,
        "display": "block"
    });
    hovercard.select(".type").text(name);
    hovercard.select(".value")
        .style("display", null)
        .text(value.toPrecision(2));
    hovercard.select("input")
        .property("value", value.toPrecision(2))
        .style("display", "none");
}

function drawNode(cx: number, cy: number, nodeId: string, isInput: boolean,
    container: Selection<ContainerElement, any, HTMLElement, any>, node?: TfNode) {
    let x = cx - NODE_SIZE / 2;
    let y = cy - NODE_SIZE / 2;

    let nodeGroup = container.append("g")
        .attrs({
            "class": "node",
            "id": `node${nodeId}`,
            "transform": `translate(${x},${y})`
        });

    // Draw the main rectangle.
    nodeGroup.append("circle")
        .attrs({
            cx: NODE_SIZE / 2,
            cy: NODE_SIZE / 2,
            r: NODE_SIZE / 2,
        });

    if (node.name) {
        nodeGroup.append("text")
            .text(node.name)
            .attr("y", -7)
    }
 
    if (!isInput) {
        nodeGroup.append("rect")
            .attrs({
                id: `bias-${nodeId}`,
                x: -BIAS_SIZE - 2,
                y: NODE_SIZE - BIAS_SIZE + 3,
                width: BIAS_SIZE,
                height: BIAS_SIZE,
            }).on("mouseenter", function () {
                updateHoverCard(HoverType.BIAS, node, d3.mouse(container.node()));
            }).on("mouseleave", function () {
                updateHoverCard(null);
            });
    }
}

function drawLink(
    input: TfLink, node2coord: { [id: string]: { cx: number, cy: number } },
    network: TfNode[][], container,
    isFirst: boolean, index: number, length: number) {
    let line = container.insert("path", ":first-child");
    let source = node2coord[input.sourceId];
    let dest = node2coord[input.destId];
    let datum = {
        source: {
            y: source.cx + NODE_SIZE / 2 + 2,
            x: source.cy
        },
        target: {
            y: dest.cx - NODE_SIZE / 2,
            x: dest.cy + ((index - (length - 1) / 2) / length) * 12
        }
    };
    //let diagonal = d3.svg.diagonal().projection(d => [d.y, d.x]);
    const diagonal = d => "M" + d.source.y + "," + d.source.x
        + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
        + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
        + " " + d.target.y + "," + d.target.x;
    line.attrs({
        "marker-start": "url(#markerArrow)",
        class: "link",
        id: "link" + input.sourceId + "-" + input.destId,
        d: diagonal(datum)
    });

    container.append("path")
        .attr("d", diagonal(datum))
        .attr("class", "link-hover")
        .on("mouseenter", function () {
            updateHoverCard(HoverType.WEIGHT, input, d3.mouse(this));
        }).on("mouseleave", function () {
            updateHoverCard(null);
        });
    return line;
}

export function drawNetwork(network: TfNode[][], changeNumberOfNodesCallback: ChangeNumberOfNodesCallback): void {
    let svg = d3.select("#svg");
    svg.select("g.core").remove();
    d3.select("#network").selectAll("div.canvas").remove();
    d3.select("#network").selectAll("div.plus-minus-neurons").remove();

    let numLayers = network.length;
    const width = numLayers <= 10 ? window.innerWidth : window.innerWidth * numLayers / 10;
    const height = maxLayerSize(network) * (NODE_SIZE + 25);

    const columnFeatures = d3.select(".column.features");
    columnFeatures.style("height", `${height + 100}px`);
    let padding = 3;

    svg.attr("width", width);
    svg.attr("height", height);

    const node2coord: { [id: string]: { cx: number, cy: number } } = {};
    const container = svg.append("g")
        .classed("core", true)
        .attr("transform", `translate(${padding},${padding})`);

    const featureWidth = 10;
    const layerScale = d3.scalePoint<number>()
        .domain(d3.range(0, numLayers))
        .padding(.7)
        .range([featureWidth, width - NODE_SIZE]);
    const nodeIndexScale = (nodeIndex: number) => nodeIndex * (NODE_SIZE + NODE_GAP) + NODE_OFFSET;


    let calloutWeights = d3.select(".callout.weights").style("display", "none");
    let idWithCallout = null;
    let targetIdWithCallout = null;

    for (let layerIdx = 0; layerIdx < numLayers; layerIdx++) {
        let numNodes = network[layerIdx].length;
        let cx = layerScale(layerIdx) + NODE_SIZE / 2;
        if (layerIdx > 0 && layerIdx < numLayers - 1) {
            addPlusMinusControl(layerScale(layerIdx), layerIdx, network, changeNumberOfNodesCallback);
        }
        for (let i = 0; i < numNodes; i++) {
            let node = network[layerIdx][i];
            let cy = nodeIndexScale(i) + NODE_SIZE / 2;
            node2coord[node.id] = { cx, cy };
            drawNode(cx, cy, node.id, false, container, node);

            for (let j = 0; j < node.inputLinks.length; j++) {
                let link = node.inputLinks[j];
                let path: SVGPathElement = drawLink(link, node2coord, network,
                    container, j === 0, j, node.inputLinks.length).node() as any;
                // Show callout to weights.
                let prevLayer = network[layerIdx - 1];
                let lastNodePrevLayer = prevLayer[prevLayer.length - 1];
                if (targetIdWithCallout == null &&
                    i === numNodes - 1 &&
                    link.sourceId === lastNodePrevLayer.id &&
                    (link.sourceId !== idWithCallout || numLayers <= 5) &&
                    link.destId !== idWithCallout &&
                    prevLayer.length >= numNodes) {
                    let midPoint = path.getPointAtLength(path.getTotalLength() * 0.7);
                    calloutWeights.styles({
                        display: null,
                        top: `${midPoint.y + 5}px`,
                        left: `${midPoint.x + 3}px`
                    });
                    targetIdWithCallout = link.destId;
                }
            }
        }
    }
}

export const makeGUI = (reset: () => void, togglePlayPause: () => void, doModelStep: () => void, addLayer: () => void, removeLayer: () => void, setActivationName: (string) => void) => {
    d3.select("#reset-button").on("click", () => {
        reset();
    });

    d3.select("#play-pause-button").on("click", function () {
        togglePlayPause();
    });

    d3.select("#next-step-tf-button").on("click", () => {
        doModelStep();
    })

    d3.select("#add-layers").on("click", addLayer);

    d3.select("#remove-layers").on("click", removeLayer);

    let activationDropdown = d3.select("#activations").on("change", function () {
        setActivationName((this as any).value);
    });
}

const lineChart = new AppendingLineChart(d3.select("#linechart"), ["#777", "black"]);

function humanReadable(n: number): string {
    return n.toFixed(3);
}

export const appendToLineChart = (trainLoss: number, testLoss: number) => {
    lineChart.addDataPoint([trainLoss, testLoss]);
    d3.select("#loss-train").text(humanReadable(trainLoss));
    d3.select("#loss-test").text(humanReadable(testLoss));
}

export const resetLineChart = () => {
    lineChart.reset();
}

export const showDataSource = (dataSource: DataSource): void => {
    d3.select("#datasource-name").text(dataSource.name);
    d3.select("#datasource-description").text(dataSource.description);
    d3.select("#datasource-source").text(dataSource.source);
    d3.select("#datasource-source").attr("href", dataSource.source);
}
