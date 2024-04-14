const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
let websocketArray: WebSocket[];
let globalResponseId = 0;
let responseCount = 0;
let startTime: number;

function instantiateWebSocket(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => { 
    const websocket = new WebSocket(url);

    websocket.addEventListener("message", async (event) => {
      // console.log(event);

      const arrayBuffer = await new Response(event.data).arrayBuffer();
      const uint32 = new Uint32Array(arrayBuffer);
      const start = uint32[0];
      const end = uint32[1];
      const responseId = uint32[2];

      console.log(responseId, globalResponseId, uint32);

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

    websocket.addEventListener("open", () => {
      resolve(websocket);
    });
  });
}

function start() {
  const width = canvas.width;
  const partitionWidth = width / websocketArray.length;
  let startX = 0;

  globalResponseId++;
  responseCount = 0;
  startTime = performance.now();

  for (const socket of websocketArray) {
    socket.send(
      JSON.stringify({
        start: startX,
        end: startX + partitionWidth,
        height: canvas.width,
        responseId: globalResponseId,
      })
    );
    startX += partitionWidth;
  }
}

async function ini(partitionCount: number) {
  const websocketPromises: Promise<WebSocket>[] = new Array(partitionCount);

  const partitions = websocketPromises.length;

  for (let i = 0; i < partitions; i++) {
    websocketPromises[i] = instantiateWebSocket(
      "wss://mute-frost-a247.graph-server.workers.dev/"
    );
  }

  websocketArray = await Promise.all(websocketPromises);
  start();
}

function clear() {}

// window.WebSocket;
ini(10);

window.start = start;
window.clear = clear;
