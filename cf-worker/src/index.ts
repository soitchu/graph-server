/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { parseWasmModule } from './wasm';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

// const wasmMemory = new WebAssembly.Memory({ initial: 128 });

async function handleRequest(request: Request) {
	const upgradeHeader = request.headers.get('Upgrade');
	if (!upgradeHeader || upgradeHeader !== 'websocket') {
		return new Response('Expected Upgrade: websocket', { status: 426 });
	}

	const webSocketPair = new WebSocketPair();
	const [client, server] = Object.values(webSocketPair);

	let [wasmModule, wasmMemory] = await parseWasmModule();

	server.accept();
	server.addEventListener('message', async (event) => {
		const { start, end, height, responseId, translateX, translateY, scale, scaleY, iterations } = JSON.parse(event.data as string);
		const width = end - start;

		wasmModule.exports.calc(width, height, translateX, translateY, scale, scaleY, start, end, iterations);
		const offset = Number(wasmModule.exports.getOffset());
		let array = new Uint8Array(wasmMemory.buffer, Number(offset) - 12, width * height * 4 + 12);
		let meta_data = new Uint32Array(wasmMemory.buffer, offset - 12);

		meta_data[0] = start;
		meta_data[1] = end;
		meta_data[2] = responseId;

		server.send(array);

		meta_data = undefined;
		array = undefined;
	});

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
}

addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});

// export default {
// 	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
// 		request;
// 		// request.respondWith(handleRequest(event.request))
// 	},
// 	,
// };
