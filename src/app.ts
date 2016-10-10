import {MultiValueCombo} from "./MultiValueCombo";
import {IdentityPicker} from "./IdentityPicker";
import {BaseMultiValueControl} from "./BaseMultiValueControl";
import * as WitExtensionContracts  from "TFS/WorkItemTracking/ExtensionContracts";

var control: BaseMultiValueControl;

var provider = () => {
    var ensureControl = () => {
        if (!control) {
            var inputs: IDictionaryStringTo<string> = VSS.getConfiguration().witInputs;
            var controlType: string = inputs["InputMode"];
            if (controlType) {
                switch(controlType.toUpperCase()) {
                    case "IDENTITY":
                        control = new IdentityPicker();
                        break;
                    default:
                        control = new MultiValueCombo();
                        break;
                }
            }
            else {
                control = new MultiValueCombo();
            }

            control.initialize();
        }

        control.invalidate();
    };

    return {
        onLoaded: (args: WitExtensionContracts.IWorkItemLoadedArgs) => {
            ensureControl();
        },
        onUnloaded: (args: WitExtensionContracts.IWorkItemChangedArgs) => {
            control.clear();
        },
        onFieldChanged: (args: WitExtensionContracts.IWorkItemFieldChangedArgs) => {
            if (args.changedFields[control.fieldName] !== undefined && args.changedFields[control.fieldName] !== null) {
                control.invalidate();
            }
        }
    }
};

VSS.register(VSS.getContribution().id, provider);

