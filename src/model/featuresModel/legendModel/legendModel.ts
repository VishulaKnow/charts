import { LegendBlockCanvas } from "../../../designer/designerConfig";
import { getPxPercentUnitByValue } from "../../helpers/unitsFromConfigReader";
import { LegendBlockModel, LegendPosition, Orient } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { MIN_DONUT_BLOCK_SIZE } from "../../notations/polar/polarModel";
import { LegendItemsDirection } from "./legendCanvasModel";

export class LegendModel {
	public static getBaseLegendBlockModel(canvasModel: CanvasModel, legendConfig: LegendBlockCanvas): LegendBlockModel {
		const mt = 20,
			mb = 20,
			ml = 20;

		return {
			coordinate: {
				left: {
					size: 0,
					margin: { top: canvasModel.titleCanvas.getAllNeededSpace(), bottom: mb, left: 0, right: 15 },
					pad: 0
				},
				bottom: {
					size: 0,
					margin: { top: 7, bottom: 0, left: 0, right: 0 },
					pad: 0
				},
				right: {
					size: 0,
					margin: { top: canvasModel.titleCanvas.getAllNeededSpace(), bottom: mb, left: 15, right: 0 },
					pad: 0
				},
				top: {
					size: 0,
					margin: { top: 0, bottom: 10, left: 0, right: 0 },
					pad: canvasModel.titleCanvas.getAllNeededSpace()
				}
			},
			static: {
				maxLinesAmount: legendConfig.static?.maxLinesAmount ?? 3
			}
		};
	}

	static getLegendTotalMargin(position: Orient, legendBlockModel: LegendBlockModel) {
		const legendCoordinate = legendBlockModel.coordinate;

		if (position === "left" || position === "right")
			return legendCoordinate[position].margin.left + legendCoordinate[position].margin.right;
		else return legendCoordinate[position].margin.top + legendCoordinate[position].margin.bottom;
	}
}

export function getMaxLegendWidth(legendCanvas: LegendBlockCanvas, blockWidth: number) {
	const maxWidth = legendCanvas.maxWidth;
	if (typeof maxWidth === "number") return maxWidth;

	const unit = getPxPercentUnitByValue(maxWidth);
	const maxWidthNumber = parseInt(maxWidth);

	if (unit === "px") return maxWidthNumber;
	return (maxWidthNumber / 100) * blockWidth;
}

export function calculateLegendMaxSize(
	legendBlock: LegendBlockModel,
	canvasModel: CanvasModel,
	position: LegendPosition,
	legendCanvas: LegendBlockCanvas
): { width: number; height: number } {
	if (position === "right" || position === "left") {
		return {
			width: getMaxLegendWidth(legendCanvas, canvasModel.getBlockSize().width),
			height: canvasModel.getChartBlockHeight() - legendBlock.coordinate.right.margin.bottom
		};
	}
	if (position === "top" || position === "bottom") {
		return {
			width:
				canvasModel.getChartBlockWidth() -
				legendBlock.coordinate.bottom.margin.left -
				legendBlock.coordinate.bottom.margin.right,
			height:
				canvasModel.getChartBlockHeight() -
				legendBlock.coordinate.bottom.margin.bottom -
				legendBlock.coordinate.bottom.margin.top
		};
	}
	throw new Error(`No legend size for orient: ${position}`);
}
