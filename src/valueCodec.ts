/**
 * Shared parser/serializer for semicolon-delimited field values.
 */
export function parseMultiValueFieldValue(value: unknown): string[] {
    if (typeof value !== "string") {
        return [];
    }

    return value
        .split(";")
        .map((item) => item.trim())
        .filter((item) => !!item);
}

export function serializeMultiValueFieldValue(values: string[]): string {
    return values
        .map((value) => value.trim())
        .filter((value) => !!value)
        .join(";");
}
