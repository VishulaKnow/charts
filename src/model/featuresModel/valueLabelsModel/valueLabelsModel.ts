import { BlockMargin, Orient, ValueLabelAnchor, ValueLabelDominantBaseline } from "../../model";
import { BoundingRect } from "../../../engine/features/valueLabelsCollision/valueLabelsCollision";
import { Size, ValueLabelsPositionMode } from "../../../config/config";

interface ValueLabelAlignment {
    dominantBaseline: ValueLabelDominantBaseline
    textAnchor: ValueLabelAnchor
}

export const OFFSET_SIZE_PX = 10;
export const BORDER_OFFSET_SIZE_PX = 2;

export class ValueLabelCoordinateCalculator {
    private readonly offsetSizePx: number;

    constructor(
        positionMode: ValueLabelsPositionMode | undefined,
        private readonly keyAxisOrient: Orient,
        private readonly margin: BlockMargin
    ) {
        this.offsetSizePx = positionMode === "center" ? 0 : OFFSET_SIZE_PX;
    }

    getValueLabelY(scaledValue: number) {
        switch (this.keyAxisOrient) {
            case 'bottom':
                return scaledValue - this.offsetSizePx + this.margin.top;
            case 'top':
                return scaledValue + this.offsetSizePx + this.margin.top;
            default:
                return scaledValue + this.margin.top;
        }
    }

    getValueLabelX(scaledValue: number) {
        switch (this.keyAxisOrient) {
            case 'right':
                return scaledValue - this.offsetSizePx + this.margin.left;
            case 'left':
                return scaledValue + this.offsetSizePx + this.margin.left;
            default:
                return scaledValue + this.margin.left;
        }
    }
}

export function calculateValueLabelAlignment(keyAxisOrient: Orient, positionMode?: ValueLabelsPositionMode): ValueLabelAlignment {
    if (!positionMode || positionMode === "after") {
        switch (keyAxisOrient) {
            case 'top':
                return { dominantBaseline: "hanging", textAnchor: "middle" }
            case "bottom":
                return { dominantBaseline: "auto", textAnchor: "middle" }
            case "left":
                return { dominantBaseline: "middle", textAnchor: "start" }
            case "right":
                return { dominantBaseline: "middle", textAnchor: "end" }
        }
    } else {
        return { dominantBaseline: "middle", textAnchor: "middle" };
    }
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

export function shiftCoordinateXLeft(labelClientRect: BoundingRect): void {
    labelClientRect.x -= labelClientRect.width / 2 + BORDER_OFFSET_SIZE_PX;
}

export function shiftCoordinateXRight(labelClientRect: BoundingRect): void {
    labelClientRect.x += labelClientRect.width / 2 + BORDER_OFFSET_SIZE_PX;
}

export function shiftCoordinateYTop(labelClientRect: BoundingRect): void {
    labelClientRect.y -= labelClientRect.height / 2 + BORDER_OFFSET_SIZE_PX;
}

export function shiftCoordinateYBottom(labelClientRect: BoundingRect): void {
    labelClientRect.y += labelClientRect.height / 2 + BORDER_OFFSET_SIZE_PX;
}