let pickerLib: Promise<typeof import ("office-ui-fabric-react/lib/components/pickers")>;
export async function getPickerLib() {
    if (!pickerLib) {
        pickerLib = Promise.all([
            import ("office-ui-fabric-react/lib/components/pickers"),
            import ("office-ui-fabric-react/lib/Icons"),
        ]).then(async ([pickers, icons]) => {
            icons.initializeIcons();
            return pickers;
        });
    }
    return pickerLib;
}
let checkboxLib: Promise<typeof import ("office-ui-fabric-react/lib/components/Checkbox")>;
export async function getCheckboxLib() {
    if (!checkboxLib) {
        checkboxLib = import ("office-ui-fabric-react/lib/components/Checkbox");
    }
    return checkboxLib;
}
let focusZoneLib: Promise<typeof import ("office-ui-fabric-react/lib/FocusZone")>;
export async function getFocusZoneLib() {
    if (!focusZoneLib) {
        focusZoneLib = import ("office-ui-fabric-react/lib/FocusZone");
    }
    return focusZoneLib;
}
let textFieldLib: Promise<typeof import ("office-ui-fabric-react/lib/components/TextField")>;
export async function getTextFieldLib() {
    if (!textFieldLib) {
        textFieldLib = import ("office-ui-fabric-react/lib/components/TextField");
    }
    return textFieldLib;
}
