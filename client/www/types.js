export class Kernel {
    static isSupported;
    static features;
    static mode;
    source;
    Kernel;
    output;
    debug;
    graphical;
    loopMaxIterations;
    constants;
    canvas;
    context;
    functions;
    nativeFunctions;
    subKernels;
    validate;
    immutable;
    pipeline;
    plugins;
    useLegacyEncoder;
    tactic;
    built;
    texSize;
    texture;
    mappedTextures;
    TextureConstructor;
    onRequestSwitchKernel;
}
export class CPUKernel extends Kernel {
}
export class GLKernel extends Kernel {
}
export class WebGLKernel extends GLKernel {
}
export class WebGL2Kernel extends WebGLKernel {
}
export class HeadlessGLKernel extends WebGLKernel {
}
export class FunctionBuilder {
}
// These are mostly internal
export class FunctionNode {
}
export class WebGLFunctionNode extends FunctionNode {
}
export class WebGL2FunctionNode extends WebGLFunctionNode {
}
export class CPUFunctionNode extends FunctionNode {
}
export class Texture {
    kernel;
}
export class Input {
    value;
    size;
}
export class KernelValue {
}
export class WebGLKernelValue {
}
