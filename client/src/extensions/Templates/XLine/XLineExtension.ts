import { GraphExtension } from "../../../utils/GraphExtension.js";
import { GraphWindow } from "../../../utils/GraphWindow.js";
import { drawGraphX } from "../../../utils/helper.js";
import { XYExtension } from "../XY/XYExtension.js";

export class XLineExtension extends XYExtension {
    numberOfGraphs = 1;

    getWorkerCode(): void { };

    constructor(window: GraphWindow, config: { [key: string]: any }, workerCode?: (x: number) => void, numberOfGraphs?: number) {
        // console.log(workerCode.toString());
        super(window, config, workerCode, true, "/extensions/Templates/XLine/worker.js");

        this.ctx.lineJoin = "round";

        if (typeof numberOfGraphs === "number") {
            this.numberOfGraphs = numberOfGraphs;
        }
    }

    workerCallback(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        drawGraphX(
            this.canvas,
            this.ctx,
            new Float64Array(this.sharedMemory),
            false
        );

        this.redrawResolve();
    }

    resizeSharedBuffer(): void {
        this.sharedMemory = new SharedArrayBuffer(this.canvas.width * 4 * Float64Array.BYTES_PER_ELEMENT * 1);
    }

    async resizeCallback(width: number, height: number) {
        this.currentImageData = this.ctx.getImageData(0, 0, width, height);
        this.ctx.lineJoin = "round";
        this.resizeSharedBuffer();
    }
}