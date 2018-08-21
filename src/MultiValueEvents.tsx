import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { getSuggestedValues } from "./getSuggestedValues";
import { MultiValueControl } from "./MultiValueControl";

initializeIcons();
export class MultiValueEvents {
    public readonly fieldName = VSS.getConfiguration().witInputs.FieldName;
    private readonly _container = document.getElementById("container") as HTMLElement;
    private _onRefreshed: () => void;
    /** Counter to avoid consuming own changed field events. */
    private _fired: number = 0;

    public async refresh(selected?: string[]): Promise<void> {
        if (!selected) {
            if (this._fired) {
                this._fired--;
                return;
            }
            selected = await this._getSelected();
        }
        ReactDOM.render(<MultiValueControl
            selected={selected}
            options={await getSuggestedValues()}
            onSelectionChanged={this._setSelected}
            width={this._container.scrollWidth}
            placeholder={selected.length ? "Click to Add" : "No selection made"}
            onResize={this._resize}
        />, this._container, () => {
            this._resize();
            if (this._onRefreshed) {
                this._onRefreshed();
            }
        });
    }
    private _resize = () => {
        VSS.resize(this._container.scrollWidth, this._container.scrollHeight);
    }
    private async _getSelected(): Promise<string[]> {
        const formService = await WorkItemFormService.getService();
        const value = await formService.getFieldValue(this.fieldName);
        if (typeof value !== "string") {
            return [];
        }
        return value.split(";").filter((v) => !!v);
    }
    private _setSelected = async (values: string[]): Promise<void> => {
        this.refresh(values);
        this._fired++;
        const formService = await WorkItemFormService.getService();
        formService.setFieldValue(this.fieldName, values.join(";"));
        return new Promise<void>((resolve) => {
            this._onRefreshed = resolve;
        });
    }
}
