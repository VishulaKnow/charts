import { AxisLabelPosition } from "../../config/config";

export class AxisModelService {
    getKeyAxisLabelPosition(chartBlockWidth: number, scopedDataLength: number, positionFromConfig?: AxisLabelPosition): AxisLabelPosition {
        if (positionFromConfig === "rotated" || positionFromConfig === "straight") {
            return positionFromConfig;
        }

        const minBandSize = 50;
        if (chartBlockWidth / scopedDataLength < minBandSize)
            return 'rotated';

        return 'straight';
    }
}