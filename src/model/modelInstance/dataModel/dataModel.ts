import { DataScope } from "../../model";
import { DataRepositoryModel } from "./dataRepository";

export const DEFAULT_MAX_RECORDS_AMOUNT = 50;

export class DataModelInstance {
    repository: DataRepositoryModel;

    constructor() {
        this.repository = new DataRepositoryModel();
    }

    //TODO: create dataScopeModel. 
    private maxRecordsAmount = DEFAULT_MAX_RECORDS_AMOUNT;
    private scope: DataScope;

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
}