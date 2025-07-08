import { scaleOrdinal } from "d3-scale";
import { MdtChartsBaseField, MdtChartsDataRow } from "../../../config/config";
import { GroupingLabelKey, RangeModel } from "../../model";

interface GroupingLabelsCoordinateScalerOptions {
	dataRows: MdtChartsDataRow[];
	field: MdtChartsBaseField;
	keyAxisOuterPadding: number;
	keyAxisInnerPadding: number;
	range: RangeModel;
}

export class GroupingLabelsCoordinateScaler {
	private readonly scaleFn: (key: GroupingLabelKey) => number;

	constructor(private readonly options: GroupingLabelsCoordinateScalerOptions) {
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
			this.options.keyAxisOuterPadding * 2 -
			this.options.keyAxisInnerPadding * (this.options.dataRows.length - 1);
		const totalShares = Array.from(domainWithRowsCount.values()).reduce((acc, curr) => acc + curr, 0);
		const oneShareSize = rangeOfKeyAxis / totalShares;

		const coordinates: number[] = [];
		let previousTotalShares = 0;

		const rowsCounts = Array.from(domainWithRowsCount.values());
		for (let rowIndex = 0; rowIndex < rowsCounts.length; rowIndex++) {
			const rowsAmount = rowsCounts[rowIndex];

			let previousShift = previousTotalShares * (oneShareSize + this.options.keyAxisInnerPadding);

			const centerOfDomainItem =
				previousShift +
				(rowsAmount * oneShareSize + (rowsAmount - 1) * this.options.keyAxisInnerPadding) / 2 +
				this.options.keyAxisOuterPadding;
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
