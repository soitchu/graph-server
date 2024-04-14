build:
	- rm ./www/ -rf
	- cd src && npx swc * --out-dir=../www/
	cp ./src/index.html ./www/index.html
	- mkdir ./www/utils/libs
	cp ./src/utils/libs/*.js ./www/utils/libs
	cp ./src/extensions/Templates/Webgl/*.vert ./www/extensions/Templates/Webgl/
	cp ./src/extensions/Templates/Webgl/*.frag ./www/extensions/Templates/Webgl/


	cp ./src/extensions/Templates/Experimental/XY-WASM-Emscripten/a.out.wasm ./www/extensions/Templates/Experimental/XY-WASM-Emscripten/a.out.wasm
	cp ./src/extensions/Templates/Experimental/XY-WASM-AS/a.out.wasm ./www/extensions/Templates/Experimental/XY-WASM-AS/a.out.wasm
start:
	cd server && node index.js

watch:
	- cd src && npx swc * --out-dir=../www/ --watch