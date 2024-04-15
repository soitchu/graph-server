import { GraphExtension } from "../../../utils/GraphExtension.js";
export class Remote extends GraphExtension {
    config;
    websocketArray;
    globalResponseId = 0;
    responseCount = 0;
    startTime;
    // WSS_URL = "ws://localhost:8080";
    WSS_URL = "wss://mute-frost-a247.graph-server.workers.dev/";
    constructor(window, config){
        super(window, true);
        this.config = config;
    // this.canvas = window.graphInstance.frontCanvas;
    // this.canvas = window.graphInstance.frontCanvas;
    }
    instantiateWebSocket(url) {
        return new Promise((resolve, reject)=>{
            const websocket = new WebSocket(url);
            websocket.addEventListener("message", async (event)=>{
                const arrayBuffer = await new Response(event.data).arrayBuffer();
                const uint32 = new Uint32Array(arrayBuffer);
                const start = uint32[0];
                const end = uint32[1];
                const responseId = uint32[2];
                // console.log(responseId, this.globalResponseId, uint32);
                if (responseId === this.globalResponseId) {
                    this.responseCount++;
                    if (this.responseCount === this.websocketArray.length) {
                        console.log(`Total time: ${this.startTime - performance.now()}ms`);
                    }
                } else {
                    return;
                }
                const imageData = new ImageData(new Uint8ClampedArray(arrayBuffer, 12), end - start, this.canvas.height);
                this.ctx.putImageData(imageData, start, 0);
            });
            websocket.addEventListener("open", ()=>{
                resolve(websocket);
            });
            websocket.addEventListener("close", async ()=>{
                const payload = websocket["payload"];
                if (payload.responseId === this.globalResponseId) {
                    this.websocketArray[payload.index] = await this.instantiateWebSocket(this.WSS_URL);
                    this.websocketArray[payload.index]["payload"] = payload;
                    this.websocketArray[payload.index].send(JSON.stringify(payload));
                    console.log("Connection closed. The payload was", payload);
                }
            });
        });
    }
    resizeCallback() {}
    async start() {
        const width = this.canvas.width;
        const partitionWidth = width / this.websocketArray.length;
        let startX = 0;
        this.globalResponseId++;
        this.responseCount = 0;
        this.startTime = performance.now();
        for(let i = 0; i < this.websocketArray.length; i++){
            let socket = this.websocketArray[i];
            if (socket.readyState === socket.CLOSED || socket.readyState === socket.CLOSING) {
                socket = await this.instantiateWebSocket(this.WSS_URL);
                this.websocketArray[i] = socket;
            }
            const payload = {
                index: i,
                start: startX,
                end: startX + partitionWidth,
                height: this.canvas.width,
                responseId: this.globalResponseId,
                translateX: this.window.graphInstance.translate.x.toPrecision(53),
                translateY: this.window.graphInstance.translate.y.toPrecision(53),
                scale: this.window.graphInstance.scale.toPrecision(53),
                scaleY: this.window.graphInstance.scaleY,
                iterations: this.config.iterations,
                mode: this.config.mode
            };
            socket["payload"] = payload;
            socket.send(JSON.stringify(payload));
            startX += partitionWidth;
        }
    }
    async ini(partitionCount) {
        const websocketPromises = new Array(partitionCount);
        const partitions = websocketPromises.length;
        for(let i = 0; i < partitions; i++){
            websocketPromises[i] = this.instantiateWebSocket(this.WSS_URL);
        }
        this.websocketArray = await Promise.all(websocketPromises);
        this.start();
    }
    async redraw() {
        await this.start();
    }
}
