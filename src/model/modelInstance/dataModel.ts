import { DataScope } from "../model";

export const DEFAULT_MAX_RECORDS_AMOUNT = 50;

export class DataModelInstance {
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