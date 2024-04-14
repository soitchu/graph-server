import { XYExtension } from "../../Templates/XY/XYExtension.js";

export class Bifurcation extends XYExtension {
    usesOnlyX = true;

    getWorkerCode() {
        // function calX(x: number) {
        //     YValues.length = 0;

        //     // const map = (x0: number) => x * Math.cos(x0);
        //     const map = (x0: number) => x0 ** 2 + x;

        //     let ini = 0;

        //     if (x < payload.config.cStart && x > payload.config.cEnd) {
        //         for (let i = 0; i < payload.config.end; i++) {
        //             ini = map(ini);

        //             if (i > payload.config.start) {
        //                 YValues.push(ini);
        //             }
        //         }
        //     }
        // }


        function quarterRoot(num) {
            return Math.sqrt(Math.sqrt(num));
        }

        function square(num) {
            return num * num;
        }

        function calX(x: number) {
            // console.log(payload);
            let c1 = x; // n0
            let c2 = 1; // p0
            const nIni = square(c2) / square(square(c1 + c2)) + 10e-10;
            const pIni = square(c1) / square(square(c1 + c2)) + 10e-10;
            const theta1 = payload.config.theta1, theta2 = payload.config.theta2;

            let n = (nt, pt) => {
                return (1 - theta1) * nt + theta1 * Math.pow(quarterRoot(pt / Math.pow(c1, 2)) - Math.sqrt(pt), 2);
            };

            let p = (nt, pt) => {
                return (1 - theta2) * pt + theta2 * Math.pow(quarterRoot(nt / Math.pow(c2, 2)) - Math.sqrt(nt), 2);
            };

            // let n = (nt, pt) => {
            //     return 1 - (x * (nt ** 2)) + pt;
            // };

            // let p = (nt, pt) => {
            //     return 0.3 * nt;
            // };

            let nLast = nIni;
            let pLast = pIni;

            for (let i = 0; i < payload.config.end; i++) {
                let nTemp = n(nLast, pLast);
                let pTemp = p(nLast, pLast);

                if (i > payload.config.start) {
                    YValues.push(pTemp)
                }

                nLast = nTemp;
                pLast = pTemp;
            }
        }
    }
}