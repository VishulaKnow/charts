import { DataOptions } from "../../../config/config";
import { DataScope } from "../../model";
import { DataRepositoryModel } from "./dataRepository";

export const DEFAULT_MAX_RECORDS_AMOUNT = 50;

export class DataModelInstance {
    readonly repository: DataRepositoryModel;

    private maxRecordsAmount = DEFAULT_MAX_RECORDS_AMOUNT;
    private scope: DataScope;

    constructor() {
        this.repository = new DataRepositoryModel();
    }

    initMaxRecordsAmount(amount: number) {
        if (typeof amount === "number" && amount > 0) {
            this.maxRecordsAmount = amount;
        }
        if (typeof amount === "number" && amount === -1) {
            this.maxRecordsAmount = Infinity;
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
}
