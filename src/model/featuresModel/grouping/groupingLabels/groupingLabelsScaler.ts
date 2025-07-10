import { scaleOrdinal } from "d3-scale";
import { GroupingLabelKey } from "../../../model";
import { GroupingCanvasCalculator } from "../groupingCanvasCalculator/groupingCanvasCalculator";

interface GroupingLabelsCoordinateScalerOptions {
	groupingCanvasCalculator: GroupingCanvasCalculator;
}

export type KeyScaleInfoForGroupingLabelsScaler =
	| {
			type: "band";
			keyAxisOuterPadding: number;
			keyAxisInnerPadding: number;
	  }
	| { type: "point" };

export class GroupingLabelsCoordinateScaler {
	private readonly scaleFn: (key: GroupingLabelKey) => number;

	constructor(private readonly options: GroupingLabelsCoordinateScalerOptions) {
		const { keyAxisInnerPadding, keyAxisOuterPadding, oneShareSize, rowsCountsPerGroups, groupDomain } =
			this.options.groupingCanvasCalculator.calculate();

		let previousTotalShares = 0;
		const coordinates: number[] = [];

		for (let rowIndex = 0; rowIndex < rowsCountsPerGroups.length; rowIndex++) {
			const rowsAmount = rowsCountsPerGroups[rowIndex];

			let previousShift = previousTotalShares * (oneShareSize + keyAxisInnerPadding);

			const centerOfDomainItem =
				previousShift +
				(rowsAmount * oneShareSize + (rowsAmount - 1) * keyAxisInnerPadding) / 2 +
				keyAxisOuterPadding;
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
