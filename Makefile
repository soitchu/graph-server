cf-deploy:
	# cd wasm && make
	cp ./wasm/a.out.wasm ./cf-worker/mute-frost-a247/a.out.wasm
	cd  ./cf-worker/mute-frost-a247/ && npx wrangler deploy

build-and-run:
	cd wasm && make
	make run
run:
	bun --watch index.ts
