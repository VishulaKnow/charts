import { BlockMargin, Orient, ValueLabelAnchor, ValueLabelDominantBaseline } from "../../model";
import { BoundingRect } from "../../../engine/features/valueLabelsCollision/valueLabelsCollision";
import { Size } from "../../../config/config";

interface ValueLabelAlignment {
    dominantBaseline: ValueLabelDominantBaseline
    textAnchor: ValueLabelAnchor
}

const OFFSET_SIZE_PX = 10;
const BORDER_OFFSET_SIZE_PX = 2;

export function getValueLabelY(scaledValue: number, keyAxisOrient: Orient, margin: BlockMargin) {
    switch (keyAxisOrient) {
        case 'bottom':
            return scaledValue - OFFSET_SIZE_PX + margin.top;
        case 'top':
            return scaledValue + OFFSET_SIZE_PX + margin.top;
        default:
            return scaledValue + margin.top;
    }
}

export function getValueLabelX(scaledValue: number, keyAxisOrient: Orient, margin: BlockMargin) {
    switch (keyAxisOrient) {
        case 'right':
            return scaledValue - OFFSET_SIZE_PX + margin.left;
        case 'left':
            return scaledValue + OFFSET_SIZE_PX + margin.left;
        default:
            return scaledValue + margin.left;
    }
}

export function calculateValueLabelAlignment(keyAxisOrient: Orient): ValueLabelAlignment  {
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
}

export function hasCollisionLeftSide(labelClientRect: BoundingRect, margin: BlockMargin): boolean {
    return labelClientRect.x <= margin.left;
}

export function hasCollisionRightSide(labelClientRect: BoundingRect, blockSize: Size, margin: BlockMargin): boolean {
    return labelClientRect.x + labelClientRect.width / 2 >= blockSize.width - margin.right;
}

export function shiftCoordinateXLeft(labelClientRect: BoundingRect): void {
    labelClientRect.x -= labelClientRect.width / 2 + BORDER_OFFSET_SIZE_PX;
}

export function shiftCoordinateXRight(labelClientRect: BoundingRect): void {
    labelClientRect.x += + labelClientRect.width / 2 + BORDER_OFFSET_SIZE_PX;
}