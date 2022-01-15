import { DataScope } from "../model";

export class DataManagerModelService {
    getMaximumPossibleAmount(keys: string[], maxPossibleAmount: number): DataScope {
        if (maxPossibleAmount >= keys.length) {
            return {
                allowableKeys: keys,
                hidedRecordsAmount: 0
            }
        } else {
            return {
                allowableKeys: keys.slice(0, maxPossibleAmount),
                hidedRecordsAmount: keys.length - maxPossibleAmount
            }
        }
    }

    limitAllowableKeys(allowableKeys: string[], hidedRecordsAmount: number, globalRecordsMaxAmount: number): DataScope {
        if (allowableKeys.length <= globalRecordsMaxAmount) {
            return {
                allowableKeys,
                hidedRecordsAmount
            }
        }
        return {
            allowableKeys: allowableKeys.slice(0, globalRecordsMaxAmount),
            hidedRecordsAmount: hidedRecordsAmount + allowableKeys.length - globalRecordsMaxAmount
        }
    }
}