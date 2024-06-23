export class GraphExtension {
    window;
    canvas;
    ctx;
    doubleBufferCanvas;
    doubleBufferCtx;
    hasIndependentCanvas;
    locked = false;
    isRedrawing = false;
    dontRedraw = false;
    hasQueuedRedraw = false;
    responseId = 0;
    constructor(window, hasIndependentCanvas = true){
        // this.ctx.fillStyle = "red";
        // this.doubleBufferCtx.fillStyle = "red";
        this.window = window;
        this.hasIndependentCanvas = hasIndependentCanvas;
        if (hasIndependentCanvas) {
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d", {
                willReadFrequently: true
            });
            this.doubleBufferCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height);
            this.doubleBufferCtx = this.doubleBufferCanvas.getContext("2d", {
                willReadFrequently: true
            });
            this.initialize();
        }
        this.resize(window.graphInstance.frontCanvas.width, window.graphInstance.frontCanvas.height);
    }
    resize(width, height) {
        if (this.hasIndependentCanvas) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.doubleBufferCanvas.width = width;
            this.doubleBufferCanvas.height = height;
            this.ctx.imageSmoothingEnabled = false;
            // @ts-expect-error
            if (this.webGLCanvas) {
                // @ts-expect-error
                this.webGLCanvas.width = width;
                // @ts-expect-error
                this.webGLCanvas.height = height;
                // @ts-expect-error
                this.viewportHeight = height;
                // @ts-expect-error
                this.viewportWidth = width;
            }
        }
        console.log("================", this);
        this.resizeCallback(width, height);
    }
    initialize() {
        this.window.graphWindow.body.append(this.canvas);
        this.canvas.className = "graphCanvas";
    }
    queueRedraw() {
        this.hasQueuedRedraw = true;
    }
    postRedraw() {
        if (this.hasQueuedRedraw) {
            this.hasQueuedRedraw = false;
            this.redraw();
        }
    }
    handOffControl() {
        this.locked = true;
    }
    regainControl() {
        this.locked = false;
    }
}
