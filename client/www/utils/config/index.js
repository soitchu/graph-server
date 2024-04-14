const gui = new dat.gui.GUI({
    autoPlace: true
});
export class DatConfig {
    folder = {};
    addFolder(name) {
        if (name in this.folder) {
            throw new Error(`Folder with name ${name} already exists`);
        }
        this.folder[name] = gui.addFolder(name);
        return this.folder[name];
    }
    processExtensionConfig(config, folderName) {
        let folderGUI = this.folder[folderName];
        const configObj = {};
        if (!folderGUI) folderGUI = this.addFolder(folderName);
        for(let i = 0; i < config.length; i++){
            const currentConfig = config[i];
            switch(currentConfig.type){
                case "slider":
                    configObj[currentConfig.id] = currentConfig.default;
                    const elem = folderGUI.add(configObj, currentConfig.id, currentConfig.min, currentConfig.max, currentConfig.step);
                    if (currentConfig.onChange) {
                        elem.onFinishChange(currentConfig.onChange);
                    }
            }
        }
        return configObj;
    }
}
