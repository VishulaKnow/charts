import { UnitsFromConfig } from "../model";

export class UnitsReader {
	getUnitByValue<T extends string = UnitsFromConfig>(value: string | number, defaultUnit: T, units: T[]): T {
		if (typeof value !== "string") return defaultUnit;
		return this.getLastUnitFromString(value, units) || defaultUnit;
	}

	private getLastUnitFromString<T extends string = UnitsFromConfig>(value: string, units: T[]): T {
		let resultUnit: T = null;

		units.forEach((unit) => {
			if (value.endsWith(unit)) resultUnit = unit;
		});

		return resultUnit;
	}
}
