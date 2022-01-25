import { MdtChartsDataSource } from "../../../config/config";

export class DataRepositoryModel {
    private rawFullSource: MdtChartsDataSource;
    private scopedFullSource: MdtChartsDataSource;

    private sourceName: string;
    private keyFieldName: string;

    initSourceName(sourceName: string) {
        this.sourceName = sourceName;
    }

    initRawFullSource(rawSource: MdtChartsDataSource) {
        this.rawFullSource = rawSource;
    }

    getRawRows() {
        if (!this.sourceName) throw new Error("Source name is not initialized");
        return this.rawFullSource[this.sourceName];
    }

    initScopedFullSource(scopedSource: MdtChartsDataSource) {
        this.scopedFullSource = scopedSource;
    }

    getScopedFullSource() {
        return this.scopedFullSource;
    }
}