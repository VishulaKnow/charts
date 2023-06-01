import { DataOptions } from "../../../config/config";
import { DataScope } from "../../model";
import { DataRepositoryModel } from "./dataRepository";

export const DEFAULT_MAX_RECORDS_AMOUNT = 50;

export class DataModelInstance {
    repository: DataRepositoryModel;

    private options: DataOptions;
    private maxRecordsAmount = DEFAULT_MAX_RECORDS_AMOUNT;
    private scope: DataScope;

    constructor() {
        this.repository = new DataRepositoryModel();
    }

    initOptions(options: DataOptions) {
        this.options = options;
    }

    initMaxRecordsAmount(amount: number) {
        if (typeof amount === "number" && amount > 0) {
            this.maxRecordsAmount = amount;
        }
    }

    getMaxRecordsAmount() {
        return this.maxRecordsAmount;
    }

    initScope(scope: DataScope) {
        this.scope = scope;
    }

    getScope() {
        return this.scope;
    }

    getAllowableKeys() {
        return this.getScope().allowableKeys;
    }

    getAllKeys(): string[] {
        return this.repository.getRawRows().map(row => row[this.options.keyField.name]);
    }
}