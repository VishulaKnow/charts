export interface KeyOrientedNotationDataScope {
	hiddenRecordsAmount: number;
	allowableKeys: string[];
}

export class DataManagerModelService {
	getMaximumPossibleAmount(keys: string[], maxPossibleAmount: number): KeyOrientedNotationDataScope {
		if (maxPossibleAmount >= keys.length) {
			return {
				allowableKeys: keys,
				hiddenRecordsAmount: 0
			};
		} else {
			return {
				allowableKeys: keys.slice(0, maxPossibleAmount),
				hiddenRecordsAmount: keys.length - maxPossibleAmount
			};
		}
	}

	limitAllowableKeys(
		allowableKeys: string[],
		hidedRecordsAmount: number,
		globalRecordsMaxAmount: number
	): KeyOrientedNotationDataScope {
		if (allowableKeys.length <= globalRecordsMaxAmount) {
			return {
				allowableKeys,
				hiddenRecordsAmount: hidedRecordsAmount
			};
		}
		return {
			allowableKeys: allowableKeys.slice(0, globalRecordsMaxAmount),
			hiddenRecordsAmount: hidedRecordsAmount + allowableKeys.length - globalRecordsMaxAmount
		};
	}
}
