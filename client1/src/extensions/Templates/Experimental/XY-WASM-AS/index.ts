const result = new Uint8Array(8294400);
const val = new Uint8Array(4);
const MAX_ITERATION: u64 = 500;

export function getOffset(): Uint8Array
{
    return result;
}

export function  cal(x: f64, y: f64): void
{
    const z: Array<f64> = [0, 0];
    let n: u64 = 0, d: f64 = 0;
    const p: Array<f64> = [0, 0];

    do {
        const sq1 = z[0] * z[0];
        const sq2 = z[1] * z[1];

        p[0] = sq1 - sq2;
        p[1] = 2 * z[0] * z[1];

        z[0] = p[0] + x;
        z[1] = p[1] + y;

        d = sq1 + sq2;
        n += 1;
    } while (d <= 4 && n < MAX_ITERATION);

    if (d <= 2)
    {
        val[0] = 0;
    }
    else
    {
        val[0] = 255;
    }

    val[1] = 255;
    val[2] = 255;
    val[3] = (255 * (n / MAX_ITERATION)) as u32;
}


export function calc(canvasWidth: i32, canvasHeight: i32, translateX: f64, translateY: f64, scale: f64, scaleY: f64, start: i32, end: i32): void {
    for (let i: i32 = start; i < end; i++)
    {
        for (let j: i32 = 0; j < canvasHeight; j++)
        {
            cal((i as f64) / scale - translateX,
                -((j as f64) / scale - translateY) / scaleY );

            const pixelPos: i32 = (j * canvasWidth + i) * 4;

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

