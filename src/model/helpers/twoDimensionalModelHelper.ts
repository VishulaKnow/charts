import {
	ChartOrientation,
	MdtChartsDataRow,
	MdtChartsTwoDimensionalChart,
	MdtChartsTwoDimensionalValueLabels
} from "../../config/config";
import {
	GradientDef,
	MarkDotDatumItem,
	Orient,
	TwoDimensionalChartModel,
	TwoDimensionalValueLabels,
	ValueLabelsChartBlock,
	ValueLabelsStyleModel
} from "../model";
import { getGradientId } from "../../model/notations/twoDimensional/styles";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { BoundingRect } from "../../engine/features/valueLabelsCollision/valueLabelsCollision";
import {
	hasCollisionBottomSide,
	hasCollisionLeftSide,
	hasCollisionRightSide,
	hasCollisionTopSide,
	shiftCoordinateXLeft,
	shiftCoordinateXRight,
	shiftCoordinateYBottom,
	shiftCoordinateYTop
} from "../featuresModel/valueLabelsModel/valueLabelsModel";

export class TwoDimensionalModelHelper {
	public static forceMarkerShow(
		chart: MdtChartsTwoDimensionalChart,
		dataRows: MdtChartsDataRow[],
		valueFieldName: string,
		currentRow: MarkDotDatumItem,
		keyFieldName: string
	): boolean {
		if (chart.markers.show || dataRows.length === 1) return true;

		const rowIndex = dataRows.findIndex((row) => row[keyFieldName] === (currentRow as any)[keyFieldName]);

		if (rowIndex === -1) return false;

		const isFirst = rowIndex === 0;
		const isLast = rowIndex === dataRows.length - 1;

		const previousRow = dataRows[rowIndex - 1];
		const nextRow = dataRows[rowIndex + 1];

		const hasNullNeighborsRows =
			!isFirst && !isLast && previousRow?.[valueFieldName] === null && nextRow?.[valueFieldName] === null;

		return (
			(isFirst && nextRow?.[valueFieldName] === null) ||
			(isLast && previousRow?.[valueFieldName] === null) ||
			hasNullNeighborsRows
		);
	}

	public static getGradientDefs(
		charts: TwoDimensionalChartModel[],
		keyAxisOrient: Orient,
		chartOrient: ChartOrientation,
		chartBlockId: number
	): GradientDef[] {
		let gradients: GradientDef[] = [];

		charts.forEach((chart) => {
			if (chart.type === "area" && chart.areaViewOptions.fill.type === "gradient") {
				chart.style.elementColors?.forEach((elementColor, subIndex) => {
					const gradientId = getGradientId(chart.index, subIndex, chartBlockId);

					gradients.push({
						id: gradientId,
						position: {
							x1: 0,
							y1: 0,
							x2: chartOrient === "horizontal" ? 1 : 0,
							y2: chartOrient === "horizontal" ? 0 : 1
						},
						items: this.getGradientItems(gradientId, elementColor, keyAxisOrient)
					});
				});
			}
		});

		return gradients;
	}

	private static getGradientItems(gradientId: string, elementColor: string, keyAxisOrient: Orient) {
		return [0, 1].map((itemIndex) => ({
			id: gradientId + `-item-${itemIndex}`,
			color: this.getGradientItemColor(itemIndex, keyAxisOrient, elementColor),
			offset: itemIndex,
			opacity: this.calculateOpacityItem(itemIndex, keyAxisOrient)
		}));
	}

	private static calculateOpacityItem(itemIndex: number, orientation: Orient): number {
		const maxOpacity = 0.3;
		const minOpacity = 0;

		if (orientation === "bottom" || orientation === "right") return itemIndex === 0 ? maxOpacity : minOpacity;
		else return itemIndex === 0 ? minOpacity : maxOpacity;
	}

	private static getGradientItemColor(itemIndex: number, orientation: Orient, elementColor: string): string {
		const maxColor = elementColor;
		const minColor = "white";

		if (orientation === "bottom" || orientation === "right") return itemIndex === 0 ? maxColor : minColor;
		else return itemIndex === 0 ? minColor : maxColor;
	}

	public static getValueLabels(
		valueLabels: MdtChartsTwoDimensionalValueLabels,
		canvasModel: CanvasModel,
		chartOrientation: ChartOrientation,
		styleModel: ValueLabelsStyleModel
	): TwoDimensionalValueLabels {
		const blockSidesOptions = this.getChartBlockSidesOptions(canvasModel);

		const chartBlockConfig = {
			vertical: {
				left: {
					mode: "shift",
					hasCollision: blockSidesOptions.hasCollisionLeft,
					shiftCoordinate: blockSidesOptions.shiftToRight
				},
				right: {
					mode: "shift",
					hasCollision: blockSidesOptions.hasCollisionRight,
					shiftCoordinate: blockSidesOptions.shiftToLeft
				},
				top: {
					mode: "none"
				},
				bottom: {
					mode: "none"
				}
			} as ValueLabelsChartBlock,
			horizontal: {
				left: {
					mode: "none"
				},
				right: {
					mode: "none"
				},
				top: {
					mode: "shift",
					hasCollision: blockSidesOptions.hasCollisionTop,
					shiftCoordinate: blockSidesOptions.shiftBottom
				},
				bottom: {
					mode: "shift",
					hasCollision: blockSidesOptions.hasCollisionBottom,
					shiftCoordinate: blockSidesOptions.shiftTop
				}
			} as ValueLabelsChartBlock
		};

		return {
			collision: {
				otherValueLables: valueLabels?.collision?.otherValueLabels ?? {
					mode: "none"
				},
				chartBlock: chartBlockConfig[chartOrientation]
			},
			style: styleModel
		};
	}

	private static getChartBlockSidesOptions(canvasModel: CanvasModel) {
		return {
			hasCollisionLeft: (labelClientRect: BoundingRect) =>
				hasCollisionLeftSide(labelClientRect, canvasModel.getMargin()),
			shiftToLeft: (labelClientRect: BoundingRect) =>
				shiftCoordinateXLeft(labelClientRect, canvasModel.getBlockSize(), canvasModel.getMargin()),
			hasCollisionRight: (labelClientRect: BoundingRect) =>
				hasCollisionRightSide(labelClientRect, canvasModel.getBlockSize(), canvasModel.getMargin()),
			shiftToRight: (labelClientRect: BoundingRect) =>
				shiftCoordinateXRight(labelClientRect, canvasModel.getMargin()),
			hasCollisionTop: (labelClientRect: BoundingRect) =>
				hasCollisionTopSide(labelClientRect, canvasModel.getMargin()),
			shiftTop: (labelClientRect: BoundingRect) => shiftCoordinateYTop(labelClientRect),
			hasCollisionBottom: (labelClientRect: BoundingRect) =>
				hasCollisionBottomSide(labelClientRect, canvasModel.getBlockSize(), canvasModel.getMargin()),
			shiftBottom: (labelClientRect: BoundingRect) => shiftCoordinateYBottom(labelClientRect)
		};
	}
}
