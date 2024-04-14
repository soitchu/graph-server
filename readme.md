# GraphServer_Lipsum

## Description
This project distributes the work needed to generate CPU intensive graphs across multiple remote servers. 

## Problems
OpenGL doesn't support double precision floating point numbers. This can be problematic when trying to generate images that need that extra precision. Although the Web Worker API can be used, the result would vary on the device it's running on. 

## Solution
To get past all this, I developed a server that hooks into a graphing software and distributes the workload across multiple servers to speed things up. To actually calculate things, [Emscripten](https://emscripten.org/) is used to compile C++ to a WebAssembly module. I went with generating the mandelbrot and the burning ship fractal; the code for it can be found [here](./server/wasm/worker.cpp). 

Then this WASM module is distributed across multiple web socket servers. The code for this can be found [here](./server/cf-worker/). For this project, I went with Cloudflare Workers, since it is free and supports both WebAssembly and websocket servers. To host it on any system, this [server](./server/index.ts) file can be used.

Everything in the [server](./server/) folder was done during the hackathon. That said, the [front-end](./client) comes from another project of mine, which I didn't develop in this hackathon. I did have to write an [extension](./client/src/extensions/Examples/Remote/index.ts) for the front-end that uses the websocket servers to draw the final image. 

## Demo
[Demo](https://github.com/soitchu/graph-server/assets/66003387/3ad2509c-3096-4fe4-864b-7e7a500cf27d)
