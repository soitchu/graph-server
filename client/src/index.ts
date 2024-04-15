import { Graph } from "./utils/Graph.js";
import { GraphWindow } from "./utils/GraphWindow.js";
import { DatConfig } from "./utils/config/index.js";
import { Remote } from "./extensions/Examples/Remote/index.js";

let graphInstance2 = new Graph(
  document.getElementById("canvas2") as HTMLCanvasElement,
  window.innerHeight,
  window.innerWidth,
  false,
  { x: 1, y: 1 }
);

const gw = new GraphWindow(
  {
    height: window.innerHeight,
    width: window.innerWidth,
    x: 0,
    y: 0,
  },
  graphInstance2,
  "Mandelbrot Fractal"
);

const configGUI = new DatConfig();

const graphConfig = configGUI.processExtensionConfig(
  [
    {
      type: "slider",
      max: 10000,
      min: 0,
      step: 0.0001,
      default: 1,
      id: "scale_y",
      storeInLocalStorage: false,
      onChange: (value: number) => {
        const scaledBy = graphInstance2.scaleY / value;

        graphInstance2.scaleY = value;
        graphInstance2.translate.y /= scaledBy;

        graphInstance2.redraw();
      },
    },
    {
      type: "slider",
      max: 5000,
      min: 100,
      step: 1,
      default: 500,
      id: "iterations",
      storeInLocalStorage: false,
    },
    {
      type: "slider",
      max: 1,
      min: 0,
      step: 1,
      default: 1,
      id: "mode",
      storeInLocalStorage: false,
    },
  ],
  "Config"
);

const remoteExt = new Remote(gw, graphConfig);
remoteExt.ini(10);
graphInstance2.addExtension(remoteExt);

console.log(gw);