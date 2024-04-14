import { parseWasmModule } from './wasm';

export interface Env {}

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
		// The state of the graph
		const { start, end, height, responseId, translateX, translateY, scale, scaleY, iterations, mode } = JSON.parse(event.data as string);
		
		// The width of the generated image
		const width = end - start;

		// Generating the image data
		wasmModule.exports.calc(width, height, translateX, translateY, scale, scaleY, start, end, iterations, mode);
		
		// Pointer of the image data
		const offset = Number(wasmModule.exports.getOffset());

		// Getting the image data from WASM's memory. Offsetting to store meta-data
		let array = new Uint8Array(wasmMemory.buffer, Number(offset) - 12, width * height * 4 + 12);
		
		// Storing the meta data needed by the client to render the 
		// image in the right place
		let meta_data = new Uint32Array(wasmMemory.buffer, offset - 12);
		meta_data[0] = start;
		meta_data[1] = end;
		meta_data[2] = responseId;

		// Sending the image data to the client
		server.send(array);
	});

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
}

addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});
