import { XLineExtension } from "../../Templates/XLine/XLineExtension.js";

export class LyapunovExtension extends XLineExtension {
    getWorkerCode(): void {
        function calX(x: number) {
            function quarterRoot(num: number) {
                return Math.sqrt(Math.sqrt(num));
            }

            function square(num: number) {
                return num * num;
            }

            class lyapunovExponent {
                f: (x: any, y: any, c1: any, c2: any) => number;
                g: (x: any, y: any, c1: any, c2: any) => number;
                uf: (x: any, y: any, u: any, v: any, c1: any, c2: any) => number;
                vg: (x: any, y: any, u: any, v: any, c1: any, c2: any) => number;

                constructor(config) {
                    //   this.f = (x,y,a,b) => 1 + y - a*x*x;
                    //   this.g = (x,y,a,b) => b*x;
                    //   this.uf = (x,y,u,v,a,b) => -2*a*x*u + v;
                    //   this.vg = (x,y,u,v,a,b) => b*u;


                    this.f = (x, y, c1, c2) => ((1 - config.theta1) * x + config.theta1 * Math.pow((quarterRoot(y / Math.pow(c1, 2)) - Math.sqrt(y)), 2));
                    this.g = (x, y, c1, c2) => ((1 - config.theta2) * y + config.theta2 * Math.pow((quarterRoot(x / Math.pow(c2, 2)) - Math.sqrt(x)), 2));

                    this.uf = (x, y, u, v, c1, c2) => (1 - config.theta1) * u + config.theta1 * ((-3 * Math.sqrt(y) * quarterRoot(y / Math.pow(c1, 2)) + Math.pow(y / Math.pow(c1, 2), 1 / 2) + 2 * y) / (2 * y)) * v;
                    this.vg = (x, y, u, v, c1, c2) => (1 - config.theta2) * v + config.theta2 * ((-3 * Math.sqrt(x) * quarterRoot(x / Math.pow(c2, 2)) + Math.pow(x / Math.pow(c2, 2), 1 / 2) + 2 * x) / (2 * x)) * u;


                    // this.g = (x,y,a,b) => (1 - config.theta1)*x + config.theta1*Math.pow(Math.pow(y/Math.pow(a,2),(1/4)) - Math.sqrt(y), 2);
                    // this.f = (x,y,a,b) => (1 - config.theta2)*y + config.theta2*Math.pow(Math.pow(x/Math.pow(b,2),(1/4)) - Math.sqrt(x), 2);
                    // this.uf = (x,y,u,v,a,b) => 0*u + ((1/2)*Math.sqrt(1/(b*y)) - 1)*v;
                    // this.vg = (x,y,u,v,a,b) => 0*v + ((1/2)*Math.sqrt(1/(a*x)) - 1)*u;



                }

                lyapunovExponentFx(a: number, b: number) {
                    let K = 2000;
                    let x = square(b) / square(square(a + b)) + 10e-10;
                    let y = square(a) / square(square(a + b)) + 10e-10;

                    let u = 0.5;
                    let v = 0.5;

                    let lastU = u;
                    let lastV = v;
                    // console.log("Start");
                    for (var i = 1; i <= K; i++) {
                        let x1 = x;
                        let y1 = y;
                        let u1 = u;
                        let v1 = v;
                        x = this.f(x1, y1, a, b);
                        y = this.g(x1, y1, a, b);
                        u = this.uf(x1, y1, u1, v1, a, b);
                        v = this.vg(x1, y1, u1, v1, a, b);

                        if ((!isFinite(u) || !isFinite(v)) && !isNaN(u) && !isNaN(v)) {
                            u = lastU;
                            v = lastV;
                            break;
                        }

                        lastU = u;
                        lastV = v;

                    }
                    // console.log("End");


                    // console.log(u,v,a,b);
                    let val = (Math.log(Math.abs(u) + Math.abs(v)) / K);
                    // console.log("here", Math.abs(u) + Math.abs(v), K);
                    if (isNaN(val)) {
                        return -1;
                    } else {
                        return val;
                    }

                }


                mean(result) {
                    let sum = 0;
                    for (var i = 0; i < result.length; i++) {
                        sum += result[i];

                    }

                    return (sum / result.length);
                }

                logdFdx(x, a, b, result, dfx, self) {
                    return Math.log(Math.abs(dfx(x, a, b, result)));
                }

            }
            // let iterations = 1000;

            // for (let i = 0; i < iterations; i++) {
            //     x = x - (x ** 3 - 4 * x) / (3 * x * x - 4);
            // }

            // console.log();
            const l = new lyapunovExponent(payload.config);
            YValues.push(l.lyapunovExponentFx(x, 1));
            // return x ** 2;
        }
    }
}

