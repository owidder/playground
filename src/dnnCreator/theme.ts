let themeName: string = "material";

export const setTheme = (_themeName: string) => {
    themeName = _themeName;
}

const themes = {
    leftRightButton: {
        material: "mdl-button mdl-js-button mdl-button--icon"
    }
}

export const getClasses = (componentName: string): string => {
    return themes[componentName][themeName];
}
