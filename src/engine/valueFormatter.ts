import { Formatter } from "../designer/designerConfig";

export class ValueFormatter {
    private static format: Formatter;

    public static formatField(fieldFormat: string, value: any): string {
        return this.format(value, { type: fieldFormat });
    }

    public static setFormatFunction(formatFunction: Formatter): void {
        this.format = formatFunction;
    }
}
