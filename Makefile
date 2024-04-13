build-and-run:
	cd wasm && make
	make run
run:
	bun --watch index.ts
