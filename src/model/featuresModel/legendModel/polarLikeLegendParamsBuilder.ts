import { MdtChartsDataRow, MdtChartsDataSource } from "../../../config/config";
import { LegendBlockCanvas } from "../../../designer/designerConfig";
import { LegendBlockModel } from "../../model";
import { styledElementValues } from "../../modelBuilder";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { MIN_DONUT_BLOCK_SIZE, PolarModel } from "../../notations/polar/polarModel";
import { LegendCanvasModel, LegendItemContentOptions } from "./legendCanvasModel";
import { LegendPolarMarginCalculator } from "./polarMarginCalculator";

export class PolarLikeLegendParamsBuilder {
	private polarMarginCalculator = new LegendPolarMarginCalculator();

	calculateParamsAndSetMargin(
		modelInstance: ModelInstance,
		valuesInLegend: string[],
		legendBlock: LegendBlockModel,
		legendCanvas: LegendBlockCanvas
	): { shownKeys: string[]; hiddenKeysAmount: number } {
		const canvasModel = modelInstance.canvasModel;

		let position = PolarModel.getLegendPositionByBlockSize(modelInstance.canvasModel);
		let { amount: maxItemsNumber, size } = this.getLegendDataParams(
			position,
			valuesInLegend,
			legendCanvas,
			canvasModel,
			legendBlock
		);

		if (
			position === "right" &&
			!PolarModel.doesChartBlockHasEnoughWidthForContainsLegend(
				canvasModel.getChartBlockWidth(),
				size.width,
				legendBlock.coordinate
			)
		) {
			const doesFreeSpaceExist = PolarModel.doesChartBlockHasEnoughHeightForContainsLegend(
				canvasModel.getChartBlockHeight(),
				legendBlock.coordinate
			);
			if (doesFreeSpaceExist) {
				const newParams = this.getLegendDataParams(
					"bottom",
					valuesInLegend,
					legendCanvas,
					canvasModel,
					legendBlock
				);
				position = "bottom";
				maxItemsNumber = newParams.amount;
				size = newParams.size;
			}
		}

		//TODO: global refactor of method

		const shownKeys = valuesInLegend.slice(0, maxItemsNumber);
		const hiddenKeysAmount = valuesInLegend.length - maxItemsNumber;

		canvasModel.legendCanvas.setPosition(position);
		this.polarMarginCalculator.updateMargin(
			position,
			canvasModel,
			legendBlock,
			position === "bottom" ? size.height : size.width
		);

		return { shownKeys, hiddenKeysAmount };
	}

	//TODO: position type
	private getLegendDataParams(
		position: "bottom" | "right",
		keys: string[],
		legendCanvas: LegendBlockCanvas,
		canvasModel: CanvasModel,
		legendBlock: LegendBlockModel
	) {
		const legendItemContentOptions: LegendItemContentOptions[] = keys.map((k) => ({
			text: k,
			markerSize: styledElementValues.defaultLegendMarkerSizes,
			wrapperSize: { marginRightPx: styledElementValues.legend.inlineDynamicItemWrapperMarginRightPx }
		}));
		if (position === "right") {
			return LegendCanvasModel.findElementsAmountByLegendSize(
				legendItemContentOptions,
				position,
				this.polarMarginCalculator.getMaxLegendWidth(legendCanvas, canvasModel.getBlockSize().width),
				canvasModel.getChartBlockHeight() - legendBlock.coordinate.right.margin.bottom
			);
		} else {
			return LegendCanvasModel.findElementsAmountByLegendSize(
				legendItemContentOptions,
				position,
				canvasModel.getChartBlockWidth() -
					legendBlock.coordinate.bottom.margin.left -
					legendBlock.coordinate.bottom.margin.right,
				canvasModel.getChartBlockHeight() -
					legendBlock.coordinate.bottom.margin.bottom -
					legendBlock.coordinate.bottom.margin.top -
					MIN_DONUT_BLOCK_SIZE
			);
		}
	}
}
