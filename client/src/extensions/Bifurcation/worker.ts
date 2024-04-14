let sensitivity = 1e-5;

let startModel = 0;

// let theta1 = 0.5;
// let theta2 = 0.5;

// let theta1 = 0.8;
// let theta2 = 0.8;
let sharedMemory;
let theta1 = 0.7;
let theta2 = 0.7;
let width = 0;
let height = 0;
let drawY = false;
const graphState = {
	translate: null,
	scale: null
};
let xScaling, yScaling;
let noiseEnd = 100;
// console.log("here", theta1);
var graphInstance = {};
var graphInstance2 = {};
graphInstance2.currentInitial = { x: 1, y: 1 };
// graphInstance.currentInitial = {x: 0.004141918184170113, y: 0.0012361686569219535};
graphInstance.currentInitial = { x: 1, y: 0.0005 };
// graphInstance.currentInitial = {x: 0.5, y: 0.5};

// graphInstance.currentInitial = {x: 0.01141918184170113, y: 0.004061686569219535};

let endModel = 10000;
let modelCoords = new Float64Array(noiseEnd * 2);
const eliminateNoise = false;

function findPeriod(arr) {
	const reference = arr[arr.length - 1];
	const referenceB = arr[arr.length - 2];

	for (let i = arr.length - 2; i >= 0; i--) {
		// if(
		//     Math.abs(arr[i].x - reference.x) < sensitivity && 
		//     Math.abs(arr[i].y- reference.y) < sensitivity && 
		//     Math.abs(arr[i - 1].x - referenceB.x) < sensitivity && 
		//     Math.abs(arr[i - 1].y- referenceB.y) < sensitivity

		//     ){
		//     // console.log(i);
		//     return arr.length - 1- i;
		// }

		// if(arr[i].x === Infinity || arr[i].y === Infinity){
		// 	if(eliminateNoise){
		//     	return "Diverges";
		// 	}

		// 	break;
		// }

		if (!eliminateNoise) {
			return noiseEnd;
		}
	}
}


function pow(num, pow) {
	var result = num;
	while (--pow) {
		result *= num;
	}
	return result;
}

function quarterRoot(num) {
	return Math.sqrt(Math.sqrt(num));
}

function square(num) {
	return num * num;
}

function drawModel(shouldDraw = true) {
	let c1 = graphInstance.currentInitial.x; // n0
	let c2 = graphInstance.currentInitial.y; // p0
	nIni = square(c2) / square(square(c1 + c2)) + 10e-10;
	pIni = square(c1) / square(square(c1 + c2)) + 10e-10;

	let n = (nt, pt) => {
		return (1 - theta1) * nt + theta1 * Math.pow(quarterRoot(pt / Math.pow(c1, 2)) - Math.sqrt(pt), 2);
	};

	let p = (nt, pt) => {
		return (1 - theta2) * pt + theta2 * Math.pow(quarterRoot(nt / Math.pow(c2, 2)) - Math.sqrt(nt), 2);
	};

	let nLast = nIni;
	let pLast = pIni;

	for (let i = 0; i < endModel; i++) {
		let nTemp = n(nLast, pLast);
		let pTemp = p(nLast, pLast);
		const index = i - (endModel - noiseEnd);

		if (index > 0) {
			modelCoords[index * 2] = nTemp;
			modelCoords[index * 2 + 1] = pTemp;
			// console.log(index, modelCoords.length)
		}



		nLast = nTemp;
		pLast = pTemp;
	}
}

let step = 0.1;

function drawBifurcation(start, stop) {
	let count = 0;
	for (let i = start; i <= stop; i += step) {
		graphInstance.currentInitial.x = i * graphInstance.currentInitial.y;
		drawModel(false);
		const period = noiseEnd;

		const imageDataLength = sharedMemory.length;

		const graph = graphState;
		
		for (let j = 0; j < period; j += 2) {
			let secondCoords = drawY ? modelCoords[modelCoords.length - 1 - j] : modelCoords[modelCoords.length - 1 - j + 1];
			secondCoords /= (drawY ? yScaling : xScaling);

			if (isNaN(secondCoords)) {
				continue;
			}


			const translateX = graph.translate.x * graph.scale;
			const translateY = graph.translate.y * graph.scale;
			let iniX = i * graph.scale + translateX;
			let iniY = -secondCoords * graph.scale + translateY;

			iniX = iniX | iniX;
			iniY = iniY | iniY;

			if (iniX >= (width - 1) || iniX < 0) {
				continue;
			}

			const start = iniY * (width * 4) + iniX * 4;
			const offset = start;

			if (offset < imageDataLength && offset >= 0) {
				sharedMemory[offset] = 255;
				sharedMemory[offset + 1] = 255;
				sharedMemory[offset + 2] = 255;
				sharedMemory[offset + 3] = 255;
			}


		}
	}
}


onmessage = async function (e) {
	if (noiseEnd != e.data[7]) {
		modelCoords = new Float64Array(e.data[7] * 2);
	}

	endModel = e.data[3];
	theta1 = e.data[4];
	theta2 = e.data[5];
	step = e.data[6];
	noiseEnd = e.data[7];
	graphInstance.currentInitial = e.data[8];
	graphInstance2.currentInitial = e.data[9];
	xScaling = e.data[10];
	drawY = e.data[11];
	yScaling = e.data[12];

	width = e.data[17];
	height = e.data[18];

	let start = e.data[0];
	let end = e.data[1];

	graphState.translate = e.data[13];
	graphState.scale = e.data[14];


	sharedMemory = new Uint8Array(e.data[16]);
	drawBifurcation(start, end);

	postMessage([[], e.data[2]]);

	console.log("done")
}