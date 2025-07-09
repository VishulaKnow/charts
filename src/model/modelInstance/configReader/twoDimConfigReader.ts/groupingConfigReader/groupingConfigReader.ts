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

export interface GroupingItemSize {
	orient: Orient;
	size: number;
}

export class GroupingConfigReader {
	private readonly maxLabelSize = 60;

	constructor(
		private readonly keyAxisOptions: DiscreteAxisOptions,
		private readonly chartOrientation: ChartOrientation,
		private readonly groupingOptions?: TwoDimGroupingOptions
	) {}

	isEnabled(): boolean {
		return !!this.groupingOptions && this.groupingOptions.items.length > 0;
	}

	getSlicesSizesByOrients(dataRows: MdtChartsDataRow[]) {
		const slices: GroupingItemSize[] = [];

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
