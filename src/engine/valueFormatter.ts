import { DataType, Formatter } from '../designer/designerConfig';

export class ValueFormatter {
    private static format: Formatter;

    public static formatValue(valueType: DataType, value: string): string {
        return this.format[valueType](value);
    }

    public static setFormatFunction(formatFunction: Formatter): void {
        this.format = formatFunction;
    }

    public static getValueOrZero(value: number): number {
        return value > 0 ? value : 0;
    }
}