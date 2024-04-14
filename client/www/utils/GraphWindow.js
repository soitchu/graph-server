export class GraphWindow {
    graphWindow;
    graphInstance;
    reset() {
        const graphInstance = this.graphInstance;
        graphInstance.numberCanvas.style.transform = `none`;
        graphInstance.frontCanvas.style.transform = `none`;
    }
    changeScale(scale) {
        const graphWindow = this.graphWindow;
        const graphInstance = this.graphInstance;
        graphInstance.numberCanvas.style.transform = `scale(${1 / scale})`;
        graphInstance.frontCanvas.style.transform = `scale(${1 / scale})`;
        graphWindow.graph.resize(graphInstance.width * scale, graphInstance.height * scale);
    }
    constructor(config, graphInstance, title){
        // @ts-ignore
        this.graphWindow = new WinBox(title, config);
        this.graphInstance = graphInstance;
        const graphWindow = this.graphWindow;
        var _config_scale;
        const scale = (_config_scale = config.scale) !== null && _config_scale !== void 0 ? _config_scale : 1;
        graphWindow.body.append(graphInstance.numberCanvas);
        graphWindow.body.append(graphInstance.frontCanvas);
        graphInstance.numberCanvas.style.position = "absolute";
        graphInstance.numberCanvas.style.top = "0";
        graphInstance.numberCanvas.style.left = "0";
        graphInstance.numberCanvas.style.pointerEvents = "none";
        graphInstance.numberCanvas.style.transform = `scale(${1 / scale})`;
        graphInstance.frontCanvas.style.transform = `scale(${1 / scale})`;
        if (scale !== 1) {
        // graphWindow.body.style.transform = `scale(${1 / scale})`;
        }
        graphWindow.graph = graphInstance;
        graphWindow.graph.resize(config.width * scale, config.height * scale - graphWindow.h);
        graphWindow.onresize = function(x, y) {
            clearTimeout(graphWindow.timeout);
            graphWindow.timeout = setTimeout(function() {
                graphWindow.graph.resize(x, y - graphWindow.h);
            }, 100);
        };
    }
}
