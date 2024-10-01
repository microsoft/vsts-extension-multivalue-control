import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

export async function getSuggestedValues(): Promise<string[]> {
    const inputs: IDictionaryStringTo<string> = VSS.getConfiguration().witInputs;
    const valuesString: string = inputs.Values;
    if (valuesString) {
        return valuesString.split(";").filter((v) => !!v).map(s => s.trim());
    }
    // if the values input were not specified as an input, get the suggested values for the field.
    const service = await WorkItemFormService.getService();
    const allowedValues = await service.getAllowedFieldValues(VSS.getConfiguration().witInputs.FieldName) as string[];

    // getAllowedFieldValues API now returns both predefined and user-selected values.
    // When multiple options are selected, these are stored as a semicolon-separated string.
    // Filter out these user-selected values to prevent them from showing up as separate options.
    return allowedValues.filter((value) => value.indexOf(";") === -1);
}
