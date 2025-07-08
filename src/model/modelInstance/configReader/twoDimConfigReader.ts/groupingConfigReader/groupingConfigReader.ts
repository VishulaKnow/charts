import {
	ChartOrientation,
	DiscreteAxisOptions,
	ItemPositionByOrientation,
	MdtChartsBaseField,
	MdtChartsDataRow,
	MdtChartsField,
	TwoDimGroupingItem,
	TwoDimGroupingOptions
} from "../../../../../config/config";
import { AxisModel } from "../../../../featuresModel/axis/axisModel";
import { DominantBaseline, Orient, TextAnchor } from "../../../../model";

export class GroupingConfigReader {
	private readonly maxLabelSize = 60;

	constructor(
		private readonly keyAxisOptions: DiscreteAxisOptions,
		private readonly chartOrientation: ChartOrientation,
		private readonly groupingOptions?: TwoDimGroupingOptions
	) {}

	isEnabled(): boolean {
		return Boolean(this.groupingOptions) && this.groupingOptions!.items.length > 0;
	}

	getSlicesByOrients() {
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

	getSlicesSizesByOrients(dataRows: MdtChartsDataRow[]) {
		const slices: { orient: Orient; size: number }[] = [];

		this.groupingOptions?.items.forEach((item) => {
			const labelsTexts = this.getLabelValuesForItem(item, dataRows);
			const labelSize = AxisModel.getLabelSize(this.maxLabelSize, labelsTexts);
			slices.push({
				orient: this.getLabelOrient(item.labels?.position),
				size: this.chartOrientation === "vertical" ? labelSize.height : labelSize.width
			});
		});

		return slices;
	}

	getPreparedOptions(scopedDatasourceRows: MdtChartsDataRow[]) {
		const groupingItemsValues: {
			domain: string[];
			orient: Orient;
			sideIndex: number;
			field: MdtChartsBaseField;
			textAnchor: TextAnchor;
			dominantBaseline: DominantBaseline;
		}[] = [];

		let keyAxisSideIndex = 0;
		let oppositeKeyAxisSideIndex = 0;

		for (const item of this.groupingOptions?.items ?? []) {
			const labelsPosition = item.labels?.position ?? this.keyAxisOptions.position;
			let orient: Orient = this.getLabelOrient(labelsPosition);

			let sideIndex: number;
			if (labelsPosition === "start") sideIndex = keyAxisSideIndex++;
			else sideIndex = oppositeKeyAxisSideIndex++;

			const textAnchorByOrient: Record<Orient, TextAnchor> = {
				top: "middle",
				bottom: "middle",
				left: "start",
				right: "end"
			};

			const dominantBaselineByOrient: Record<Orient, DominantBaseline> = {
				top: "hanging",
				bottom: "auto",
				left: "middle",
				right: "middle"
			};

			groupingItemsValues.push({
				domain: this.getLabelValuesForItem(item, scopedDatasourceRows),
				orient,
				sideIndex,
				field: item.data.field,
				textAnchor: textAnchorByOrient[orient],
				dominantBaseline: dominantBaselineByOrient[orient]
			});
		}

		return groupingItemsValues;
	}

	private getLabelValuesForItem(item: TwoDimGroupingItem, dataRows: MdtChartsDataRow[]) {
		const values = new Set(dataRows.map((row) => row[item.data.field.name]));
		return Array.from(values);
	}

	private getLabelOrient(labelsPosition?: ItemPositionByOrientation): Orient {
		if (this.chartOrientation === "vertical")
			return this.getLabelPosition(labelsPosition) === "start" ? "top" : "bottom";
		return this.getLabelPosition(labelsPosition) === "start" ? "left" : "right";
	}

	private getLabelPosition(labelsPosition?: ItemPositionByOrientation): ItemPositionByOrientation {
		return labelsPosition ?? this.keyAxisOptions.position;
	}
}
