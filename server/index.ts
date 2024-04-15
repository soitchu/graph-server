import { readFileSync } from "fs";
import { WebSocketServer } from "ws";

const _wasm = readFileSync("./wasm/a.out.wasm");
let wasmModule: WebAssembly.Module, wasmMemory: WebAssembly.Memory;

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

const wss = new WebSocketServer({ port: 8080 });

(async function () {
  [wasmModule, wasmMemory] = await parseWasmModule();
})();

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

    console.log(width, height);

    let meta_data = new Uint32Array(wasmMemory.buffer, offset - 12);

    meta_data[0] = start;
    meta_data[1] = end;
    meta_data[2] = responseId;

    ws.send(array);

    meta_data = undefined;
    array = undefined;
  });
});
