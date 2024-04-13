// import { Socket } from "socket.io";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
let websocketArray: WebSocket[];
let globalResponseId = 0;
let responseCount = 0;
let startTime: number;

function instantiateWebSocket(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    // const websocket = new WebSocket(url);
    // @ts-expect-error
    const websocket = new io("");

    websocket.on("ping", async (arrayBuffer) => {
      // console.log(event);
      // const arrayBuffer = await new Response(event).arrayBuffer();
      const uint32 = new Uint32Array(arrayBuffer);
      const start = uint32[0];
      const end = uint32[1];
      const responseId = uint32[2];

      if (responseId === globalResponseId) {
        responseCount++;

        if (responseCount === websocketArray.length) {
          console.log(`Total time: ${startTime - performance.now()}ms`);
        }
      } else {
        return;
      }

      const imageData = new ImageData(
        new Uint8ClampedArray(arrayBuffer, 12),
        end - start,
        canvas.height
      );

      ctx.putImageData(imageData, start, 0);
    });

    websocket.on("connect", () => {
      resolve(websocket);
    });
  });
}

async function start() {
  const width = canvas.width;
  const partitionWidth = width / websocketArray.length;
  let startX = 0;

  globalResponseId++;
  responseCount = 0;
  startTime = performance.now();

  let index = 0;

  for (const socket of websocketArray) {
    // if (
    //   socket.readyState === socket.CLOSED ||
    //   socket.readyState === socket.CLOSING
    // ) {
    //   console.log("A socket was closed. Instantiating a new one.");
    //   websocketArray[index] = await instantiateWebSocket("");
    // }

    socket.emit(
      "message",
      JSON.stringify({
        start: startX,
        end: startX + partitionWidth,
        height: canvas.width,
        responseId: globalResponseId,
      })
    );

    startX += partitionWidth;
    index++;
  }
}

async function ini(partitionCount: number) {
  const websocketPromises: Promise<WebSocket>[] = new Array(partitionCount);

  const partitions = websocketPromises.length;

  for (let i = 0; i < partitions; i++) {
    websocketPromises[i] = instantiateWebSocket("");
  }

  websocketArray = await Promise.all(websocketPromises);
  start();
}

function clear() {}

// window.WebSocket;
ini(10);

window.start = start;
window.clear = clear;
