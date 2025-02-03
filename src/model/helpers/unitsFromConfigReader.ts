import { UnitsFromConfig } from "../model";
import { UnitsReader } from "./unitsReader";

export function getPxPercentUnitByValue(value: number | string) {
	const unitsReader = new UnitsReader();
	const defaultUnit: UnitsFromConfig = "px";
	const units: UnitsFromConfig[] = ["%", "px"];
	return unitsReader.getUnitByValue(value, defaultUnit, units);
}
