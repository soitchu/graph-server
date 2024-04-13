// import { Socket } from "socket.io";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var websocketArray;
var globalResponseId = 0;
var responseCount = 0;
var startTime;
function instantiateWebSocket(url) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        // const websocket = new WebSocket(url);
        // @ts-expect-error
        var websocket = new io("");
        websocket.on("ping", function (arrayBuffer) { return __awaiter(_this, void 0, void 0, function () {
            var uint32, start, end, responseId, imageData;
            return __generator(this, function (_a) {
                uint32 = new Uint32Array(arrayBuffer);
                start = uint32[0];
                end = uint32[1];
                responseId = uint32[2];
                if (responseId === globalResponseId) {
                    responseCount++;
                    if (responseCount === websocketArray.length) {
                        console.log("Total time: ".concat(startTime - performance.now(), "ms"));
                    }
                }
                else {
                    return [2 /*return*/];
                }
                imageData = new ImageData(new Uint8ClampedArray(arrayBuffer, 12), end - start, canvas.height);
                ctx.putImageData(imageData, start, 0);
                return [2 /*return*/];
            });
        }); });
        websocket.on("connect", function () {
            resolve(websocket);
        });
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var width, partitionWidth, startX, index, _i, websocketArray_1, socket;
        return __generator(this, function (_a) {
            width = canvas.width;
            partitionWidth = width / websocketArray.length;
            startX = 0;
            globalResponseId++;
            responseCount = 0;
            startTime = performance.now();
            index = 0;
            for (_i = 0, websocketArray_1 = websocketArray; _i < websocketArray_1.length; _i++) {
                socket = websocketArray_1[_i];
                // if (
                //   socket.readyState === socket.CLOSED ||
                //   socket.readyState === socket.CLOSING
                // ) {
                //   console.log("A socket was closed. Instantiating a new one.");
                //   websocketArray[index] = await instantiateWebSocket("");
                // }
                socket.emit("message", JSON.stringify({
                    start: startX,
                    end: startX + partitionWidth,
                    height: canvas.width,
                    responseId: globalResponseId,
                }));
                startX += partitionWidth;
                index++;
            }
            return [2 /*return*/];
        });
    });
}
function ini(partitionCount) {
    return __awaiter(this, void 0, void 0, function () {
        var websocketPromises, partitions, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    websocketPromises = new Array(partitionCount);
                    partitions = websocketPromises.length;
                    for (i = 0; i < partitions; i++) {
                        websocketPromises[i] = instantiateWebSocket("");
                    }
                    return [4 /*yield*/, Promise.all(websocketPromises)];
                case 1:
                    websocketArray = _a.sent();
                    start();
                    return [2 /*return*/];
            }
        });
    });
}
function clear() { }
// window.WebSocket;
ini(10);
window.start = start;
window.clear = clear;
