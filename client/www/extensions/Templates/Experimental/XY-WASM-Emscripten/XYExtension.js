import { XYExtension } from "../../XY/XYExtension.js";
export class XYWASMExtension extends XYExtension {
    constructor(gw, config){
        super(gw, config, (x)=>{}, false, "/extensions/Templates/Experimental/XY-WASM-Emscripten/worker.js");
    }
}
