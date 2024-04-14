import { XYExtension } from "../../Templates/XY/XYExtension.js";
export class Newton extends XYExtension {
    usesOnlyX = false;
    config = {
        colors: {
            0: [
                173,
                216,
                230,
                255
            ],
            1: [
                255,
                255,
                143,
                255
            ],
            2: [
                255,
                255,
                255,
                255
            ],
            3: [
                0,
                0,
                0,
                255
            ]
        },
        maxIteration: 200
    };
    getWorkerCode() {
        // const maxIteration = ;
        function float2(x, y) {
            return [
                x,
                y
            ];
        }
        const roots = [
            float2(1, 0),
            float2(-0.5, Math.sqrt(3) / 2),
            float2(-0.5, -Math.sqrt(3) / 2)
        ];
        function cdiv(z1, z2) {
            const x = z1[0], y = z1[1], a = z2[0], b = z2[1];
            return [
                (a * x + b * y) / (a * a + b * b),
                (a * y - b * x) / (a * a + b * b)
            ];
        }
        function func(z) {
            return cdif(cmul(cmul(z, z), z), float2(1, 0));
        }
        function cmul(z1, z2) {
            const a = z1[0], b = z1[1], c = z2[0], d = z2[1];
            return [
                a * c - b * d,
                a * d + b * c
            ];
        }
        function cadd(z1, z2) {
            const a = z1[0], b = z1[1], c = z2[0], d = z2[1];
            return [
                a + c,
                b + d
            ];
        }
        function cdif(z1, z2) {
            const a = z1[0], b = z1[1], c = z2[0], d = z2[1];
            return [
                a - c,
                b - d
            ];
        }
        function Derivative(z) {
            return cmul([
                3,
                0
            ], cmul(z, z));
        }
        function cal(x, y) {
            // modify result
            // the first value of the result is the colorId
            // the second value is the intensity of the color. Must
            // be between 0 and 255, and an Integer
            let z = [
                x,
                y
            ]; //z is originally set to the pixel coordinates
            let iteration = 0;
            for(; iteration < payload.config.maxIteration; iteration++){
                // console.log(z)
                const diff = cdiv(func(z), Derivative(z));
                if (typeof diff === "number" && isNaN(diff)) {
                    break;
                }
                z = cdif(z, cdiv(func(z), Derivative(z))); //cdiv is a function for dividing complex numbers
                const tolerance = 0.000001;
                for(let i = 0; i < roots.length; i++){
                    const difference = cdif(z, roots[i]);
                    //If the current iteration is close enough to a root, color the pixel.
                    if (Math.abs(difference[0]) < tolerance && Math.abs(difference[1]) < tolerance) {
                        return payload.config.colors[i];
                    }
                }
            }
            return [
                0,
                0,
                0,
                255
            ];
        }
    }
}
