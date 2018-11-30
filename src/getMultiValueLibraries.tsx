let pickerLib: Promise<typeof import ("office-ui-fabric-react/lib/components/pickers")>;
export async function getPickerLib() {
    if (!pickerLib) {
        pickerLib = import (/* webpackChunkName: "multivalue_picker" */ "office-ui-fabric-react/lib/components/pickers").then(async (pickers) => {
            const { initializeIcons } = await import (/* webpackChunkName: "multivalue_picker" */ "office-ui-fabric-react/lib/Icons");
            initializeIcons();
            return pickers;
        });
    }
    return pickerLib;
}
let checkboxLib: Promise<typeof import ("office-ui-fabric-react/lib/components/Checkbox")>;
export async function getCheckboxLib() {
    if (!checkboxLib) {
        checkboxLib = import (/* webpackChunkName: "multivalue_picker" */ "office-ui-fabric-react/lib/components/Checkbox");
    }
    return checkboxLib;
}
let focusZoneLib: Promise<typeof import ("office-ui-fabric-react/lib/FocusZone")>;
export async function getFocusZoneLib() {
    if (!focusZoneLib) {
        focusZoneLib = import (/* webpackChunkName: "multivalue_picker" */ "office-ui-fabric-react/lib/FocusZone");
    }
    return focusZoneLib;
}
let textFieldLib: Promise<typeof import ("office-ui-fabric-react/lib/components/TextField")>;
export async function getTextFieldLib() {
    if (!textFieldLib) {
        textFieldLib = import (/* webpackChunkName: "multivalue_picker" */ "office-ui-fabric-react/lib/components/TextField");
    }
    return textFieldLib;
}
