import { DataOptions, MdtChartsDataSource, MdtChartsField, MdtChartsFieldName } from "../../../config/config";

export class DataRepositoryModel {
    private rawFullSource: MdtChartsDataSource;
    private scopedFullSource: MdtChartsDataSource;

    private sourceName: string;
    private keyField: MdtChartsField;
    private valueFields: MdtChartsField[];

    initOptions(options: DataOptions, valueFields: MdtChartsField[]) {
        this.sourceName = options.dataSource;
        this.keyField = options.keyField;
        this.valueFields = valueFields;
    }

    getValuesByKeyField() {
        return this.getRawRows().map(dataRow => dataRow[this.keyField.name]);
    }

    getBiggestValueAndDecremented(segmentedFields?: MdtChartsFieldName[][]): [number, number] {
        const values: number[] = [];
        this.getRawRows().forEach(row => {
            if (!segmentedFields) {
                this.valueFields.forEach(vf => values.push(row[vf.name]));
                return;
            }
            segmentedFields.forEach(fields => {
                const valuesBySegment = fields.reduce<number>((acc, f) => acc + row[f], 0);
                values.push(valuesBySegment);
            })
        });
        const biggest = Math.max(...values);
        return [biggest, biggest - 1];
    }

    initRawFullSource(rawSource: MdtChartsDataSource) {
        this.rawFullSource = rawSource;
    }

    getRawRows() {
        return this.rawFullSource[this.sourceName];
    }

    getFirstRow() {
        return this.rawFullSource[this.sourceName][0];
    }

    initScopedFullSource(scopedSource: MdtChartsDataSource) {
        this.scopedFullSource = scopedSource;
    }

    getScopedFullSource() {
        return this.scopedFullSource;
    }

    getScopedRows() {
        return this.scopedFullSource[this.sourceName];
    }
}