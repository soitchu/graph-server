import { XLineExtension } from "../../Templates/XLine/XLineExtension.js";

export class SimpleGraph extends XLineExtension {
    getWorkerCode(): void {
        function calX(x: number): number {
            // let iterations = 1000;

            // for (let i = 0; i < iterations; i++) {
            //     x = x - (x ** 3 - 4 * x) / (3 * x * x - 4);
            // }

            return x ** 2;
        }
    }
}