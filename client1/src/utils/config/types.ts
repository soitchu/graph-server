type ExtensionConfig = (SliderConfig | NumberConfig | ButtonConfig)[];

interface BaseConfig {
    id: string,
    storeInLocalStorage: boolean,
    onChange?: Function
}

interface SliderConfig extends BaseConfig {
    type: "slider",
    max: number,
    min: number,
    step: number,
    default: number
};

interface NumberConfig extends BaseConfig {
    type: "number",
    default: number,
    value: number
}

interface ButtonConfig extends BaseConfig {
    type: "button",
    value: string,
    callback: Function
}
