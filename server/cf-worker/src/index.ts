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