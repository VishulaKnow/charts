import { MdtChartsDataSource } from "../../../config/config";

export class DataRepositoryModel {
    private rawFullSource: MdtChartsDataSource;
    private scopedFullSource: MdtChartsDataSource;

    private sourceName: string;

    initSourceName(sourceName: string) {
        this.sourceName = sourceName;
    }

    initRawFullSource(rawSource: MdtChartsDataSource) {
        this.rawFullSource = rawSource;
    }

    getRawRows() {
        return this.rawFullSource[this.sourceName];
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