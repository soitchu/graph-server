import { drawGraphX } from "./helper.js";
// TODO:
// drawLyapunovLinear
// drawPoints
// drawLines
// drawGraphX
// drawGraphY
const config = {
    fontSize: 14
};
export class Graph {
    events = {
        resize: undefined,
        mouseMove: undefined,
        mouseDown: undefined,
        mouseUp: undefined
    };
    toDrawGraphs = {
        drawGraphX: [],
        drawLines: [],
        drawPoints: []
    };
    frontCanvas;
    frontCtx;
    backCanvas;
    backCanvasCtx;
    numberCanvas;
    numberCtx;
    tmpCanvas;
    tmpCanvasCtx;
    width = 0;
    height = 0;
    scaleTimeout;
    state = {
        isUsingBackCanvas: false,
        mouseDown: false,
        graph: {
            topLeft: [
                0,
                0
            ],
            bottomRight: [
                0,
                0
            ]
        },
        mouseDownCoords: {
            x: 0,
            y: 0
        },
        scale: 1
    };
    translate = {
        x: 0,
        y: 0,
        iniX: 0,
        iniY: 0
    };
    scaleY = 1;
    scale = 1;
    extensions = [];
    xAxisNums = [];
    yAxisNums = [];
    coordinatesScale = {
        x: 1,
        y: 1
    };
    constructor(canvas, height, width, drawY = false, coordinatesScale){
        if (coordinatesScale) {
            this.coordinatesScale = coordinatesScale;
        }
        // ==== Initial config ====
        this.translate.y = canvas.height;
        // this.translate.y = canvas.height;
        this.translate = {
            x: 8.694642254475363,
            y: 7.518380690759843,
            iniX: 8.694642254475363,
            iniY: 7.518380690759843
        };
        this.scale = 65.38137025898745;
        // ========================
        this.frontCanvas = canvas;
        this.height = height;
        this.width = width;
        this.frontCanvas.height = height;
        this.frontCanvas.width = width;
        this.frontCtx = canvas.getContext("2d");
        this.frontCtx.imageSmoothingEnabled = false;
        this.frontCtx.lineWidth = 2;
        this.backCanvas = new OffscreenCanvas(width, height);
        this.backCanvasCtx = this.backCanvas.getContext("2d", {
            willReadFrequently: true
        });
        this.tmpCanvas = new OffscreenCanvas(width, height);
        this.tmpCanvasCtx = this.tmpCanvas.getContext("2d", {
            willReadFrequently: true
        });
        this.numberCanvas = document.createElement("canvas");
        this.numberCtx = this.numberCanvas.getContext("2d", {
            willReadFrequently: true
        });
        this.numberCanvas.style.zIndex = "-1";
        this.frontCanvas.addEventListener("mousedown", (event)=>{
            this.down(event);
        });
        this.frontCanvas.addEventListener("wheel", (event)=>{
            this.mouseWheelEvent(event);
        });
        this.frontCanvas.addEventListener("mousemove", (event)=>{
            this.move(event);
        }, {
            passive: true
        });
        this.frontCanvas.addEventListener("mouseup", (event)=>{
            this.up(event);
        });
    }
    on(event, func) {
        this.events[event] = func;
    }
    resize(width, height) {
        // resizing all the extensions that are attached to this
        for (const ext of this.extensions){
            ext.resize(width, height);
        }
        this.frontCanvas.height = height;
        this.frontCanvas.width = width;
        this.numberCanvas.height = height;
        this.numberCanvas.width = width;
        this.backCanvas = new OffscreenCanvas(width, height);
        this.backCanvasCtx = this.backCanvas.getContext("2d", {
            willReadFrequently: true
        });
        this.tmpCanvas = new OffscreenCanvas(width, height);
        this.tmpCanvasCtx = this.tmpCanvas.getContext("2d", {
            willReadFrequently: true
        });
        this.frontCtx.imageSmoothingEnabled = false;
        this.height = height;
        this.width = width;
        this.redraw();
        if (this.events.resize) {
            this.events.resize(width, height);
        }
    }
    drawGridAndNums() {
        this.numberCtx.lineWidth = 2;
        this.numberCtx.strokeStyle = "#000000ff";
        this.numberCtx.clearRect(0, 0, this.frontCanvas.width, this.frontCanvas.height);
        this.drawGrid();
        this.drawNums();
    }
    redraw(extensionsOnly = false) {
        this.frontCtx.clearRect(0, 0, this.width, this.height);
        this.drawGridAndNums();
        if (extensionsOnly) {
            this.frontCtx.clearRect(0, 0, this.frontCanvas.width, this.frontCanvas.height);
        }
        for (const ext of this.extensions){
            if (!ext.locked) {
                ext.redraw();
            // console.log(ext.isRedrawing);
            //     if (!ext.isRedrawing) {
            //         ext.isRedrawing = true;
            //         ext.redraw().then(() => {
            //             ext.dontRedraw = false;
            //             ext.postRedraw();
            //             ext.isRedrawing = false;
            //         });
            //     } else {
            //         ext.redraw();
            //     }
            }
        }
        this.drawGraphX();
        this.drawLines();
        this.drawPoints();
        this.state.isUsingBackCanvas = false;
    }
    drawLines() {
        const graphConfig = this.toDrawGraphs.drawLines;
        const ctx = this.frontCtx;
        ctx.beginPath();
        // for (let i = 0; i < graphConfig.length; i++) {
        //     const coords = graphConfig[i];
        //     const fromCoords = this.graphToCanvasCoords(coords.from.x, coords.from.y);
        //     const toCoords = this.graphToCanvasCoords(coords.to.x, coords.to.y);
        //     ctx.moveTo(fromCoords[0], fromCoords[1]);
        //     ctx.lineTo(toCoords[0], toCoords[1]);
        // }
        ctx.stroke();
    }
    drawPoints() {
        const scale = this.scale;
        const scaleY = this.scaleY;
        const height = this.height;
        const width = this.width;
        const offsets = [
            -width * 4 - 4,
            -width * 4,
            -width * 4 + 4,
            -4,
            0,
            4,
            width * 4 - 4,
            width * 4,
            width * 4 + 4
        ];
        const strengths = [
            11,
            22,
            11,
            22,
            22,
            22,
            11,
            22,
            11
        ];
        // This is way faster than drawing the rectangles manually
        // using .fillRect or .rect
        const imageData = new ImageData(width, height);
        const imageDataArray = imageData.data;
        const imageDataLength = imageDataArray.length;
        const translateX = this.translate.x * scale;
        const translateY = this.translate.y * scale;
        const points = this.toDrawGraphs.drawPoints;
        for(let i = 0; i < points.length; i++){
            let iniX = points[i].coords.x * scale + translateX;
            let iniY = -points[i].coords.y * scale * scaleY + translateY;
            iniX = iniX | iniX;
            iniY = iniY | iniY;
            if (iniX >= width - 1 || iniX < 0) {
                continue;
            }
            const start = iniY * (width * 4) + iniX * 4;
            for(let i = 0; i < 9; i++){
                const offset = offsets[i] + start;
                if (offset < imageDataLength && offset >= 0) {
                    imageDataArray[offset] = 0;
                    imageDataArray[offset + 1] = 0;
                    imageDataArray[offset + 2] = 0;
                    imageDataArray[offset + 3] = 255;
                //   imageDataArray[offset + 3] += strengths[i];
                }
            }
        }
        this.tmpCanvasCtx.putImageData(imageData, 0, 0);
        this.frontCtx.drawImage(this.tmpCanvas, 0, 0);
    }
    drawGraphX() {
        const graphConfig = this.toDrawGraphs.drawGraphX;
        for(let i = 0; i < graphConfig.length; i++){
            const currentGraphconfig = graphConfig[i];
            const lineData = new Float64Array(this.width * 4 * 8);
            const height = this.height;
            let lastYCoord = undefined;
            let lastXCoord = undefined;
            for(let i = 0; i < this.width; i += 1){
                const xCoords = this.canvasToGraphCoords(i, 0)[0];
                const yCoords = currentGraphconfig.xFunc(xCoords) * this.scaleY;
                let iniX = (xCoords + this.translate.x) * this.scale;
                if (!currentGraphconfig.constraintsX(xCoords)) {
                    continue;
                }
                let iniY = (-yCoords + this.translate.y) * this.scale;
                if (isNaN(iniY)) {
                    continue;
                }
                const offset = i * 4;
                if (lastYCoord !== undefined && (iniY >= 0 || lastYCoord >= 0) && (iniY <= height || lastYCoord <= height)) {
                    lineData[offset] = lastXCoord;
                    lineData[offset + 1] = lastYCoord;
                    lineData[offset + 2] = iniX;
                    lineData[offset + 3] = iniY;
                } else {
                    lastYCoord = undefined;
                }
                lastYCoord = iniY;
                lastXCoord = iniX;
            }
            drawGraphX(this.frontCanvas, this.frontCtx, lineData);
        }
    }
    addGraph(config) {
        switch(config.type){
            case "drawGraphX":
                this.toDrawGraphs.drawGraphX.push(config);
                break;
            case "drawLines":
                this.toDrawGraphs.drawLines.push(config);
                break;
            case "drawPoints":
                this.toDrawGraphs.drawPoints.push(config);
                break;
        }
    }
    canvasToGraphCoords(x, y) {
        return [
            x / this.scale - this.translate.x,
            -y / this.scale + this.translate.y
        ];
    }
    graphToCanvasCoords(x, y) {
        return [
            (x + this.translate.x) * this.scale,
            (-y + this.translate.y) * this.scale
        ];
    }
    canvasToGraphCoordsScaled(x, y) {
        return [
            x / this.scale - this.translate.x,
            (-y / this.scale + this.translate.y) / this.scaleY
        ];
    }
    graphToCanvasCoordsScaled(x, y) {
        return [
            (x + this.translate.x) * this.scale,
            (-y * this.scaleY + this.translate.y) * this.scale
        ];
    }
    scaleUp(inc, x = 0, y = 0, shouldRedraw = true) {
        if (!this.state.isUsingBackCanvas) {
            this.updateBackCanvas();
        }
        clearTimeout(this.scaleTimeout);
        this.scale += inc;
        let scale = this.scale;
        this.translate.x -= (x * scale / (scale - inc) - x) / scale;
        this.translate.y -= (y * scale / (scale - inc) - y) / scale;
        const start = this.state.graph.topLeft;
        const end = this.state.graph.bottomRight;
        const startCoords = this.graphToCanvasCoords(start[0], start[1]);
        const endCoords = this.graphToCanvasCoords(end[0], end[1]);
        // Updating the front canvas
        this.frontCtx.clearRect(0, 0, this.frontCanvas.width, this.frontCanvas.height);
        this.frontCtx.drawImage(this.backCanvas, startCoords[0], startCoords[1], Math.abs(endCoords[0] - startCoords[0]), Math.abs(endCoords[1] - startCoords[1]));
        // Updating the front canvases of all
        // the extensions
        for (const ext of this.extensions){
            if (ext.hasIndependentCanvas) {
                if (ext.isRedrawing) {
                    ext.dontRedraw = true;
                }
                ext.ctx.clearRect(0, 0, this.frontCanvas.width, this.frontCanvas.height);
                ext.ctx.drawImage(ext.doubleBufferCanvas, startCoords[0], startCoords[1], Math.abs(endCoords[0] - startCoords[0]), Math.abs(endCoords[1] - startCoords[1]));
            }
        }
        // Draw the grid
        this.drawGridAndNums();
        const self = this;
        if (shouldRedraw) {
            this.scaleTimeout = setTimeout(function() {
                self.redraw();
            }, 500);
        }
        this.state.isUsingBackCanvas = true;
    }
    imageDataToBlob(imageData) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        return new Promise((resolve)=>{
            canvas.toBlob(resolve);
        });
    }
    addExtension(ext) {
        this.extensions.push(ext);
    }
    getMass() {
        console.log(this);
        const imageData = this.frontCtx.getImageData(0, 0, this.frontCanvas.width, this.frontCanvas.height).data;
        let count = 0;
        for(let i = 0; i <= imageData.length - 4; i += 4){
            if (imageData[i] == 0 && imageData[i + 1] == 0 && imageData[i + 2] == 0 && imageData[i + 3] == 255) {
                count += 1;
            }
        }
        return count;
    }
    drawNums() {
        let xAxisNums = this.xAxisNums;
        let yAxisNums = this.yAxisNums;
        let ctx = this.numberCtx;
        ctx.font = `${config.fontSize}px Arial`;
        const decimalPlaces = Math.ceil(Math.abs(Math.log10(Math.abs(xAxisNums[1][0] - xAxisNums[0][0]))));
        // TODO refactor
        for(var i = 0; i < xAxisNums.length; i++){
            let val = -xAxisNums[i][0] / this.coordinatesScale.x;
            if (Math.abs(val) >= 10000) {
                val = Math.floor(val).toExponential();
            } else if (Math.abs(val) > 10) {
                val = Math.floor(val * 10e8) / 10e8;
            } else {
                val = val.toFixed(decimalPlaces);
            }
            let yL = this.translate.y * this.scale + config.fontSize;
            if (yL < config.fontSize) {
                yL = config.fontSize;
            } else if (yL > this.frontCanvas.height) {
                yL = this.frontCanvas.height;
            }
            ctx.fillText(val.toString(), xAxisNums[i][1], yL);
        }
        for(var i = 0; i < yAxisNums.length; i++){
            let val = yAxisNums[i][0] / this.scaleY;
            if (Math.abs(val) >= 10000) {
                val = Math.floor(val).toExponential();
            } else if (Math.abs(val) > 10) {
                val = Math.floor(val * 10e8) / 10e8;
            } else {
                val = val.toFixed(decimalPlaces);
            }
            let textWidth = ctx.measureText(val).width;
            let xL = this.translate.x * this.scale - textWidth - 5;
            if (xL < config.fontSize) {
                xL = 0;
            } else if (xL > this.frontCanvas.width - textWidth) {
                xL = this.frontCanvas.width - textWidth;
            }
            ctx.fillStyle = "black";
            ctx.fillText(val.toString(), xL, yAxisNums[i][1]);
        }
    }
    drawGrid() {
        // Since we are working with numberCanvas
        const ctx = this.numberCtx;
        const lineWidth = ctx.lineWidth;
        this.xAxisNums = [];
        this.yAxisNums = [];
        // Drawing the axes
        ctx.beginPath();
        ctx.moveTo(this.translate.x * this.scale, 0);
        ctx.lineTo(this.translate.x * this.scale, this.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, this.translate.y * this.scale);
        ctx.lineTo(this.width, this.translate.y * this.scale);
        ctx.stroke();
        // Number of partitions there should be ideally
        const partitionsIdeally = 4 + Math.ceil(this.width * this.scale) % 5;
        const distanceUnrounded = this.width / Math.floor(partitionsIdeally) / this.scale;
        const distanceRounded = Math.pow(10, Math.floor(Math.log10(distanceUnrounded)));
        const distanceInCanvasCoords = Math.floor(distanceUnrounded / distanceRounded) * distanceRounded;
        const distanceInGraphCoords = distanceInCanvasCoords * this.scale;
        const partitions = [
            this.width / distanceInGraphCoords + 1,
            this.height / distanceInGraphCoords + 1
        ];
        const graphOrigin = [
            this.translate.x * this.scale,
            this.translate.y * this.scale
        ];
        const canvasOrigin = [
            this.translate.x,
            this.translate.y
        ];
        // Canvas coords where the grid starts
        const graphRoundedStart = [
            Math.floor(graphOrigin[0] / distanceInGraphCoords) * distanceInGraphCoords,
            Math.floor(graphOrigin[1] / distanceInGraphCoords) * distanceInGraphCoords
        ];
        const canvasRoundedStart = [
            Math.floor(canvasOrigin[0] / distanceInCanvasCoords) * distanceInCanvasCoords,
            Math.floor(canvasOrigin[1] / distanceInCanvasCoords) * distanceInCanvasCoords
        ];
        const canvasCoords = [
            graphOrigin[0] - graphRoundedStart[0] - distanceInGraphCoords,
            graphOrigin[1] - graphRoundedStart[1] - distanceInGraphCoords
        ];
        const graphCoords = [
            canvasRoundedStart[0] + distanceInCanvasCoords,
            canvasRoundedStart[1] + distanceInCanvasCoords
        ];
        for(let k = 0; k <= 1; k++){
            const isX = k === 0;
            for(var i = 0; i <= partitions[k]; i++){
                for(var j = 1; j < 4; j++){
                    ctx.strokeStyle = "#B2BEB5";
                    ctx.lineWidth = lineWidth / 6;
                    ctx.beginPath();
                    if (isX) {
                        ctx.moveTo(canvasCoords[k] + distanceInGraphCoords / 4 * j, 0);
                        ctx.lineTo(canvasCoords[k] + distanceInGraphCoords / 4 * j, this.frontCanvas.height);
                    } else {
                        ctx.moveTo(0, canvasCoords[k] + distanceInGraphCoords / 4 * j);
                        ctx.lineTo(this.width, canvasCoords[k] + distanceInGraphCoords / 4 * j);
                    }
                    ctx.stroke();
                }
                ctx.strokeStyle = "#808080";
                ctx.lineWidth = lineWidth / 2;
                ctx.beginPath();
                if (isX) {
                    ctx.moveTo(canvasCoords[k], 0);
                    ctx.lineTo(canvasCoords[k], this.frontCanvas.height);
                } else {
                    ctx.moveTo(0, canvasCoords[k]);
                    ctx.lineTo(this.width, canvasCoords[k]);
                }
                ctx.stroke();
                const numArray = isX ? this.xAxisNums : this.yAxisNums;
                numArray.push([
                    graphCoords[k],
                    canvasCoords[k]
                ]);
                canvasCoords[k] += distanceInGraphCoords;
                graphCoords[k] -= distanceInCanvasCoords;
            }
        }
    }
    updateBackCanvas() {
        this.state.graph.topLeft = this.canvasToGraphCoords(0, 0);
        this.state.graph.bottomRight = this.canvasToGraphCoords(this.frontCanvas.width, this.frontCanvas.height);
        this.backCanvasCtx.clearRect(0, 0, this.frontCanvas.width, this.frontCanvas.height);
        this.backCanvasCtx.drawImage(this.frontCanvas, 0, 0);
        for (const ext of this.extensions){
            if (ext.hasIndependentCanvas) {
                ext.doubleBufferCtx.clearRect(0, 0, this.frontCanvas.width, this.frontCanvas.height);
                ext.doubleBufferCtx.drawImage(ext.canvas, 0, 0);
            }
        }
    }
    down(event) {
        this.updateBackCanvas();
        this.state.mouseDownCoords.x = event.offsetX;
        this.state.mouseDownCoords.y = event.offsetY;
        this.state.mouseDown = true;
        this.translate.iniX = this.translate.x;
        this.translate.iniY = this.translate.y;
        if (this.events.mouseDown) {
            this.events.mouseDown(event);
        }
    }
    up(event) {
        this.state.mouseDown = false;
        this.redraw();
        if (this.events.mouseUp) {
            this.events.mouseUp(event);
        }
    }
    move(event) {
        const x = event.offsetX;
        const y = event.offsetY;
        if (this.state.mouseDown) {
            // Calculating the new translation
            this.translate.x = this.translate.iniX - (this.state.mouseDownCoords.x - x) / this.scale;
            this.translate.y = this.translate.iniY - (this.state.mouseDownCoords.y - y) / this.scale;
            // Clearing the canvas
            this.frontCtx.clearRect(0, 0, this.width, this.height);
            const start = this.state.graph.topLeft;
            const newCoords = this.graphToCanvasCoords(start[0], start[1]);
            // Clearing the "front" canvas of all the extensions
            // and drawing the buffer using the new translate values
            for (const ext of this.extensions){
                if (ext.hasIndependentCanvas) {
                    ext.ctx.clearRect(0, 0, this.width, this.height);
                    ext.ctx.drawImage(ext.doubleBufferCanvas, newCoords[0], newCoords[1]);
                }
            }
            // Draw the "back" canvas to the "front" canvas
            this.frontCtx.drawImage(this.backCanvas, newCoords[0], newCoords[1]);
            this.state.isUsingBackCanvas = true;
            this.drawGridAndNums();
        }
        if (this.events.mouseMove) {
            this.events.mouseMove(event);
        }
    }
    mouseWheelEvent(event) {
        event.preventDefault();
        let scaleBy = 1;
        // Checking if it was scolled up or down
        // and scaling it respectively
        if (event.deltaY < -1) {
            scaleBy = this.scale / 10;
        } else {
            scaleBy = -this.scale / 10;
        }
        this.scaleUp(scaleBy, event.offsetX, event.offsetY);
    }
}
