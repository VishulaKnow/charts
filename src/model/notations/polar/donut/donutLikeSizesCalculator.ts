import { Size } from "../../../../config/config";
import { BlockMargin } from "../../../model";

export function getDonutLikeOuterRadius(margin: BlockMargin, blockSize: Size): number {
	return Math.min(blockSize.width - margin.left - margin.right, blockSize.height - margin.top - margin.bottom) / 2;
}
