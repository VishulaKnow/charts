import { AxisLabelPosition, MdtChartsDataRow, MdtChartsShowAxisLabelRule, ShowTickFn } from "../../config/config";

export const showAllTicks: ShowTickFn = (d) => d;

export class AxisModelService {
	getKeyAxisLabelPosition(
		chartBlockWidth: number,
		scopedDataLength: number,
		positionFromConfig?: AxisLabelPosition
	): AxisLabelPosition {
		if (positionFromConfig === "rotated" || positionFromConfig === "straight") {
			return positionFromConfig;
		}

		const minBandSize = 50;
		if (chartBlockWidth / scopedDataLength < minBandSize) return "rotated";

		return "straight";
	}
}

export class AxisModelTickCalculator {
	private readonly defaultTickSpace = 20;

	constructor(private readonly dataRows: MdtChartsDataRow[], private readonly rule?: MdtChartsShowAxisLabelRule) {}

	createFunctionCalculator(axisSize: number): ShowTickFn {
		if (this.rule?.showTickFn) return this.rule.showTickFn;

		const tickSpace = this.rule?.spaceForOneLabel ?? this.defaultTickSpace;

		const allowedKeysAmount = Math.floor(axisSize / tickSpace);

		if (allowedKeysAmount >= this.dataRows.length) return showAllTicks;

		let divider = Math.ceil(this.dataRows.length / allowedKeysAmount);
		return (d, i) => {
			return i % divider === 0 ? d : undefined;
		};
	}
}
