const fs = require("fs");

(async function() {
    const wasmBuffer = fs.readFileSync("./a.out.wasm");
    const memory = new WebAssembly.Memory({
        initial: 128,
        maximum: 128
    });
    const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
        env: {
            memory
        }
    });

    wasmModule.instance.exports.calc(100, 100,0,0, 1, 1, 1, 100);
    const offset = Number(wasmModule.instance.exports.getOffset());
    
    let index = 0;

    console.log(
        (new Uint8Array(memory.buffer, offset))
    )
    // console.log(
    //     new Uint8Array(memory.buffer).map((x) => {
    //         index++;
    //         if(x !== 0) {
    //             console.log(index);
    //             console.log(new Uint8Array(memory.buffer)[index];
    //         }
    //         // console.log(x);
    //     })
    // );
    console.log();
})();
