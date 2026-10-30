import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { parseMultiValueFieldValue } from "./valueCodec";

export async function getSuggestedValues(): Promise<string[]> {
    const inputs: IDictionaryStringTo<string> = VSS.getConfiguration().witInputs;
    const valuesString: string = inputs.Values;
    if (valuesString) {
        return parseMultiValueFieldValue(valuesString);
    }
    // if the values input were not specified as an input, get the suggested values for the field.
    const service = await WorkItemFormService.getService();
    const allowedValues = await service.getAllowedFieldValues(VSS.getConfiguration().witInputs.FieldName) as string[];
    return allowedValues.filter((value) => value.indexOf(";") === -1);
}
