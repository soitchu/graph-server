import { GraphExtension } from "../../../utils/GraphExtension.js";
import { GraphWindow } from "../../../utils/GraphWindow.js";
import { drawLines } from "../../../utils/helper.js";
import { XYExtension } from "../../Templates/XY/XYExtension.js";

export class Cobweb extends GraphExtension {
    map: (x: number) => number;
    config;
    currentIteration = -1;
    currentSeed = Infinity;
    lineCoords = [];

    constructor(window: GraphWindow, map: (x: number) => number, config) {
        super(window, false);
        this.map = map;
        this.config = config;
    }

    async redraw() {
        const ctx = this.window.graphInstance.frontCtx;
        const graphInstance = this.window.graphInstance;
        const graphToCanvas = graphInstance.graphToCanvasCoords.bind(graphInstance);
        const cached = this.config.iteration === this.currentIteration && this.currentSeed === this.config.seed;

        ctx.beginPath();

        let x: number;
        let y: number;

        if (cached) {
            x = this.lineCoords[0];
            y = this.lineCoords[1];
        } else {
            x = this.config.seed;
            y = this.map(x);
            this.lineCoords = [];
            this.lineCoords.push(x, y);
        }

        for (let i = 0; i < this.config.iteration; i++) {

            let tempX: number, tempY: number;

            if (!cached) {
                tempX = y;
                tempY = this.map(tempX);
                this.lineCoords.push(tempX, tempY);
            } else {
                tempX = this.lineCoords[i * 2 + 2];
                tempY = this.lineCoords[i * 2 + 3];
            }


            ctx.moveTo.apply(ctx, graphToCanvas(x, x));
            ctx.lineTo.apply(ctx, graphToCanvas(x, y));
            ctx.moveTo.apply(ctx, graphToCanvas(x, y));
            ctx.lineTo.apply(ctx, graphToCanvas(tempX, y));
            ctx.moveTo.apply(ctx, graphToCanvas(tempX, y));
            ctx.lineTo.apply(ctx, graphToCanvas(tempX, tempY));

            x = tempX;
            y = tempY;
        }

        // drawLines([0, 0, 2, 2, 2, 2, 5, 5], graphInstance);
        console.log(this.lineCoords);

        ctx.stroke();

        // console.log(this.lineCoords, this.currentIteration, this.config.iteration);

        this.currentIteration = this.config.iteration;
        this.currentSeed = this.config.seed;
    }

    async resizeCallback(width: number, height: number): Promise<void> { }
}