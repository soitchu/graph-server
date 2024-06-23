import { GraphExtension } from "../../../utils/GraphExtension.js";
import { GraphWindow } from "../../../utils/GraphWindow.js";

export class Remote extends GraphExtension {
  config: any;

  tripleBufferCanvas: OffscreenCanvas;
  tripleBufferCtx: OffscreenCanvasRenderingContext2D;

  redrawPromiseFunctions: {
    resolve?: Function,
    reject?: Function
  } = {}
  websocketArray: WebSocket[];
  globalResponseId = 0;
  responseCount = 0;
  startTime: number;
  // WSS_URL = "ws://localhost:8080";
  WSS_URL = "wss://mute-frost-a247.graph-server.workers.dev/";
  animate = false

  constructor(window: GraphWindow, config, animate = false) {
    super(window, true);

    this.animate = animate
    this.tripleBufferCanvas = new OffscreenCanvas(window.graphInstance.width, window.graphInstance.height)
    this.tripleBufferCtx = this.tripleBufferCanvas.getContext("2d")
    this.config = config;
    // this.canvas = window.graphInstance.frontCanvas;
    // this.canvas = window.graphInstance.frontCanvas;
  }

  resizeCallback(width: number, height: number) {
    if(!this.tripleBufferCanvas) return

    this.tripleBufferCanvas.width = width  
    this.tripleBufferCanvas.height = height  
  }

  instantiateWebSocket(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const websocket = new WebSocket(url);

      websocket.addEventListener("message", async (event) => {
        const arrayBuffer = await new Response(event.data).arrayBuffer();
        const uint32 = new Uint32Array(arrayBuffer);
        const start = uint32[0];
        const end = uint32[1];
        const responseId = uint32[2];
        let hasFullImage = false;
        // console.log(responseId, this.globalResponseId, uint32);

        if (responseId === this.globalResponseId) {
          this.responseCount++;

          if (this.responseCount === this.websocketArray.length) {
            console.log(`Total time: ${this.startTime - performance.now()}ms`);
            hasFullImage = true
          }
        } else {
          return;
        }

        console.log(arrayBuffer, end - start, this.canvas.height);

        const imageData = new ImageData(
          new Uint8ClampedArray(arrayBuffer, 12),
          end - start,
          this.canvas.height
        );
        
        if(!this.animate) {
          this.ctx.putImageData(imageData, start, 0);
        } else {
          this.tripleBufferCtx.putImageData(imageData, start, 0);
        }

        if(hasFullImage) {
          this.redrawPromiseFunctions?.resolve()
        }
      });

      websocket.addEventListener("open", () => {
        resolve(websocket);
      });

      websocket.addEventListener("close", async () => {
        const payload = websocket["payload"];

        if (payload.responseId === this.globalResponseId) {
          this.websocketArray[payload.index] = await this.instantiateWebSocket(
            this.WSS_URL
          );

          this.websocketArray[payload.index]["payload"] = payload;
          this.websocketArray[payload.index].send(JSON.stringify(payload));

          console.log("Connection closed. The payload was", payload);
        }
      });
    });
  }

  async start() {
    const width = this.canvas.width;
    const partitionWidth = Math.floor(width / this.websocketArray.length);
    let startX = 0;

    this.globalResponseId++;
    this.responseCount = 0;
    this.startTime = performance.now();

    if(this.redrawPromiseFunctions.resolve) this.redrawPromiseFunctions?.resolve()

    const redrawPromise = new Promise((resolve, reject) => {
      this.redrawPromiseFunctions.resolve = resolve
    })

    for (let i = 0; i < this.websocketArray.length; i++) {
      let socket = this.websocketArray[i];

      if (
        socket.readyState === socket.CLOSED ||
        socket.readyState === socket.CLOSING
      ) {
        socket = await this.instantiateWebSocket(this.WSS_URL);
        this.websocketArray[i] = socket;
      }

      const payload = {
        index: i,
        start: startX,
        end:
          i === this.websocketArray.length - 1
            ? this.canvas.width
            : startX + partitionWidth,
        height: this.canvas.height,
        responseId: this.globalResponseId,
        translateX: this.window.graphInstance.translate.x.toPrecision(53),
        translateY: this.window.graphInstance.translate.y.toPrecision(53),
        scale: this.window.graphInstance.scale.toPrecision(53),
        scaleY: this.window.graphInstance.scaleY,
        iterations: this.config.iterations,
        mode: this.config.mode,
      };

      socket["payload"] = payload;
      socket.send(JSON.stringify(payload));
      startX += partitionWidth;
    }

    await redrawPromise
  }

  async ini(partitionCount: number) {
    const websocketPromises: Promise<WebSocket>[] = new Array(partitionCount);

    const partitions = websocketPromises.length;

    for (let i = 0; i < partitions; i++) {
      websocketPromises[i] = this.instantiateWebSocket(this.WSS_URL);
    }

    this.websocketArray = await Promise.all(websocketPromises);
    this.start();
  }

  async redraw() {
    await this.start();
  }
}
