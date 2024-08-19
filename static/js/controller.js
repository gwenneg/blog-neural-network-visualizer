const WS = new WebSocket("ws://localhost:8080/neural-network-visualizer");

WS.onopen = () => {
    init();
}

WS.onmessage = (message) => {
    let data = JSON.parse(message.data);
    switch (data.command) {
        case "network-def":
            draw(data.payload);
            break;
        case "activations":
            activateNeurons(data.payload);
            break;
        default:
            console.warn("Unexpected command: " + data.command);
            break;
    }
}

function send(data) {
    WS.send(JSON.stringify(data));
}

function init() {
    let networkDef = document.getElementById("network-def").value.split(",");
    for (let i in networkDef) {
        networkDef[i] = parseInt(networkDef[i], 10);
    }
    send({
        "command": "init",
        "payload": networkDef
    });
}

function draw(networkDef) {
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

function onDocumentReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

onDocumentReady(() => {

    [].forEach.call(document.getElementsByClassName("valid-number"), elem => {
        elem.oninput = () => {
            return elem.validity.valid || (elem.value = "");
        };
    });

    document.getElementById("apply").onclick = () => {
        init();
    };

    let start = document.getElementById("start");
    let stop = document.getElementById("stop");

    start.onclick = () => {
        send({
            "command": "start"
        });
        start.disabled = true;
        stop.disabled = false;
    };

    stop.onclick = () => {
        send({
            "command": "stop"
        });
        start.disabled = false;
        stop.disabled = true;
    };

});
