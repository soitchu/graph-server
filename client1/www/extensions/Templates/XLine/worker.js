let payload;
let counter;
let workerId = -1;
const YValues = [];
function canvasToGraphCoords(x, y) {
    return [
        x / payload.scale - payload.translate.x,
        -y / payload.scale - payload.translate.y
    ];
}
function changeImageBufferX() {
    const lineData = new Float64Array(payload.sharedMemory);
    const height = payload.height;
    const width = payload.width;
    const graphNums = payload.numberOfGraphs;
    let wasInterrupted = false;
    // Array is initialized with undefined
    let lastYCoord = Array(graphNums);
    let lastXCoord = Array(graphNums);
    for(let i = payload.x.start; i <= payload.x.end; i += 1){
        if (counter[1] !== payload.stopId) {
            wasInterrupted = true;
            break;
        }
        const xCoords = canvasToGraphCoords(i, 0)[0];
        YValues.length = 0;
        calX(xCoords);
        for(let j = 0; j < graphNums; j++){
            const yCoords = YValues[j] * payload.scaleY;
            let iniX = (xCoords + payload.translate.x) * payload.scale;
            let iniY = (-yCoords + payload.translate.y) * payload.scale;
            if (isNaN(iniY)) {
                continue;
            }
            const offset = i * 4 + width * 4 * j;
            if (lastYCoord[j] !== undefined && (iniY >= 0 || lastYCoord[j] >= 0) && (iniY <= height || lastYCoord[j] <= height)) {
                lineData[offset] = lastXCoord[j];
                lineData[offset + 1] = lastYCoord[j];
                lineData[offset + 2] = iniX;
                lineData[offset + 3] = iniY;
            } else {
                lastYCoord[j] = undefined;
            }
            lastYCoord[j] = iniY;
            lastXCoord[j] = iniX;
        }
    }
    postMessage([
        payload.responseId,
        wasInterrupted
    ]);
}
function changeImageBufferXAtomics() {
    const lineData = new Float64Array(payload.sharedMemory);
    const height = payload.height;
    const width = payload.width;
    const graphNums = payload.numberOfGraphs;
    const translateX = payload.translate.x * payload.scale;
    const translateY = payload.translate.y * payload.scale;
    const scale = payload.scale;
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
        const xCoords = canvasToGraphCoords(count, 0)[0];
        for(let k = count; k < count + 1; k += 1 / xScale){
            YValues.length = 0;
            calX((k - translateX) / scale);
            // calX(xCoords);
            for(let j = 0; j < graphNums; j++){
                const yCoords = YValues[j] * payload.scaleY;
                let iniX = (xCoords + payload.translate.x) * payload.scale;
                let iniY = (-yCoords + payload.translate.y) * payload.scale;
                const offset = count * 2 + width * 2 * j;
                if (isNaN(iniY)) {
                    iniX = NaN;
                }
                lineData.set([
                    iniX,
                    iniY
                ], offset);
            }
        }
        count = Atomics.add(counter, 0, 1);
    }
    postMessage([
        payload.responseId,
        wasInterrupted
    ]);
}
onmessage = function(event) {
    payload = event.data;
    counter = payload.counter;
    workerId = payload.workerId;
    changeImageBufferXAtomics();
// changeImageBufferX();
};
export { };
