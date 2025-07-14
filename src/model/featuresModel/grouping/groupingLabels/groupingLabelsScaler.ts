import { scaleOrdinal } from "d3-scale";
import { GroupingLabelKey } from "../../../model";
import { GroupingDataAmountCalculator } from "../groupingDataAmountCalculator/groupingDataAmountCalculator";
import { ScaleCanvasSizesCalculator } from "../../scaleModel/sizaCalculators/scaleCanvasSizesCalculator";

interface GroupingLabelsCoordinateScalerOptions {
	dataAmountCalculator: GroupingDataAmountCalculator;
	sizesCalculator: ScaleCanvasSizesCalculator;
}

export class GroupingLabelsCoordinateScaler {
	private readonly scaleFn: (key: GroupingLabelKey) => number;

	constructor(private readonly options: GroupingLabelsCoordinateScalerOptions) {
		const { innerPadding, oneKeyPureSize, outerPadding } = this.options.sizesCalculator.calculate();
		const { rowsCountsPerGroups, groupDomain } = this.options.dataAmountCalculator.calculate();

		let previousTotalShares = 0;
		const coordinates: number[] = [];

		for (let rowIndex = 0; rowIndex < rowsCountsPerGroups.length; rowIndex++) {
			const rowsAmount = rowsCountsPerGroups[rowIndex];

			let previousShift = previousTotalShares * (oneKeyPureSize + innerPadding);

			const centerOfDomainItem =
				previousShift + (rowsAmount * oneKeyPureSize + (rowsAmount - 1) * innerPadding) / 2 + outerPadding;
			coordinates.push(centerOfDomainItem);
			previousTotalShares += rowsAmount;
		}

		const d3Scale = scaleOrdinal(groupDomain, coordinates);
		this.scaleFn = (key: GroupingLabelKey) => d3Scale(key);
	}

	scaleForKey(groupingKey: GroupingLabelKey) {
		return this.scaleFn(groupingKey);
	}
}
