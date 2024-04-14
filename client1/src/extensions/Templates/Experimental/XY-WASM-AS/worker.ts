// @ts-expect-error
let payload: XYWorkerPayload;
// @ts-expect-error
let result = [0, 0];
// @ts-expect-error
let YValues: Array<number> = [];
// @ts-expect-error
let lastHeight = 0;
// @ts-expect-error
const colors: { [key: string]: number[] } = {
    "0": [173, 216, 230],
    "1": [255, 255, 143],
};

interface CustomWASMModule extends WebAssembly.WebAssemblyInstantiatedSource {
    instance: {
        exports: {
            getOffset: () => BigInt,
            calc: (canvasWidth: number, canvasHeight: number, translateX: number, translateY: number, scale: number, scaleY: number, start: number, end: number) => void;
            cal: (x: number, y: number) => void;
        }
    }
}

let WASMModule: CustomWASMModule;
let WASMMemory: WebAssembly.Memory;

function cal(x: number, y: number): void {
    // modify result
    // the first value of the result is the colorId
    // the second value is the intensity of the color. Must
    // be between 0 and 255, and an Integer

    result[0] = Math.floor(x ^ 2 + y * y / 2) % 2;
    result[1] = 180;
}

function calX(x: number) {
    YValues.length = 0;

    YValues.push(x);
    // YValues.push(-Math.sqrt(25 - x));
    YValues.push(x * x + 5);
    // YValues.push(x + 10);
}

function changeImageBufferX() {
    let xIndex = payload.x.xIndexStart;
    const canvasImageData = new Uint8Array(payload.sharedMemory);
    const imageDataLength = canvasImageData.length;
    const width = payload.width;
    const translateX = payload.translate.x * payload.scale;
    const translateY = payload.translate.y * payload.scale;
    const scale = payload.scale;

    for (let i = payload.x.start; i < payload.x.end; i++) {
        calX((i - translateX) / scale);

        for (let j = 0; j < YValues.length; j++) {
            const yCoords = YValues[j];
            let iniX = i;
            let iniY = -yCoords * payload.scale + translateY;

            if (isNaN(iniY)) {
                continue;
            }

            // Converting to integer
            iniX = iniX | iniX;
            iniY = iniY | iniY;

            const start = iniY * (width * 4) + iniX * 4;
            const offset = start;

            if (offset < imageDataLength && offset >= 0) {
                canvasImageData[offset] = 255;
                canvasImageData[offset + 1] = 255;
                canvasImageData[offset + 2] = 255;
                canvasImageData[offset + 3] = 255;
            }
        }

        xIndex++;
    }

    postMessage(payload.responseId);
}

function changeImageBuffer() {
    const canvasImageData = new Uint8Array(payload.sharedMemory);
    const canvasWidth = payload.width;
    const canvasHeight = payload.height;
    const translateX = payload.translate.x;
    const translateY = payload.translate.y;
    const scale = payload.scale;

    let start = performance.now();

    WASMModule.instance.exports.calc(
        canvasWidth,
        canvasHeight,
        translateX,
        translateY,
        scale,
        payload.scaleY,
        payload.x.start,
        payload.x.end
    );

    console.log(`took ${performance.now() - start}`);

    const offset = Number(WASMModule.instance.exports.getOffset());

    const WASM8Int = new Uint8Array(WASMMemory.buffer);

    for (let i = payload.x.start; i < payload.x.end; i++) {
        for (let j = 0; j < canvasHeight; j++) {
            const pixelPos = (j * canvasWidth + i) * 4;

            if (pixelPos >= canvasImageData.length) {
                continue;
            }

            canvasImageData[i] = WASM8Int[i];
            canvasImageData[pixelPos + 0] = WASM8Int[offset + pixelPos + 0]
            canvasImageData[pixelPos + 1] = WASM8Int[offset + pixelPos + 1]
            canvasImageData[pixelPos + 2] = WASM8Int[offset + pixelPos + 2]
            canvasImageData[pixelPos + 3] = WASM8Int[offset + pixelPos + 3]
        }
    }

    postMessage(payload.responseId);
}

onmessage = async function (event: MessageEvent) {
    payload = event.data;

    if (!WASMModule) {
        WASMMemory = new WebAssembly.Memory({
            initial: 256,
            maximum: 256
        });
        const WASMFile = await fetch("./a.out.wasm");

        // @ts-expect-error
        WASMModule = await WebAssembly.instantiateStreaming(WASMFile, {
            env: {
                memory: WASMMemory,
                abort: function (x) {
                    console.log(x, arguments);
                }
            }
        });

        const offset = WASMModule.instance.exports.getOffset() + 32;
        const test = new Uint8Array(WASMMemory.buffer);
        // console.log(offset, test[offset], test[offset + 1]);

        // console.log(WASMModule.instance.exports.result);
        // console.log(WASMModule.instance.exports.cal(3.0,4.0));

    }


    changeImageBuffer();
};

export { };