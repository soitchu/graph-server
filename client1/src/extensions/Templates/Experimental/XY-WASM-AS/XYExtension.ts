import { GraphWindow } from "../../../utils/GraphWindow.js";
import { XYExtension } from "../XY/XYExtension.js";

interface CustomWASMModule extends WebAssembly.WebAssemblyInstantiatedSource {
    instance: {
        exports: {
            getOffset: () => BigInt,
            calc: (canvasWidth: number, canvasHeight: number, translateX: number, translateY: number, scale: number, start: number, end: number) => void;
        }
    }
}

export class XYWASMExtension extends XYExtension {

}