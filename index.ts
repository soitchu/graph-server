import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { readFileSync } from "fs";
import WebSocket, { WebSocketServer } from "ws";

const _wasm = readFileSync("./wasm/a.out.wasm");
let wasmModule, wasmMemory;

export async function parseWasmModule() {
  const memory = new WebAssembly.Memory({
    initial: 128,
    maximum: 128,
  });

  const module = new WebAssembly.Module(_wasm);

  return [
    new WebAssembly.Instance(module, {
      env: {
        memory,
      },
    }),
    memory,
  ];
}

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static("./"));

const wss = new WebSocketServer({ port: 8080 });

(async function () {
  [wasmModule, wasmMemory] = await parseWasmModule();
})();

// console.log()

wss.on("connection", function connection(ws) {
  ws.on("message", async (event) => {
    const data = "" + event;

    const {
      start,
      end,
      height,
      responseId,
      translateX,
      translateY,
      scale,
      scaleY,
      iterations,
    } = JSON.parse(data);
    const width = end - start;

    wasmModule.exports.calc(
      width,
      height,
      translateX,
      translateY,
      scale,
      scaleY,
      start,
      end,
      iterations
    );
    const offset = Number(wasmModule.exports.getOffset());
    let array = new Uint8Array(
      wasmMemory.buffer,
      Number(offset) - 12,
      width * height * 4 + 12
    );
    let meta_data = new Uint32Array(wasmMemory.buffer, offset - 12);

    meta_data[0] = start;
    meta_data[1] = end;
    meta_data[2] = responseId;

    ws.send(array);

    meta_data = undefined;
    array = undefined;
  });
});

// io.on("connection", async (socket) => {
//   console.log("a user connected");

//   socket.on("message", async (payload) => {
//     const { start, end, height, responseId, translateX, translateY, scale, scaleY, iterations } = JSON.parse(payload);

//     console.log(start, end, height, responseId);

//     const wasmBuffer = readFileSync("./wasm/a.out.wasm");
//     const memory = new WebAssembly.Memory({
//       initial: 128,
//       maximum: 128,
//     });
//     const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
//       env: {
//         memory,
//       },
//     });

//     const width = end - start;

//     wasmModule.instance.exports.calc(width, height, 2.7, 2, 300, 1, start, end);

//     const offset = Number(wasmModule.instance.exports.getOffset());

//     let index = 0;

//     const array = new Uint8Array(
//       memory.buffer,
//       offset - 12,
//       width * height * 4 + 12
//     );
//     console.log(array.length);

//     const meta_data = new Uint32Array(memory.buffer, offset - 12);

//     meta_data[0] = start;
//     meta_data[1] = end;
//     meta_data[2] = responseId;

//     socket.emit("ping", array);
//   });
// });

// server.listen(3001, () => {
//   console.log("server running at http://localhost:3001");
// });
