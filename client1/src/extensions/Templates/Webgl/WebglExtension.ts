import { GraphExtension } from "../../../utils/GraphExtension.js";
import { GraphWindow } from "../../../utils/GraphWindow.js";

let Iterations = 500;
let AA = 1;
let shaderProgram;
let squareVertexPositionBuffer;
let itemSize = 3;
let numItems = 4;
let vertexPositionAttribute;


export class WebglExtension extends GraphExtension {
    window: GraphWindow;
    hasIndependentCanvas = true;

    webGLCanvas = document.createElement("canvas");
    webGLCtx: WebGL2RenderingContext;
    squareVertexPositionBuffer: WebGLBuffer;

    shaderProgram: WebGLProgram;

    viewportHeight: number;
    viewportWidth: number;


    constructor(window: GraphWindow) {
        super(window);
        this.webGLCanvas.height = this.canvas.height;
        this.webGLCanvas.width = this.canvas.width;

        document.body.append(this.webGLCanvas);

        this.window = window;
        this.initialise();
        this.resize(window.graphInstance.width, window.graphInstance.height);
    }


    async resizeCallback(width: number, height: number): Promise<void> {

    };

    async getShader(id) {
        let source = "";
        const gl = this.webGLCtx;

        if (id === "vs") {
            source += await (await fetch("https://localhost:3000/extensions/Templates/Webgl/vertex_shader.vert")).text();
        } else {
            source += await (await fetch("https://localhost:3000/extensions/Templates/Webgl/fragment_shader.frag")).text();
        }

        var shader;
        if (id !== "vs") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }

        // Constants that are passed by "preprocessing"
        source =
            "#define ITERATIONS " + Iterations + "\n" +
            "#define ANTIALIAS " + AA + "\n" +
            source;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        return shader;
    }



    async initShaders() {
        "use strict";
        const gl = this.webGLCtx;
        var fragmentShader = await this.getShader("fs");
        var vertexShader = await this.getShader("vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);
        vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "position");
        gl.enableVertexAttribArray(vertexPositionAttribute);

        // To debug HLSL code. Requires recent chromium build and --enable-privileged-webgl-extensions
        // if (gl.getExtension("WEBGL_debug_shaders")) {
        // document.getElementById("src").innerHTML = gl.getExtension("WEBGL_debug_shaders").getTranslatedShaderSource(fragmentShader);
        // }
    }

    initBuffers() {
        const gl = this.webGLCtx;
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        var vertices = [
            +1.0, +1.0, +0.0,
            -1.0, +1.0, +0.0,
            +1.0, -1.0, +0.0,
            -1.0, -1.0, +0.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        itemSize = 3;
        numItems = 4;
    }

    async redraw() {
        const scale = this.window.graphInstance.scale;
        const translateX = -this.window.graphInstance.translate.x;
        const translateY = this.window.graphInstance.translate.y;
        const scaleInverse = 1 / scale;
        const scaleYInverse = 1 / this.window.graphInstance.scaleY;
        const gl = this.webGLCtx;

        gl.uniform1f(gl.getUniformLocation(shaderProgram, "width"), this.viewportWidth);
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "height"), -this.canvas.height);
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "scale"), Math.fround(scaleInverse));
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "scaleD"), (scaleInverse) - Math.fround(scaleInverse));
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "scaleY"), Math.fround(scaleYInverse));
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "scaleYD"), (scaleYInverse) - Math.fround(scaleYInverse));

        gl.uniform2f(
            gl.getUniformLocation(shaderProgram, "center"),
            Math.fround(translateX),
            Math.fround(translateY)
        );

        gl.uniform2f(gl.getUniformLocation(shaderProgram, "centerD"), translateX - Math.fround(translateX), translateY - Math.fround(translateY));
        gl.uniform1f(gl.getUniformLocation(shaderProgram, "zoom"), this.window.graphInstance.scale);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "Iterations"), 3);
        gl.uniform2f(gl.getUniformLocation(shaderProgram, "center2"), 0, 0);

        gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, numItems);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
            this.webGLCanvas,
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    async initialise() {
        this.window.graphWindow.body.append(this.canvas);
        this.canvas.className = "graphCanvas";
        var canvas = this.webGLCanvas;

        try {
            this.webGLCtx = canvas.getContext("webgl2", { antialias: false, depth: false, premultipliedAlpha: false });
            this.viewportWidth = canvas.width;
            this.viewportHeight = canvas.height;
        } catch (e) {
        }


        if (!this.webGLCtx) {
            alert("Could not initialise WebGL.");
        }

        await this.initShaders();
        this.initBuffers();
        this.webGLCtx.clearColor(0.0, 0.0, 0.0, 1.0);
    }
}