import { BlockMargin, Orient, TextAnchor, DominantBaseline } from "../../model";
import { BoundingRect } from "../../../engine/features/valueLabelsCollision/valueLabelsCollision";
import {
	MdtChartsDataRow,
	Size,
	ValueLabelsPositionMode,
	ValueLabelsPositionOptions,
	ValueLabelsRotationOptions,
	ValueLabelsWithOffsetOptions
} from "../../../config/config";

interface ValueLabelAlignment {
	dominantBaseline: DominantBaseline;
	textAnchor: TextAnchor;
}

export const VALUE_LABEL_OFFSET_ABS_SIZE_PX = 10;
export const BORDER_OFFSET_SIZE_PX = 2;

export class ValueLabelCoordinateCalculator {
	private readonly offsetSizePx: number;

	constructor(
		positionOptions: ValueLabelsPositionOptions | undefined,
		private readonly keyAxisOrient: Orient,
		private readonly margin: BlockMargin,
		private readonly isSegmented: boolean,
		private readonly shiftCoordinateByKeyScale: (value: number, fieldIndex: number) => number
	) {
		let offsetAbsSize = VALUE_LABEL_OFFSET_ABS_SIZE_PX;
		if (
			(!positionOptions?.mode ||
				positionOptions?.mode === "beforeHead" ||
				positionOptions?.mode === "afterHead" ||
				positionOptions?.mode === "afterStart") &&
			(positionOptions as ValueLabelsWithOffsetOptions)?.offsetSize != null
		)
			offsetAbsSize = (positionOptions as ValueLabelsWithOffsetOptions).offsetSize!;

		if (!positionOptions?.mode || positionOptions.mode === "afterHead" || positionOptions.mode === "afterStart")
			this.offsetSizePx = offsetAbsSize;
		else if (positionOptions.mode === "beforeHead") this.offsetSizePx = -offsetAbsSize;
		else this.offsetSizePx = 0;
	}

	getValueLabelY(scaledValue: number, fieldIndex: number) {
		switch (this.keyAxisOrient) {
			case "bottom":
				return scaledValue - this.offsetSizePx + this.margin.top;
			case "top":
				return scaledValue + this.offsetSizePx + this.margin.top;
			default:
				return this.shiftCoordinateByKeyScale(
					scaledValue + this.margin.top,
					this.getOverrideFieldIndex(fieldIndex)
				);
		}
	}

	getValueLabelX(scaledValue: number, fieldIndex: number) {
		switch (this.keyAxisOrient) {
			case "right":
				return scaledValue - this.offsetSizePx + this.margin.left;
			case "left":
				return scaledValue + this.offsetSizePx + this.margin.left;
			default:
				return this.shiftCoordinateByKeyScale(
					scaledValue + this.margin.left,
					this.getOverrideFieldIndex(fieldIndex)
				);
		}
	}

	private getOverrideFieldIndex(fieldIndex: number) {
		return this.isSegmented ? 0 : fieldIndex;
	}
}

export function calculateValueLabelAlignment(
	keyAxisOrient: Orient,
	positionMode?: ValueLabelsPositionMode,
	rotation?: ValueLabelsRotationOptions
): ValueLabelAlignment {
	if (rotation?.angle) return { dominantBaseline: "middle", textAnchor: "middle" };

	if (!positionMode || positionMode === "afterHead" || positionMode === "afterStart") {
		switch (keyAxisOrient) {
			case "top":
				return { dominantBaseline: "hanging", textAnchor: "middle" };
			case "bottom":
				return { dominantBaseline: "auto", textAnchor: "middle" };
			case "left":
				return { dominantBaseline: "middle", textAnchor: "start" };
			case "right":
				return { dominantBaseline: "middle", textAnchor: "end" };
		}
	} else if (positionMode === "beforeHead") {
		switch (keyAxisOrient) {
			case "top":
				return { dominantBaseline: "auto", textAnchor: "middle" };
			case "bottom":
				return { dominantBaseline: "hanging", textAnchor: "middle" };
			case "left":
				return { dominantBaseline: "middle", textAnchor: "end" };
			case "right":
				return { dominantBaseline: "middle", textAnchor: "start" };
		}
	}

	return { dominantBaseline: "middle", textAnchor: "middle" };
}

export function handleValueBeforeScale(
	dataRow: MdtChartsDataRow,
	datumField: string,
	isSegmented: boolean,
	positionMode?: ValueLabelsPositionMode
): number {
	if (!positionMode || positionMode === "afterHead" || positionMode === "beforeHead") return dataRow[datumField];
	if (positionMode === "center") {
		if (isSegmented) return dataRow[datumField] - (dataRow[datumField] - dataRow["0"]) / 2;
		return dataRow[datumField] / 2;
	}
	if (positionMode === "afterStart") {
		if (isSegmented) return dataRow["0"];
		return 0;
	}
	throw new Error("Invalid position mode");
}

export function hasCollisionLeftSide(labelClientRect: BoundingRect, margin: BlockMargin): boolean {
	return labelClientRect.x - labelClientRect.width / 2 <= margin.left;
}

export function hasCollisionRightSide(labelClientRect: BoundingRect, blockSize: Size, margin: BlockMargin): boolean {
	return labelClientRect.x + labelClientRect.width / 2 >= blockSize.width - margin.right;
}

export function hasCollisionTopSide(labelClientRect: BoundingRect, margin: BlockMargin): boolean {
	return labelClientRect.y - labelClientRect.height / 2 <= margin.top;
}

export function hasCollisionBottomSide(labelClientRect: BoundingRect, blockSize: Size, margin: BlockMargin): boolean {
	return labelClientRect.y + labelClientRect.height / 2 >= blockSize.height - margin.bottom;
}

export function shiftCoordinateXLeft(labelClientRect: BoundingRect, blockSize: Size, margin: BlockMargin): void {
	const blockRightSide = blockSize.width - margin.right;
	const labelRightSide = labelClientRect.x + labelClientRect.width / 2;
	labelClientRect.x -= labelRightSide - blockRightSide + BORDER_OFFSET_SIZE_PX;
}

export function shiftCoordinateXRight(labelClientRect: BoundingRect, margin: BlockMargin): void {
	const labelLeftSide = labelClientRect.x - labelClientRect.width / 2;
	labelClientRect.x += margin.left - labelLeftSide + BORDER_OFFSET_SIZE_PX;
}

export function shiftCoordinateYTop(labelClientRect: BoundingRect): void {
	labelClientRect.y -= labelClientRect.height / 2 + BORDER_OFFSET_SIZE_PX;
}

export function shiftCoordinateYBottom(labelClientRect: BoundingRect): void {
	labelClientRect.y += labelClientRect.height / 2 + BORDER_OFFSET_SIZE_PX;
}
