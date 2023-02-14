/// <reference types="vss-web-extension-sdk" />

import * as WitExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { MultiValueEvents } from "./MultiValueEvents";

// save on ctr + s
$(window).bind("keydown", (event: JQueryEventObject) => {
    if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which) === "S") {
            event.preventDefault();
            WorkItemFormService.getService().then((service) => service.beginSaveWorkItem($.noop, $.noop));
        }
    }
});

const provider = () => {
    let control: MultiValueEvents;

    const ensureControl = () => {
        if (!control) {
            control = new MultiValueEvents();
        }
        control.refresh();
    };


    

    return {
        onLoaded: (args: WitExtensionContracts.IWorkItemLoadedArgs) => {
            ensureControl();
        },
        onFieldChanged: (args: WitExtensionContracts.IWorkItemFieldChangedArgs) => {
            if (control && args.changedFields[control.fieldName] !== undefined &&
                args.changedFields[control.fieldName] !== null
            ) {
                control.refresh();
            }
        },
    };
};

VSS.register(VSS.getContribution().id, provider);
