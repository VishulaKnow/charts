import {
	AxisLabelPosition,
	ChartOrientation,
	DiscreteAxisOptions,
	ItemPositionByOrientation,
	MdtChartsDataRow,
	TwoDimGroupingOptions
} from "../../../../../config/config";
import { Orient } from "../../../../model";

export class GroupingConfigReader {
	constructor(
		private readonly keyAxisOptions: DiscreteAxisOptions,
		private readonly chartOrientation: ChartOrientation,
		private readonly groupingOptions?: TwoDimGroupingOptions
	) {}

	isEnabled(): boolean {
		return Boolean(this.groupingOptions) && this.groupingOptions!.items.length > 0;
	}

	getSlicesByOrients(): { orient: Orient; amount: number }[] {
		const slices: { orient: Orient; amount: number }[] = [];

		const slicesAmountFromKeyAxisSide =
			this.groupingOptions?.items.filter(
				(item) => this.getLabelPosition(item.labels?.position) === this.keyAxisOptions.position
			).length ?? 0;
		const slicesAmountOppositeToKeyAxisSide =
			this.groupingOptions?.items.filter(
				(item) => this.getLabelPosition(item.labels?.position) !== this.keyAxisOptions.position
			).length ?? 0;

		const pushIfAmountIsNotZero = (orient: Orient, amount: number) => {
			if (amount > 0) {
				slices.push({ orient, amount });
			}
		};

		if (this.chartOrientation === "vertical") {
			pushIfAmountIsNotZero(
				"top",
				this.keyAxisOptions.position === "start"
					? slicesAmountFromKeyAxisSide
					: slicesAmountOppositeToKeyAxisSide
			);
			pushIfAmountIsNotZero(
				"bottom",
				this.keyAxisOptions.position === "start"
					? slicesAmountOppositeToKeyAxisSide
					: slicesAmountFromKeyAxisSide
			);
		} else {
			pushIfAmountIsNotZero(
				"left",
				this.keyAxisOptions.position === "start"
					? slicesAmountFromKeyAxisSide
					: slicesAmountOppositeToKeyAxisSide
			);
			pushIfAmountIsNotZero(
				"right",
				this.keyAxisOptions.position === "start"
					? slicesAmountOppositeToKeyAxisSide
					: slicesAmountFromKeyAxisSide
			);
		}
		return slices;
	}

	getPreparedOptions(
		scopedDatasourceRows: MdtChartsDataRow[]
	): { domain: string[]; orient: Orient; sideIndex: number }[] {
		const groupingItemsValues: { domain: string[]; orient: Orient; sideIndex: number }[] = [];

		let keyAxisSideIndex = 0;
		let oppositeKeyAxisSideIndex = 0;

		for (const item of this.groupingOptions?.items ?? []) {
			let orient: Orient;
			const labelsPosition = item.labels?.position ?? this.keyAxisOptions.position;
			if (this.chartOrientation === "vertical") orient = labelsPosition === "start" ? "top" : "bottom";
			else orient = labelsPosition === "start" ? "left" : "right";

			let sideIndex: number;
			if (labelsPosition === "start") sideIndex = keyAxisSideIndex++;
			else sideIndex = oppositeKeyAxisSideIndex++;

			const values = new Set(scopedDatasourceRows.map((row) => row[item.data.field.name]));
			groupingItemsValues.push({ domain: Array.from(values), orient, sideIndex });
		}

		return groupingItemsValues;
	}

	private getLabelPosition(labelsPosition?: ItemPositionByOrientation): ItemPositionByOrientation {
		return labelsPosition ?? this.keyAxisOptions.position;
	}
}
