import _wasm from './a.out.wasm';

export async function parseWasmModule() {
	const memory = new WebAssembly.Memory({
		initial: 128,
		maximum: 128,
	});

	return [
		new WebAssembly.Instance(_wasm, {
			env: {
				memory,
			},
		}),
		memory,
	];
}
