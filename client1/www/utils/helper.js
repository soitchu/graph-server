export function drawGraphXOld(canvas, ctx, lineData) {
    const height = canvas.height;
    const viewHeight = 2 * height;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    for(let j = 0; j < lineData.length; j += 4){
        let x1 = lineData[j + 0], y1 = lineData[j + 1], x2 = lineData[j + 2], y2 = lineData[j + 3];
        if (x1 === x2) {
            continue;
        }
        // When the value of the line's coords is insanely high,
        // The canvas doesn't render any of the lines, so if the
        // slope is greater than a threshold value (viewHeight), 
        // or in other words, the line travels more than the height
        // of the canvas between two horizontal pixels then we clamp 
        // the value. viewHeight is set to height * 2
        if (Math.abs(y1) > viewHeight || Math.abs(y2) > viewHeight) {
            const slope = (y2 - y1) / (x2 - x1);
            if (Math.abs(slope) > viewHeight) {
                y1 = Math.max(0, Math.min(y1, height));
                y2 = Math.max(0, Math.min(y2, height));
            }
        }
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.stroke();
}
export function drawGraphX(canvas, ctx, lineData, legacyMode = true) {
    const height = canvas.height;
    const viewHeight = 2 * height;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    let sectionLength = 2;
    if (legacyMode) {
        sectionLength = 4;
    }
    const graphNums = lineData.length / (sectionLength * canvas.width);
    const offset = legacyMode ? 0 : -2;
    for(let i = 0; i < graphNums; i++){
        const start = i * sectionLength * canvas.width + (legacyMode ? 0 : 2);
        const end = (i + 1) * sectionLength * canvas.width;
        let lastYCoord = undefined;
        for(let j = start; j < end; j += sectionLength){
            let x1 = lineData[j + offset], y1 = lineData[j + offset + 1], x2 = lineData[j + offset + 2], y2 = lineData[j + offset + 3];
            if (isNaN(y1) || isNaN(y2)) {
                continue;
            }
            // if (legacyMode) {
            //     x1 = lineData[j];
            //     y1 = lineData[j + 1];
            //     x2 = lineData[j + 2];
            //     y2 = lineData[j + 3];
            // }
            if (lastYCoord !== undefined && (y1 >= 0 || y2 >= 0) && (y1 <= height || y2 <= height)) {} else {
                lastYCoord = y2;
                continue;
            }
            if (x1 === x2) {
                continue;
            }
            // When the value of the line's coords is insanely high,
            // The canvas doesn't render any of the lines, so if the
            // slope is greater than a threshold value (viewHeight), 
            // or in other words, the line travels more than the height
            // of the canvas between two horizontal pixels then we clamp 
            // the value. viewHeight is set to height * 2
            if (Math.abs(y1) > viewHeight || Math.abs(y2) > viewHeight) {
                const slope = (y2 - y1) / (x2 - x1);
                if (Math.abs(slope) > viewHeight) {
                    y1 = Math.max(0, Math.min(y1, height));
                    y2 = Math.max(0, Math.min(y2, height));
                }
            }
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
    }
    ctx.stroke();
}
function pointOnLine(m, c, x) {
    return m * x + c;
}
export function drawLines(coords, graphInstance) {
    const ctx = graphInstance.frontCtx;
    const height = graphInstance.height;
    const width = graphInstance.width;
    ctx.beginPath();
    graphInstance.toDrawGraphs.drawGraphX = [];
    for(let i = 0; i < coords.length; i += 4){
        const index = i;
        const startCoords = graphInstance.graphToCanvasCoords(coords[index], coords[index + 1]);
        const endCoords = graphInstance.graphToCanvasCoords(coords[index + 2], coords[index + 3]);
        // const slope = (endCoords[1] - startCoords[1]) / (endCoords[0] - startCoords[0]);
        // const constant = -slope * (startCoords[0]) + startCoords[1];
        // if (endCoords[0] > width) {
        //     endCoords[0] = width;
        //     endCoords[1] = slope * width + constant;
        // }
        // if (startCoords[0] < 0) {
        //     startCoords[0] = 0;
        //     startCoords[1] = constant;
        // }
        // if (endCoords[1] < 0) {
        //     startCoords[0] = 0;
        //     startCoords[1] = constant;
        // }
        ctx.moveTo(startCoords[0], startCoords[1]);
        ctx.lineTo(endCoords[0], endCoords[1]);
    // graphInstance.toDrawGraphs.drawGraphX.push({
    //     type: "drawGraphX",
    //     xFunc: (x) => -slope * x,
    //     yFunc: (y) => y,
    //     constraintsX: (x) => true,
    //     constraintsY: (x) => true
    // });
    // console.log(startCoords, endCoords, slope);
    }
    ctx.stroke();
} // Object { x: -1.9999999999999871, y: 2.0000000000000164, iniX: -1.9999999999999842, iniY: 2.00000000000001 }
 // 19476348759159660
