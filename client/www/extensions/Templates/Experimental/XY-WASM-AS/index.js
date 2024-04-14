const result = new Uint8Array(8294400);
const val = new Uint8Array(4);
const MAX_ITERATION = 500;
export function getOffset() {
    return result;
}
export function cal(x, y) {
    const z = [
        0,
        0
    ];
    let n = 0, d = 0;
    const p = [
        0,
        0
    ];
    do {
        const sq1 = z[0] * z[0];
        const sq2 = z[1] * z[1];
        p[0] = sq1 - sq2;
        p[1] = 2 * z[0] * z[1];
        z[0] = p[0] + x;
        z[1] = p[1] + y;
        d = sq1 + sq2;
        n += 1;
    }while (d <= 4 && n < MAX_ITERATION);
    if (d <= 2) {
        val[0] = 0;
    } else {
        val[0] = 255;
    }
    val[1] = 255;
    val[2] = 255;
    val[3] = 255 * (n / MAX_ITERATION);
}
export function calc(canvasWidth, canvasHeight, translateX, translateY, scale, scaleY, start, end) {
    for(let i = start; i < end; i++){
        for(let j = 0; j < canvasHeight; j++){
            cal(i / scale - translateX, -(j / scale - translateY) / scaleY);
            const pixelPos = (j * canvasWidth + i) * 4;
            if (pixelPos >= 8294400) {
                continue;
            }
            result[pixelPos + 0] = val[0];
            result[pixelPos + 1] = val[1];
            result[pixelPos + 2] = val[2];
            result[pixelPos + 3] = val[3];
        }
    }
}
