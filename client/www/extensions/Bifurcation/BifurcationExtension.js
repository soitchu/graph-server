import { GraphExtension } from "../../utils/GraphExtension.js";
let xScaling = 0.00025;
let yScaling = 0.0036;
export const config = {
    theta1: 1,
    theta2: 0.6,
    animation: {
        start: 0,
        end: 0,
        step: 0.001,
        ini: ()=>{}
    },
    drawLyapunov: false,
    drawBoundaries: false,
    fontSize: 20,
    chaoticAttractor: {
        startModel: 10000,
        endModel: 30033,
        initialVals: {
            x: 0.00001,
            y: 0.00001
        },
        cVals: {
            x: 13,
            y: 1
        },
        drawLyapLines: false
    }
};
export class BifurcationExtension extends GraphExtension {
    workers = Array(navigator.hardwareConcurrency * 2);
    currentResponses = 0;
    responseId = 0;
    sharedMemory;
    constructor(window1){
        super(window1);
        const height = window1.graphInstance.canvas.height;
        const width = window1.graphInstance.canvas.width;
        this.sharedMemory = new SharedArrayBuffer(width * height * 4);
        for(let i = 0; i < this.workers.length; i++){
            if (!(this.workers[i] instanceof Worker)) {
                this.workers[i] = new Worker("./extensions/Bifurcation/worker.js");
            }
        }
    }
    async resizeCallback(width, height) {
        this.sharedMemory = new SharedArrayBuffer(this.canvas.width * this.canvas.height * 4);
    }
    drawPoint(x, y) {}
    async redraw() {
        return new Promise((resolve, reject)=>{
            const graph = this.window.graphInstance;
            const self = this;
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            let x = -graph.translate.x + graph.canvas.width / graph.scale * (0 / graph.elementary);
            let xFin = -graph.translate.x + graph.canvas.width / graph.scale;
            let countRes = 0;
            let workLen = this.workers.length;
            self.currentResponses++;
            const newImageMain = this.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            // const imageDataLength = imageDataArray.length;
            // Takes about 0.1ms - 0.2ms, but there's probably a
            // better way to do this, since the GC will have to
            // take care of it
            this.sharedMemory = new SharedArrayBuffer(this.canvas.width * this.canvas.height * 4);
            const imageDataArray = this.sharedMemory;
            for(let iu = 0; iu < this.workers.length; iu++){
                this.workers[iu].onmessage = function(e) {
                    if (e.data[1] == self.currentResponses) {
                        countRes++;
                        if (countRes == workLen) {
                            newImageMain.data.set(new Uint8Array(imageDataArray));
                            self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                            self.ctx.putImageData(newImageMain, 0, 0);
                        }
                    }
                };
            }
            this.responseId++;
            for(var i = 0; i < this.workers.length; i++){
                var _window_noiseEnd;
                this.workers[i].postMessage([
                    x + i / this.workers.length * (xFin - x),
                    x + (i + 1) / this.workers.length * (xFin - x),
                    this.responseId,
                    Math.floor(config.chaoticAttractor.endModel),
                    config.theta1,
                    config.theta2,
                    this.canvas.width / graph.scale * (1 / graph.elementary),
                    (_window_noiseEnd = window["noiseEnd"]) !== null && _window_noiseEnd !== void 0 ? _window_noiseEnd : 100,
                    config.chaoticAttractor.cVals,
                    config.chaoticAttractor.initialVals,
                    xScaling !== null && xScaling !== void 0 ? xScaling : 1,
                    graph.drawY,
                    yScaling !== null && yScaling !== void 0 ? yScaling : 1,
                    graph.translate,
                    graph.scale,
                    i,
                    imageDataArray,
                    this.canvas.width,
                    this.canvas.height
                ]);
            }
        });
    }
}
