import { MdtChartsBaseField, MdtChartsDataRow } from "../../../../config/config";
import { GroupingLabelKey, RangeModel } from "../../../model";
import { KeyScaleInfoForGroupingLabelsScaler } from "../groupingLabels/groupingLabelsScaler";

interface GroupingCanvasCalculatorOptions {
	keyScaleInfo: KeyScaleInfoForGroupingLabelsScaler;
	dataRows: MdtChartsDataRow[];
	field: MdtChartsBaseField;
	range: RangeModel;
}

export class GroupingCanvasCalculator {
	constructor(private readonly options: GroupingCanvasCalculatorOptions) {}

	calculate(): {
		rowsCountsPerGroups: number[];
		oneShareSize: number;
		keyAxisOuterPadding: number;
		keyAxisInnerPadding: number;
		groupDomain: GroupingLabelKey[];
	} {
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

		const rowsCounts = Array.from(domainWithRowsCount.values());

		return {
			rowsCountsPerGroups: rowsCounts,
			oneShareSize,
			keyAxisInnerPadding,
			keyAxisOuterPadding,
			groupDomain: Array.from(domainWithRowsCount.keys())
		};
	}
}
