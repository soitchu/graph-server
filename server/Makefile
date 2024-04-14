cf-deploy:
	cp ./wasm/a.out.wasm ./cf-worker/src/a.out.wasm
	cd  ./cf-worker/ && npx wrangler deploy

build-and-run:
	cd wasm && make
	make run
run:
	bun --watch index.ts
