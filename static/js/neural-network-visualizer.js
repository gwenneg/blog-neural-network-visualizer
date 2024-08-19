let neurons = [];

function drawNeuralNetwork(parentElement, networkElementId, networkStyle, ...networkDef) {

    let previousNetworkElement = document.getElementById(networkElementId);
    if (previousNetworkElement) {
        previousNetworkElement.remove();
    }

    let networkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    networkSvg.setAttribute("id", networkElementId);
    parentElement.append(networkSvg);

    let layers = [];
    for (let i = 0; i < networkDef.length; i++) {
        let layer = [];
        let top = (Math.max(...networkDef) - networkDef[i]) / 2;
        for (let j = 0; j < networkDef[i]; j++) {
            layer.push({
                cx: networkStyle.neuronRadius + networkStyle.neuronStrokeWidth + i * networkStyle.layerSpacing,
                cy: (top + j) * (networkStyle.neuronRadius * 2 + networkStyle.neuronStrokeWidth * 2 + networkStyle.neuronSpacing) + networkStyle.neuronRadius + networkStyle.neuronStrokeWidth
            });
        }
        layers.push(layer);
    }

    for (let i = 0; i < layers.length; i++) {
        neurons[i] = [];
        for (let j = 0; j < layers[i].length; j++) {

            let neuronSvg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            neuronSvg.setAttribute("cx", layers[i][j].cx);
            neuronSvg.setAttribute("cy", layers[i][j].cy);
            neuronSvg.setAttribute("r", networkStyle.neuronRadius);
            neuronSvg.setAttribute("stroke", networkStyle.color);
            neuronSvg.setAttribute("stroke-width", networkStyle.neuronStrokeWidth);
            neuronSvg.setAttribute("fill", networkStyle.color);
            neuronSvg.setAttribute("fill-opacity", 0)
            networkSvg.append(neuronSvg);

            neurons[i][j] = neuronSvg;

            if (i < layers.length -1) {
                for (let k = 0; k < layers[i + 1].length; k++) {
                    let synapseSvg = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    synapseSvg.setAttribute("x1", layers[i][j].cx + networkStyle.neuronRadius + networkStyle.neuronStrokeWidth) ;
                    synapseSvg.setAttribute("y1", layers[i][j].cy);
                    synapseSvg.setAttribute("x2", layers[i + 1][k].cx - networkStyle.neuronRadius - networkStyle.neuronStrokeWidth);
                    synapseSvg.setAttribute("y2", layers[i + 1][k].cy);
                    synapseSvg.setAttribute("stroke", networkStyle.color);
                    synapseSvg.setAttribute("stroke-width", networkStyle.synapseStrokeWidth);
                    networkSvg.append(synapseSvg);
                }
            }
        }
    }

    networkSvg.setAttribute("width", (networkDef.length - 1) * networkStyle.layerSpacing + (networkStyle.neuronRadius + networkStyle.neuronStrokeWidth) * 2);
    networkSvg.setAttribute("height", Math.max(...networkDef) * (networkStyle.neuronRadius + networkStyle.neuronStrokeWidth) * 2 + (Math.max(...networkDef) - 1) * networkStyle.neuronSpacing);
}

function activateNeurons(activations) {
    for (let i = 0; i < activations.length; i++) {
        let layer = neurons[i];
        let maxLayerActivation = Math.max(...activations[i]);
        for (let j = 0; j < activations[i].length; j++) {
            layer[j].setAttribute("fill-opacity", activations[i][j] / maxLayerActivation);
        }
    }
}
