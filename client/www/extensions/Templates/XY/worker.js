let payload;
let YValues = [];
let pixelOpacity = 255;
let counter;
let workerId = -1;
let shouldAnimateRedraws = false;
function changeImageBufferX() {
    let xIndex = payload.x.xIndexStart;
    const canvasImageData = new Uint8Array(payload.sharedMemory);
    const imageDataLength = canvasImageData.length;
    const width = payload.width;
    const translateX = payload.translate.x * payload.scale;
    const translateY = payload.translate.y * payload.scale;
    const scale = payload.scale;
    const yEnd = (payload.translate.y - payload.height / payload.scale) / payload.scaleY;
    const yStart = payload.translate.y / payload.scaleY;
    for(let i = payload.x.start; i < payload.x.end; i++){
        YValues.length = 0;
        calX((i - translateX) / scale);
        for(let j = 0; j < YValues.length; j++){
            const yVal = YValues[j];
            const yCoords = yVal * payload.scaleY;
            if (yVal > yStart || yVal < yEnd) {
                continue;
            }
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
                const opacity = Math.min(255, canvasImageData[offset + 3] + pixelOpacity);
                canvasImageData[offset] = 0;
                canvasImageData[offset + 1] = 0;
                canvasImageData[offset + 2] = 0;
                canvasImageData[offset + 3] = 255;
                canvasImageData[offset + 3] = opacity;
            }
        }
        xIndex++;
    }
    postMessage(payload.responseId);
}
function changeImageBufferXAtomics() {
    let xIndex = payload.x.xIndexStart;
    const canvasImageData = new Uint8Array(payload.sharedMemory);
    const imageDataLength = canvasImageData.length;
    const width = payload.width;
    const height = payload.height;
    const translateX = payload.translate.x * payload.scale;
    const translateY = payload.translate.y * payload.scale;
    const scale = payload.scale;
    const yEnd = (payload.translate.y - payload.height / payload.scale) / payload.scaleY;
    const yStart = payload.translate.y / payload.scaleY;
    let count = Atomics.add(counter, 0, 1);
    var _payload_config_xScale;
    const xScale = (_payload_config_xScale = payload.config.xScale) !== null && _payload_config_xScale !== void 0 ? _payload_config_xScale : 1;
    const maxCount = width;
    let wasInterrupted = false;
    while(count < maxCount){
        if (counter[1] !== payload.stopId) {
            wasInterrupted = true;
            break;
        }
        // count = (count);
        if (shouldAnimateRedraws) {
            for(let i = 0; i < height; i++){
                const offset = i * (width * 4) + (count | 0) * 4;
                canvasImageData.set([
                    0,
                    0,
                    0,
                    0
                ], offset);
            }
        }
        for(let k = count; k < count + 1; k += 1 / xScale){
            YValues.length = 0;
            calX((k - translateX) / scale);
            for(let j = 0; j < YValues.length; j++){
                const yVal = YValues[j];
                const yCoords = yVal * payload.scaleY;
                if (yVal > yStart || yVal < yEnd) {
                    continue;
                }
                let iniX = count;
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
                    const opacity = Math.min(255, canvasImageData[offset + 3] + pixelOpacity);
                    canvasImageData[offset] = 0;
                    canvasImageData[offset + 1] = 0;
                    canvasImageData[offset + 2] = 0;
                    canvasImageData[offset + 3] = 255;
                    canvasImageData[offset + 3] = opacity;
                }
            }
        }
        count = Atomics.add(counter, 0, 1);
        xIndex++;
    }
    postMessage([
        payload.responseId,
        wasInterrupted
    ]);
}
function changeImageBuffer() {
    const canvasImageData = new Uint8Array(payload.sharedMemory);
    const canvasWidth = payload.width;
    const canvasHeight = payload.height;
    const translateX = payload.translate.x;
    const translateY = payload.translate.y;
    const scale = payload.scale;
    for(let i = payload.x.start; i < payload.x.end; i++){
        // Atomics.add()
        for(var j = 0; j < canvasHeight; j++){
            const pixelPos = (j * canvasWidth + i) * 4;
            if (pixelPos >= canvasImageData.length) {
                continue;
            }
            const color = cal(i / scale - translateX, -(j / scale - translateY) / payload.scaleY);
            canvasImageData[pixelPos + 0] = color[0];
            canvasImageData[pixelPos + 1] = color[1];
            canvasImageData[pixelPos + 2] = color[2];
            canvasImageData[pixelPos + 3] = color[3];
        }
    }
    postMessage([
        payload.responseId,
        false
    ]);
}
function changeImageBufferAtomics() {
    const canvasImageData = new Uint8Array(payload.sharedMemory);
    const canvasWidth = payload.width;
    const canvasHeight = payload.height;
    const translateX = payload.translate.x;
    const translateY = payload.translate.y;
    const scale = payload.scale;
    let count = Atomics.add(counter, 0, 1);
    const maxCount = canvasHeight * canvasWidth;
    let wasInterrupted = false;
    while(count < maxCount){
        if (counter[1] !== payload.stopId) {
            wasInterrupted = true;
            break;
        }
        const i = count % canvasWidth;
        const j = Math.floor(count / canvasWidth);
        const pixelPos = (j * canvasWidth + i) * 4;
        if (pixelPos >= canvasImageData.length) {
            continue;
        }
        const color = cal(i / scale - translateX, -(j / scale - translateY) / payload.scaleY);
        canvasImageData.set(color, pixelPos);
        count = Atomics.add(counter, 0, 1);
    }
    postMessage([
        payload.responseId,
        wasInterrupted
    ]);
}
onmessage = async function(event) {
    payload = event.data;
    counter = payload.counter;
    workerId = payload.workerId;
    shouldAnimateRedraws = payload.shouldAnimateRedraws;
    if ("alpha_strength" in payload.config) {
        pixelOpacity = payload.config.alpha_strength;
    }
    if (payload.onlyX) {
        changeImageBufferXAtomics();
    } else {
        changeImageBufferAtomics();
    // changeImageBuffer();
    }
};
export { };
