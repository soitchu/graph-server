import { GraphExtension } from "../../../utils/GraphExtension.js";
function square(num) {
    return num * num;
}
export class Attractor extends GraphExtension {
    map;
    config;
    prevConfig = {};
    modelCoords;
    constructor(window, config){
        super(window, false);
        this.config = config;
    }
    configHasChanged() {
        for(const elem in this.config){
            if (this.config[elem] !== this.prevConfig[elem]) {
                return true;
            }
        }
        return false;
    }
    drawAttractor() {
        const graphInstance = this.window.graphInstance;
        const width = graphInstance.width;
        const height = graphInstance.height;
        const imageData = new ImageData(width, height);
        const imageDataArray = imageData.data;
        const imageDataLength = imageDataArray.length;
        const points = this.modelCoords;
        const scale = graphInstance.scale;
        const scaleY = graphInstance.scaleY;
        const translateX = graphInstance.translate.x * scale;
        const translateY = graphInstance.translate.y * scale;
        for(let i = 0; i < points.length; i += 2){
            let iniX = points[i] * scale + translateX;
            let iniY = -points[i + 1] * scale * scaleY + translateY;
            iniX = iniX | iniX;
            iniY = iniY | iniY;
            if (iniX >= width - 1 || iniX < 0) {
                continue;
            }
            const start = iniY * (width * 4) + iniX * 4;
            const offset = start;
            if (offset < imageDataLength && offset >= 0) {
                imageDataArray[offset] = 0;
                imageDataArray[offset + 1] = 0;
                imageDataArray[offset + 2] = 0;
                imageDataArray[offset + 3] = 255;
            }
        }
        graphInstance.tmpCanvasCtx.putImageData(imageData, 0, 0);
        graphInstance.frontCtx.drawImage(graphInstance.tmpCanvas, 0, 0);
    }
    async redraw() {
        if (!this.configHasChanged()) {
            this.drawAttractor();
            return;
        }
        const config = this.config;
        const graphInstance = this.window.graphInstance;
        this.prevConfig = structuredClone(config);
        this.modelCoords = null;
        this.modelCoords = new Float64Array(config.endModelPoints - config.startModel + 1);
        const c1 = config.c1;
        const c2 = config.c2;
        const modelCoords = this.modelCoords;
        const nIni = square(c2) / square(square(c1 + c2)) + 10e-10;
        const pIni = square(c1) / square(square(c1 + c2)) + 10e-10;
        graphInstance.toDrawGraphs.drawPoints = [];
        function quarterRoot(num) {
            return Math.sqrt(Math.sqrt(num));
        }
        const n = (nt, pt)=>{
            return (1 - config.theta1) * nt + config.theta1 * Math.pow(quarterRoot(pt / Math.pow(c1, 2)) - Math.sqrt(pt), 2);
        };
        const p = (nt, pt)=>{
            return (1 - config.theta2) * pt + config.theta2 * Math.pow(quarterRoot(nt / Math.pow(c2, 2)) - Math.sqrt(nt), 2);
        };
        var _this_config_nIni;
        // let n = (nt, pt) => {
        //     return 1 - (c1 * (nt ** 2)) + pt;
        // };
        // let p = (nt, pt) => {
        //     return 0.3 * nt;
        // };
        let nLast = (_this_config_nIni = this.config.nIni) !== null && _this_config_nIni !== void 0 ? _this_config_nIni : nIni;
        var _this_config_pIni;
        let pLast = (_this_config_pIni = this.config.pIni) !== null && _this_config_pIni !== void 0 ? _this_config_pIni : pIni;
        const triangleWidth = 4;
        const triangleHeight = 4;
        let x = Math.random() * triangleWidth;
        let y = Math.random() * triangleHeight;
        // for (var i = 0; i < 100000000; i++) {
        //   var vertex = Math.floor(Math.random() * 3);
        //   switch (vertex) {
        //     case 0:
        //       x = x / 2;
        //       y = y / 2;
        //       break;
        //     case 1:
        //       x = triangleWidth / 2 + (triangleWidth / 2 - x) / 2;
        //       y = triangleHeight - (triangleHeight - y) / 2;
        //       break;
        //     case 2:
        //       x = triangleWidth - (triangleWidth - x) / 2;
        //       y = y / 2;
        //   }
        //   modelCoords.push(x);
        //   modelCoords.push(y);
        //   // graphInstance.addGraph({
        //   //   type: "drawPoints",
        //   //   coords: {
        //   //     x,
        //   //     y,
        //   //   },
        //   //   radius: 1,
        //   // });
        // }
        // console.log(graphInstance.he);
        // drawMo
        let c = 0;
        for(let i = 0; i < config.endModelPoints; i++){
            let nTemp = n(nLast, pLast);
            let pTemp = p(nLast, pLast);
            if (i >= config.startModel) {
                modelCoords[c] = nTemp;
                modelCoords[c + 1] = pTemp;
                c += 2;
            // graphInstance.addGraph({
            //   type: "drawPoints",
            //   coords: {
            //     x: nLast,
            //     y: pLast,
            //   },
            //   radius: 1,
            // });
            }
            nLast = nTemp;
            pLast = pTemp;
        }
        this.drawAttractor();
    // console.log(this.modelCoords, nIni, pIni, graphInstance);
    }
    async resizeCallback(width, height) {}
}
