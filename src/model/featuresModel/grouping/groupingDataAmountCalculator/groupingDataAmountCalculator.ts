import { MdtChartsBaseField, MdtChartsDataRow } from "../../../../config/config";
import { GroupingLabelKey } from "../../../model";
import { KeyScaleCanvasSizes } from "../../scaleModel/sizaCalculators/scaleCanvasSizesCalculator";

interface GroupingCanvasCalculatorOptions {
	dataRows: MdtChartsDataRow[];
	field: MdtChartsBaseField;
}

export class GroupingDataAmountCalculator {
	constructor(private readonly options: GroupingCanvasCalculatorOptions) {}

	calculate(): {
		rowsCountsPerGroups: number[];
		groupDomain: GroupingLabelKey[];
	} {
		const domainWithRowsCount: Map<GroupingLabelKey, number> = new Map();

		this.options.dataRows.forEach((row) => {
			const key = row[this.options.field.name];
			if (key) {
				if (domainWithRowsCount.has(key)) domainWithRowsCount.set(key, domainWithRowsCount.get(key)! + 1);
				else domainWithRowsCount.set(key, 1);
			}
		});

		const rowsCounts = Array.from(domainWithRowsCount.values());

		return {
			rowsCountsPerGroups: rowsCounts,
			groupDomain: Array.from(domainWithRowsCount.keys())
		};
	}
}
