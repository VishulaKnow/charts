import { scaleOrdinal } from "d3-scale";
import { MdtChartsBaseField, MdtChartsDataRow } from "../../../config/config";
import { GroupingLabelKey, RangeModel } from "../../model";

interface GroupingLabelsCoordinateScalerOptions {
	dataRows: MdtChartsDataRow[];
	field: MdtChartsBaseField;
	keyScaleInfo: KeyScaleInfoForGroupingLabelsScaler;
	range: RangeModel;
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
		let keyAxisInnerPadding = 0;
		let keyAxisOuterPadding = 0;
		if (this.options.keyScaleInfo.type === "band") {
			keyAxisInnerPadding = this.options.keyScaleInfo.keyAxisInnerPadding;
			keyAxisOuterPadding = this.options.keyScaleInfo.keyAxisOuterPadding;
		} else {
			keyAxisInnerPadding =
				(this.options.range.end - this.options.range.start) / (this.options.dataRows.length - 1);
			keyAxisOuterPadding = 0;
		}

		const domainWithRowsCount: Map<GroupingLabelKey, number> = new Map();

		this.options.dataRows.forEach((row) => {
			const key = row[this.options.field.name];
			if (key) {
				if (domainWithRowsCount.has(key)) domainWithRowsCount.set(key, domainWithRowsCount.get(key)! + 1);
				else domainWithRowsCount.set(key, 1);
			}
		});

		const rangeOfKeyAxis =
			Math.abs(this.options.range.end - this.options.range.start) -
			keyAxisOuterPadding * 2 -
			keyAxisInnerPadding * (this.options.dataRows.length - 1);
		const totalShares = Array.from(domainWithRowsCount.values()).reduce((acc, curr) => acc + curr, 0);
		const oneShareSize = rangeOfKeyAxis / totalShares;

		const coordinates: number[] = [];
		let previousTotalShares = 0;

		const rowsCounts = Array.from(domainWithRowsCount.values());
		for (let rowIndex = 0; rowIndex < rowsCounts.length; rowIndex++) {
			const rowsAmount = rowsCounts[rowIndex];

			let previousShift = previousTotalShares * (oneShareSize + keyAxisInnerPadding);

			const centerOfDomainItem =
				previousShift +
				(rowsAmount * oneShareSize + (rowsAmount - 1) * keyAxisInnerPadding) / 2 +
				keyAxisOuterPadding;
			coordinates.push(centerOfDomainItem);
			previousTotalShares += rowsAmount;
		}

		const d3Scale = scaleOrdinal(domainWithRowsCount.keys(), coordinates);
		this.scaleFn = (key: GroupingLabelKey) => d3Scale(key);
	}

	scaleForKey(groupingKey: GroupingLabelKey) {
		return this.scaleFn(groupingKey);
	}
}
