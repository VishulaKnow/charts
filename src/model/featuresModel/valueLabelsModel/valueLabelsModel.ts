import { BlockMargin, Orient } from "../../model";

const OFFSET_SIZE_PX = 10;

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

export function calculateValueLabelAlignment(keyAxisOrient: Orient)  {
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