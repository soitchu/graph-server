import { GPUType, IKernelRunShortcut, KernelFunction } from "../../../types.js";
import { GraphExtension } from "../../../utils/GraphExtension.js";
import { GraphWindow } from "../../../utils/GraphWindow.js";

// const g = new GPU();

export class GPUJS extends GraphExtension {
    outputSize: number[];
    window: GraphWindow;
    kernel: IKernelRunShortcut;
    kernelFunction: KernelFunction;
    gpu: GPUType;
    webglCanvas: OffscreenCanvas;
    webglCtx: WebGL2RenderingContext;

    constructor(gw: GraphWindow, func: KernelFunction, outputSize: number[]) {
        super(gw);


        this.kernelFunction = func;
        this.outputSize = outputSize;
        this.window = gw;


        this.webglCanvas = new OffscreenCanvas(
            this.window.graphInstance.width,
            this.window.graphInstance.height
        );

        this.webglCtx = this.webglCanvas.getContext("webgl2", { premultipliedAlpha: false });

        this.gpu = new GPU({
            canvas: this.webglCanvas,
            ctx: this.webglCtx
        }) as GPUType

        this.resizeCallback(gw.graphInstance.width, gw.graphInstance.height);
    }

    async redraw(): Promise<void> {
        const graph = this.window.graphInstance;
        const a = new ImageData(graph.width, graph.height);
        const thread = {
            x: 0,
            y: 0
        };

        // for (let i = 0; i < graph.height; i++) {
        //     for (let j = 0; j < graph.width; j++) {
        //         let xTemp = 0, yTemp = 0;
        //         let iterations = 0;
        //         let maxIteration = 1000;

        //         let xtemp2 = 0;
        //         let x = ((j) / graph.scale - graph.translate.x);
        //         // const y = (this.thread.y) / scale - translateY;
        //         let y = -((i / graph.scale) - graph.translate.y);

        //         // console.log(x, y);

        //         // if(this.thread.y != 0) {
        //         // // debugger;
        //         // // window.console.log(y);

        //         // }
        //         // y = y - this.output.y / 2;
        //         // x *=1;

        //         while (xTemp * xTemp + yTemp * yTemp <= 4 && iterations < maxIteration) {
        //             xtemp2 = xTemp * xTemp - yTemp * yTemp + x;
        //             yTemp = 2 * xTemp * yTemp + y
        //             xTemp = xtemp2;
        //             iterations = iterations + 1;
        //         }

        //         if (x ** 2 / 2 + y ** 2 >= 100) {
        //             a.data.set([0, 0, 0, 128], (i * graph.width + j) * 4);

        //             // a.data.set([0, 0, 0, 128], (y * graph.width + x) * 4);

        //         } else {
        //             // let co = iterations + 1.0 - Math.log2(.5 * Math.log2(
        //             //     Math.sqrt(yTemp * yTemp + xTemp * xTemp)
        //             // ));
        //             // co = Math.sqrt(Math.max(0.0, co) / 256.0);

        //             // console.log((y * graph.width + x) * 4);
        //             a.data.set([255, 0, 0, 128], (i * graph.width + j) * 4);

        //             // this.color(255, 0, 0, 0.5);

        //         }
        //     }
        // }
        let start = performance.now();

        this.ctx.clearRect(0, 0, graph.width, graph.height);

        const out = this.kernel(
            graph.scale,
            graph.scaleY,
            graph.translate.x,
            graph.translate.y,
            graph.width,
        ) as Array<Float32Array>;

        console.log(performance.now() - start);

        // console.log(out);
        // let count = 0;



        this.ctx.drawImage(this.kernel.canvas, 0, 0);
        // this.ctx.putImageData(a, 0, 0);
        // console.log(a.data);
    }

    async resizeCallback(width: number, height: number): Promise<void> {
        console.log(this.kernelFunction, "||");
        this.kernel = this.gpu
            .createKernel(this.kernelFunction)
            .setGraphical(true)
            .setOutput([width, height]);
    }
}
