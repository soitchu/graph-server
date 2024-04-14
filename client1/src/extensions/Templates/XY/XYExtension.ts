import { GraphExtension } from "../../../utils/GraphExtension.js";
import { GraphWindow } from "../../../utils/GraphWindow.js";

export class XYExtension extends GraphExtension {
  static XY_WORKER_PATH = "/extensions/Templates/XY/worker.js";
  static XLine_WORKER_PATH = "/extensions/Templates/XLine/worker.js";

  WORKER_PATH = "/extensions/Templates/XY/worker.js";
  workers: Array<Worker> = Array(8);
  currentResponses: number = 0;
  sharedMemory: SharedArrayBuffer;
  config: { [key: string]: any };
  redrawResolve: Function;
  currentImageData: ImageData;
  debugTime: number;
  workerCode: string;
  wasInterrupted = false;
  stopId = 0;

  startTranslate = [0, 0];
  startScale: number;

  getWorkerCode(): void {}
  usesOnlyX: boolean;

  workercountCode: string;
  baseWorkerCode: string;

  // This can have major performance overhead
  shouldAnimateRedraws = true;

  counter = new Uint32Array(
    new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * 2)
  );

  constructor(
    window: GraphWindow,
    config: { [key: string]: any },
    workerCode?: ((x: number) => void) | ((x: number, y: number) => void),
    usesOnlyX?: boolean,
    workerPath?: string
  ) {
    super(window);

    const height = window.graphInstance.frontCanvas.height;
    const width = window.graphInstance.frontCanvas.width;

    this.resizeSharedBuffer();
    this.config = config;
    this.currentImageData = this.ctx.getImageData(0, 0, width, height);

    this.usesOnlyX = usesOnlyX;

    if (workerPath) {
      this.WORKER_PATH = workerPath;
    }

    this.workerCode = workerCode?.toString();

    this.updateTranslateAndScale();
    this.iniWorkers();

    if (this.shouldAnimateRedraws) {
      this.animateRedraws();
      // this.workerCallback();
    }
  }

  getMass() {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    ).data;

    let count = 0;

    for (let i = 0; i <= imageData.length - 4; i += 4) {
      if (
        imageData[i] == 0 &&
        imageData[i + 1] == 0 &&
        imageData[i + 2] == 0 &&
        imageData[i + 3] == 255
      ) {
        count += 1;
      }
    }

    return count;
  }

  async animateRedraws() {
    if (this.isRedrawing) {
      this.workerCallback();
    }

    await new Promise((r) => setTimeout(r, 0));

    this.animateRedraws();
  }

  async iniWorkers() {
    const self = this;
    const hasDedicatedWorker =
      this.WORKER_PATH !== XYExtension.XY_WORKER_PATH &&
      this.WORKER_PATH !== XYExtension.XLine_WORKER_PATH;

    let workerCode = await (await fetch(this.WORKER_PATH)).text();

    if (!hasDedicatedWorker) {
      let hasWorkerCode = !!this.workerCode;

      let code = hasWorkerCode
        ? this.workerCode
        : this.getWorkerCode.toString();
      code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

      if (hasWorkerCode) {
        const funcName = this.usesOnlyX ? "calX" : "cal";
        const funcArgs = this.usesOnlyX ? "x" : "x, y";
        code = `function ${funcName}(${funcArgs}) {${code}}`;
      }

      workerCode += `${code}`;
    }

    const workerCodeBlob = new Blob([workerCode], { type: "text/javascript" });
    const workerURL = URL.createObjectURL(workerCodeBlob);

    console.log(workerURL);

    for (let i = 0; i < this.workers.length; i++) {
      if (!(this.workers[i] instanceof Worker)) {
        this.workers[i] = new Worker(workerURL, {
          type: "module",
        });

        this.workers[i].onerror = function (ev: ErrorEvent) {
          console.error("Received an error from the worker!");
        };
      }
    }

    this.redraw();

    for (let i = 0; i < this.workers.length; i++) {
      this.workers[i].onmessage = function (event: MessageEvent) {
        const [responseId, wasInterrupted] = event.data;

        if (responseId == self.responseId) {
          self.currentResponses++;

          if (self.currentResponses == self.workers.length) {
            self.isRedrawing = false;

            if (self.hasQueuedRedraw) {
              self.hasQueuedRedraw = false;
              self.redraw();
              self.redrawResolve();

              return;
            }

            if (
              self.wasInterrupted === false &&
              self.graphHasMoved() === false
            ) {
              self.workerCallback();
            } else {
              console.warn(
                "Skipping rendering because the graph was interrupted or moved"
              );
            }

            self.wasInterrupted = false;
            self.redrawResolve();

            console.log("JS took " + (self.debugTime - performance.now()));
          }
        }
      };
    }
  }

  workerCallback() {
    this.currentImageData.data.set(new Uint8Array(this.sharedMemory));

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(this.currentImageData, 0, 0);
  }

  async resizeCallback(width: number, height: number) {
    this.currentImageData = this.ctx.getImageData(0, 0, width, height);
    this.resizeSharedBuffer();
  }

  interruptWorker() {
    this.stopId++;
    Atomics.store(this.counter, 1, this.stopId);
  }

  updateTranslateAndScale() {
    this.startScale = this.window.graphInstance.scale;
    this.startTranslate[0] = this.window.graphInstance.translate.x;
    this.startTranslate[1] = this.window.graphInstance.translate.y;
  }

  graphHasMoved() {
    return !(
      this.startScale === this.window.graphInstance.scale &&
      this.startTranslate[0] === this.window.graphInstance.translate.x &&
      this.startTranslate[1] === this.window.graphInstance.translate.y
    );
  }

  resizeSharedBuffer() {
    this.sharedMemory = new SharedArrayBuffer(
      this.canvas.width * this.canvas.height * 4
    );
  }

  async redraw(): Promise<void> {
    if (this.isRedrawing) {
      this.interruptWorker();
      this.hasQueuedRedraw = true;
      return;
    }

    this.isRedrawing = true;
    this.updateTranslateAndScale();
    this.debugTime = performance.now();
    this.currentResponses = 0;

    this.responseId++;

    this.interruptWorker();

    Atomics.store(this.counter, 0, 0);

    return new Promise((resolve, reject) => {
      this.redrawResolve = resolve;

      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;

      if (this.usesOnlyX) {
        // We must clear the previous image data because if
        // the graph only plots in the X-axis, some Y values
        // will remain unchanged, which may display artifacts

        // Takes about 0.1ms - 0.2ms, but there's probably a
        // better way to do this, since the GC will have to
        // take care of it

        this.resizeSharedBuffer();
      }

      if (this.shouldAnimateRedraws && !this.usesOnlyX) {
        const sharedArray = new Uint8Array(this.sharedMemory);
        sharedArray.set(
          this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
            .data
        );
      }

      const sharedMemory = this.sharedMemory;

      const xIndex = canvasWidth / this.workers.length;

      for (var i = 0; i < this.workers.length; i++) {
        this.workers[i].postMessage({
          action: "payload",
          workerId: i,
          config: this.config,
          responseId: this.responseId,
          sharedMemory,
          height: canvasHeight,
          width: canvasWidth,
          onlyX: this.usesOnlyX,
          translate: this.window.graphInstance.translate,
          scale: this.window.graphInstance.scale,
          scaleY: this.window.graphInstance.scaleY,
          x: {
            xIndexStart: Math.floor(xIndex * i),
            start: Math.floor((i / this.workers.length) * canvasWidth),
            end: Math.floor(((i + 1) / this.workers.length) * canvasWidth),
          },
          counter: this.counter,
          stopId: this.stopId,
          numberOfGraphs: this.numberOfGraphs,
          shouldAnimateRedraws: this.shouldAnimateRedraws,
        } as XYWorkerPayload);
      }
    });
  }
}
