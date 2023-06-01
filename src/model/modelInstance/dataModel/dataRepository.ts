import { DataOptions, MdtChartsDataSource, MdtChartsField } from "../../../config/config";

export class DataRepositoryModel {
    private rawFullSource: MdtChartsDataSource;
    private scopedFullSource: MdtChartsDataSource;

    private sourceName: string;
    private keyField: MdtChartsField;

    initOptions(options: DataOptions) {
        this.sourceName = options.dataSource;
        this.keyField = options.keyField;
    }

    getValuesByKeyField() {
        return this.getRawRows().map(dataRow => dataRow[this.keyField.name]);
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