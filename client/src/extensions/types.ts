interface XYWorkerPayload {
    action: "payload" | "halt",
    config: { [key: string]: any },
    responseId: number,
    sharedMemory: SharedArrayBuffer,
    height: number,
    width: number,
    onlyX: boolean,
    translate: {
        x: number,
        y: number
    },
    scale: number,
    scaleY: number,
    x: {
        xIndexStart: number,
        start: number,
        end: number,
    },
    counter: Uint32Array,
    workerId: number,
    stopId: number,
    numberOfGraphs: number | undefined,
    shouldAnimateRedraws: boolean
}