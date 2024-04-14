interface lyapConfig {
    theta1: number,
    theta2: number,
    maxIteration: number
};

function square(num: number) {
    return num * num;
}

function quarterRoot(num: number) {
    return Math.sqrt(Math.sqrt(num));
}

export class lyapunovExponent {
    f: Function;
    g: Function;
    uf: Function;
    vg: Function;
    maxIteration: number;

    constructor(config: lyapConfig) {
        this.maxIteration = config.maxIteration;
        this.f = (x: number, y: number, c1: number, c2: number) => ((1 - config.theta1) * x + config.theta1 * Math.pow((quarterRoot(y / Math.pow(c1, 2)) - Math.sqrt(y)), 2));
        this.g = (x: number, y: number, c1: number, c2: number) => ((1 - config.theta2) * y + config.theta2 * Math.pow((quarterRoot(x / Math.pow(c2, 2)) - Math.sqrt(x)), 2));
        this.uf = (x: number, y: number, u: number, v: number, c1: number, c2: number) => (1 - config.theta1) * u + config.theta1 * ((-3 * Math.sqrt(y) * quarterRoot(y / Math.pow(c1, 2)) + Math.pow(y / Math.pow(c1, 2), 1 / 2) + 2 * y) / (2 * y)) * v;
        this.vg = (x: number, y: number, u: number, v: number, c1: number, c2: number) => (1 - config.theta2) * v + config.theta2 * ((-3 * Math.sqrt(x) * quarterRoot(x / Math.pow(c2, 2)) + Math.pow(x / Math.pow(c2, 2), 1 / 2) + 2 * x) / (2 * x)) * u;
    }

    lyapunovExponentFx(a: number, b: number) {
        const K = 2000;
        let x = (b * b) / square(square(a + b)) + 10e-10;
        let y = (a * a) / square(square(a + b)) + 10e-10;

        let u = 0.5;
        let v = 0.5;

        let lastU = u;
        let lastV = v;

        for (var i = 1; i <= K; i++) {
            const x1 = x;
            const y1 = y;
            const u1 = u;
            const v1 = v;

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

        const val = (Math.log(Math.abs(u) + Math.abs(v)) / K);

        if (isNaN(val)) {
            return -1;
        } else {
            return val;
        }

    }
}