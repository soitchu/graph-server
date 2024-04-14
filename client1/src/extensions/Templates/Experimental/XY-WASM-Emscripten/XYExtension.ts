import { GraphExtension } from "../../../../utils/GraphExtension.js";
import { GraphWindow } from "../../../../utils/GraphWindow.js";
import { XYExtension } from "../../XY/XYExtension.js";

interface CustomWASMModule extends WebAssembly.WebAssemblyInstantiatedSource {
    instance: {
        exports: {
            getOffset: () => BigInt,
            calc: (canvasWidth: number, canvasHeight: number, translateX: number, translateY: number, scale: number, start: number, end: number) => void;
        }
    }
}

export class XYWASMExtension extends XYExtension {
    constructor(gw: GraphWindow, config: { [key: string]: any }) {
        super(gw, config, (x: number) => { }, false, "/extensions/Templates/Experimental/XY-WASM-Emscripten/worker.js");
    }
}