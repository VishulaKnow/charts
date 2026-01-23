import { ChartNotation, Size } from "../../../config/config";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { LegendBlockModel, LegendPosition, Orient } from "../../../model/model";
import { Helper } from "../../helpers/helper";
import { Legend, LegendContentRenderingOptions } from "./legend";
import { LegendHelperService } from "./legendHelperService";

export interface LegendCoordinate {
	x: number;
	y: number;
	height: number;
	width: number;
}

export class LegendHelper {
	static service = new LegendHelperService();

	public static getMaxItemWidth(
		legendBlockWidth: string,
		marginsLeft: number[],
		itemsDirection: LegendItemsDirection
	): number {
		if (itemsDirection === "row") {
			const sumOfMargins = Helper.getSumOfNumeric(marginsLeft);
			return (parseFloat(legendBlockWidth) - sumOfMargins) / marginsLeft.length;
		}

		return parseFloat(legendBlockWidth);
	}

	public static getSumOfItemsWidths(itemsWidth: number[], marginsLeft: number[]): number {
		let sumOfItemsWidth = Helper.getSumOfNumeric(itemsWidth);
		sumOfItemsWidth += Helper.getSumOfNumeric(marginsLeft);

		return sumOfItemsWidth;
	}

	public static getLegendCoordinateByPosition(
		legendPosition: Orient,
		legendBlockModel: LegendBlockModel,
		blockSize: Size
	): LegendCoordinate {
		const legendModel = legendBlockModel.coordinate[legendPosition];

		const coordinate: LegendCoordinate = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};

		if (legendPosition === "left" || legendPosition === "right") {
			coordinate.y = legendModel.margin.top + legendModel.pad;
			coordinate.width = legendModel.size;
			coordinate.height = blockSize.height - legendModel.margin.top - legendModel.margin.bottom;
		} else if (legendPosition === "bottom" || legendPosition === "top") {
			coordinate.x = legendModel.margin.left;
			coordinate.width = blockSize.width - legendModel.margin.left - legendModel.margin.right;
			coordinate.height = legendModel.size;
		}

		if (legendPosition === "left") coordinate.x = legendModel.margin.left;
		else if (legendPosition === "right")
			coordinate.x = blockSize.width - legendModel.size - legendModel.margin.right;
		else if (legendPosition === "top") coordinate.y = legendModel.margin.top + legendModel.pad;
		else if (legendPosition === "bottom")
			coordinate.y = blockSize.height - legendModel.size - legendModel.margin.bottom;

		return coordinate;
	}

	public static getContentRenderingOptions(
		chartNotation: ChartNotation,
		legendPosition: LegendPosition,
		legendBlockModel: LegendBlockModel
	): LegendContentRenderingOptions {
		const itemsDirection: LegendItemsDirection = this.service.getLegendItemsDirection(legendPosition);
		const legendLabelClass = this.getLegendClassByChartNotation(chartNotation);
		const centeredCssClass = "legend-block-centered";

		return {
			wrapperClasses: [
				Legend.legendBlockClass,
				chartNotation === "2d" ? centeredCssClass : itemsDirection === "column" ? centeredCssClass : "",
				this.service.getWrapperClassByItemsDirection(itemsDirection),
				this.service.getWrapperClassByWrappingItems(legendPosition, chartNotation)
			],
			shouldCropLabels: chartNotation === "2d",
			blockModel: legendBlockModel,
			itemsOptions: {
				markerClass: Legend.markerClass,
				labelClass: this.service.getLegendLabelClassByPosition(legendPosition, chartNotation, legendLabelClass),
				wrapperClasses: [Legend.itemClass, this.service.getItemClasses(itemsDirection)]
			}
		};
	}

	private static getLegendClassByChartNotation(chartNotation: ChartNotation): string {
		const legendClasses: Record<ChartNotation, string> = {
			"2d": Legend.label2DClass,
			polar: Legend.labelPolarClass,
			sunburst: Legend.labelPolarClass
		};

		return `${Legend.labelClass} ${legendClasses[chartNotation]}`;
	}
}
