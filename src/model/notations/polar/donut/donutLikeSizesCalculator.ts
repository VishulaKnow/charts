import { Size } from "../../../../config/config";
import { BlockMargin, DonutChartTranslateModel } from "../../../model";

export function getDonutLikeOuterRadius(margin: BlockMargin, blockSize: Size): number {
	return Math.min(blockSize.width - margin.left - margin.right, blockSize.height - margin.top - margin.bottom) / 2;
}

export function getDonutLikeTranslate(margin: BlockMargin, blockSize: Size): DonutChartTranslateModel {
	return {
		x: (blockSize.width - margin.left - margin.right) / 2 + margin.left,
		y: (blockSize.height - margin.top - margin.bottom) / 2 + margin.top
	};
}
