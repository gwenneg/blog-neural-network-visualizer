const WS = new WebSocket("ws://localhost:8080/neural-network-visualizer");

WS.onmessage = (message) => {
    const data = JSON.parse(message.data);
    switch (data.command) {
        case "network-def":
            init(data.payload);
            break;
        case "activations":
            activateNeurons(data.payload);
            break;
        default:
            console.warn("Unexpected command: " + data.command);
            break;
    }
}

function init(networkDef) {
    let parentElement = document.getElementById("neural-network");
    let networkStyle = {
        color: document.getElementById("color").value,
        layerSpacing: Number(document.getElementById("layer-spacing").value),
        neuronRadius: Number(document.getElementById("neuron-radius").value),
        neuronSpacing: Number(document.getElementById("neuron-spacing").value),
        neuronStrokeWidth: Number(document.getElementById("neuron-stroke-width").value),
        synapseStrokeWidth: Number(document.getElementById("synapse-stroke-width").value),
    }
    drawNeuralNetwork(parentElement, "svg", networkStyle, ...networkDef);
}

function send(data) {
    WS.send(JSON.stringify(data));
}

function onDocumentReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

onDocumentReady(() => {

    document.getElementById("init").onclick = () => {
        let networkDef = document.getElementById("network-def").value.split(",");
        for (let i in networkDef) {
            networkDef[i] = parseInt(networkDef[i], 10);
        }
        send({
            "command": "init",
            "payload": networkDef
        });
    };

    document.getElementById("start").onclick = () => {
        send({
            "command": "start"
        });
    };

    document.getElementById("stop").onclick = () => {
        send({
            "command": "stop"
        });
    };

});
