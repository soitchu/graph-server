import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { readFileSync } from "fs";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static("./"));

io.on("connection", async (socket) => {
  console.log("a user connected");

  socket.on("message", async (payload) => {
    const { start, end, height, responseId } = JSON.parse(payload);

    console.log(start, end, height, responseId);

    const wasmBuffer = readFileSync("./wasm/a.out.wasm");
    const memory = new WebAssembly.Memory({
      initial: 128,
      maximum: 128,
    });
    const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
      env: {
        memory,
      },
    });

    const width = end - start;

    wasmModule.instance.exports.calc(width, height, 2.7, 2, 300, 1, start, end);

    const offset = Number(wasmModule.instance.exports.getOffset());

    let index = 0;

    const array = new Uint8Array(
      memory.buffer,
      offset - 12,
      width * height * 4 + 12
    );
    console.log(array.length);

    const meta_data = new Uint32Array(memory.buffer, offset - 12);

    meta_data[0] = start;
    meta_data[1] = end;
    meta_data[2] = responseId;

    socket.emit("ping", array);
  });
});

server.listen(3001, () => {
  console.log("server running at http://localhost:3001");
});
