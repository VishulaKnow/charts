import { StackedDataFull } from "./dataStacker";

export class DataStackerService {
	getValue0(stackedData: StackedDataFull, vfIndex: number, drIndex: number, valueFromData: number) {
		if (vfIndex === 0) return 0;

		for (let i = vfIndex - 1; i >= 0; i--) {
			if (valueFromData === 0) {
				return stackedData[i][drIndex][1];
			}

			const needed = stackedData[i][drIndex][1] >= 0 === valueFromData >= 0;

			if (needed) {
				return stackedData[i][drIndex][1];
			}
		}

		return 0;
	}

	getValue1(value0: number, valueFromData: number) {
		return value0 + valueFromData;
	}
}
