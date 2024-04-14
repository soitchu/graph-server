const gui = new dat.gui.GUI({
    autoPlace: true
} as dat.GUIParams) as dat.GUI;


export class DatConfig {
    folder: { [key: string]: dat.GUI } = {};

    addFolder(name: string) {
        if (name in this.folder) {
            throw new Error(`Folder with name ${name} already exists`);
        }

        this.folder[name] = (gui.addFolder(name));

        return this.folder[name];
    }

    processExtensionConfig(config: ExtensionConfig, folderName: string) {
        let folderGUI: dat.GUI = this.folder[folderName];
        const configObj: { [key: typeof config[number]["id"]]: number } = {};

        if (!folderGUI) folderGUI = this.addFolder(folderName);

        for (let i = 0; i < config.length; i++) {
            const currentConfig = config[i];

            switch (currentConfig.type) {
                case "slider":
                    configObj[currentConfig.id] = currentConfig.default;

                    const elem = folderGUI.add(
                        configObj,
                        currentConfig.id,
                        currentConfig.min,
                        currentConfig.max,
                        currentConfig.step
                    );

                    if (currentConfig.onChange) {
                        elem.onFinishChange(currentConfig.onChange);
                    }


                // folderGUI.add(configObj, currentConfig.id as never, 0, 10, 1);

            }
        }

        return configObj;
    }
}

