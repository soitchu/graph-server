import { Graph } from "./utils/Graph.js";
import { GraphWindow } from "./utils/GraphWindow.js";
import { DatConfig } from "./utils/config/index.js";
import { Remote } from "./extensions/Examples/Remote/index.js";
const searchParams = new URLSearchParams(location.search);
const SHOULD_ANIMATE = searchParams.get("animate") === "true";
const SPEED = isNaN(parseInt(searchParams.get("speed"))) ? 1000 : parseInt(searchParams.get("speed"));
const ITERATIONS = isNaN(parseInt(searchParams.get("iter"))) ? 500 : parseInt(searchParams.get("iter"));
const WORKERS_NUM = isNaN(parseInt(searchParams.get("workers"))) ? 10 : parseInt(searchParams.get("workers"));
const MAX_SCALE = isNaN(parseInt(searchParams.get("maxscale"))) ? 12325570848799470 : parseInt(searchParams.get("maxscale"));
const DESTINATIONS = [
    [
        -0.9191837649440118,
        -0.28992188819938264
    ],
    [
        -0.7329044610095587,
        -0.19070548985315486
    ],
    [
        -1.624002490256231,
        -0.023712101219515946
    ]
];
if (SHOULD_ANIMATE) {
    document.body.classList.add("animate");
}
let graphInstance2 = new Graph(document.getElementById("canvas2"), window.innerHeight, window.innerWidth, false, {
    x: 1,
    y: 1
});
function resetState() {
    graphInstance2.translate = {
        x: 9.963767658960176,
        y: 8.932518706145014,
        iniX: 0.732160576866839,
        iniY: -0.207958376657112
    };
    graphInstance2.scale = 28.08083793198597;
}
const gw = new GraphWindow({
    height: window.innerHeight,
    width: window.innerWidth,
    x: 0,
    y: 0,
    shouldAnimate: SHOULD_ANIMATE
}, graphInstance2, "Mandelbrot Fractal");
const configGUI = new DatConfig();
const graphConfig = configGUI.processExtensionConfig([
    {
        type: "slider",
        max: 10000,
        min: 0,
        step: 0.0001,
        default: 1,
        id: "scale_y",
        storeInLocalStorage: false,
        onChange: (value)=>{
            const scaledBy = graphInstance2.scaleY / value;
            graphInstance2.scaleY = value;
            graphInstance2.translate.y /= scaledBy;
            graphInstance2.redraw();
        }
    },
    {
        type: "slider",
        max: 5000,
        min: 100,
        step: 1,
        default: ITERATIONS,
        id: "iterations",
        storeInLocalStorage: false
    },
    {
        type: "slider",
        max: 1,
        min: 0,
        step: 1,
        default: 1,
        id: "mode",
        storeInLocalStorage: false
    }
], "Config");
async function remoteRedraw(remoteExt) {
    await remoteExt.redraw();
    remoteExt.ctx.drawImage(remoteExt.tripleBufferCanvas, 0, 0);
}
async function animate(graphInstance, remoteExt) {
    let redrawPromise = new Promise((resolve)=>{
        resolve();
    });
    let REDRAW_THRESHOLD = SPEED;
    let counter = 0;
    let destination = Math.floor(Math.random() * DESTINATIONS.length);
    while(true){
        if (window["break"] === true) break;
        const coord = graphInstance.graphToCanvasCoords(DESTINATIONS[destination][0], DESTINATIONS[destination][1]);
        graphInstance.scaleUp(graphInstance.scale / REDRAW_THRESHOLD, coord[0], coord[1], false);
        if (counter % REDRAW_THRESHOLD === REDRAW_THRESHOLD - 1) {
            await redrawPromise;
            remoteExt.ctx.drawImage(remoteExt.tripleBufferCanvas, 0, 0);
            graphInstance.updateBackCanvas();
            redrawPromise = remoteExt.redraw();
            counter = 0;
        }
        await new Promise((resolve)=>setTimeout(resolve, 10));
        counter++;
        if (graphInstance.scale > MAX_SCALE) {
            resetState();
            destination = Math.floor(Math.random() * DESTINATIONS.length);
            await remoteRedraw(remoteExt);
        }
    }
}
(async function() {
    const remoteExt = new Remote(gw, graphConfig, SHOULD_ANIMATE);
    await remoteExt.ini(WORKERS_NUM);
    graphInstance2.addExtension(remoteExt);
    if (SHOULD_ANIMATE) {
        resetState();
        await remoteRedraw(remoteExt);
        graphInstance2.numberCanvas.style.visibility = "hidden";
        animate(graphInstance2, remoteExt);
    }
})();
console.log(gw);
