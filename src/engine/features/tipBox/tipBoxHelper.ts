import { AxisScale } from "d3-axis";
import { ChartOrientation, Size } from "../../../config/config";
import { BlockMargin, ScaleKeyType } from "../../../model/model";
import { Scale } from "../scale/scale";

export class TipBoxHelper {
    public static getKeyValueByPointer(pointer: [number, number], chartOrient: ChartOrientation, margin: BlockMargin, blockSize: Size, scaleKey: AxisScale<any>, scaleKeyType: ScaleKeyType): string {
        const index = TipBoxHelper.getKeyIndex(pointer, chartOrient, margin, blockSize, scaleKey, scaleKeyType);
        let keyValue = scaleKey.domain()[index];
        if (index >= scaleKey.domain().length)
            keyValue = scaleKey.domain()[scaleKey.domain().length - 1];

        return keyValue;
    }

    public static getKeyIndex(pointer: [number, number], chartOrient: ChartOrientation, margin: BlockMargin, blockSize: Size, scaleKey: AxisScale<any>, scaleKeyType: ScaleKeyType): number {
        const pointerAxisType = chartOrient === 'vertical' ? 0 : 1; // 0 - координата поинтера по оси x, 1 - по оси y
        const marginByOrient = chartOrient === 'vertical' ? margin.left : margin.top;
        const scaleStep = Scale.getScaleStep(scaleKey);

        if (scaleKeyType === 'point') {
            return this.getKeyIndexOfPoint(pointer, scaleStep, marginByOrient, pointerAxisType);
        } else {
            return this.getKeyIndexOfBand(pointer, scaleStep, marginByOrient, pointerAxisType, blockSize, margin, chartOrient, scaleKey);
        }
    }

    private static getKeyIndexOfPoint(pointer: [number, number], scaleStep: number, marginByOrient: number, pointerAxisType: 0 | 1): number {
        const point = pointer[pointerAxisType] - marginByOrient + scaleStep / 2;
        if (point < 0)
            return 0;

        return Math.floor(point / scaleStep);
    }

    private static getKeyIndexOfBand(pointer: [number, number], scaleStep: number, marginByOrient: number, pointerAxisType: 0 | 1, blockSize: Size, margin: BlockMargin, chartOrient: ChartOrientation, scaleKey: AxisScale<any>): number {
        const chartBlockSizeByDir = chartOrient === 'vertical'
            ? blockSize.width - margin.left - margin.right
            : blockSize.height - margin.top - margin.bottom;

        const outerPadding = chartBlockSizeByDir - scaleStep * scaleKey.domain().length;

        if (pointer[pointerAxisType] - marginByOrient - 1 < outerPadding / 2)
            return 0; // Самый первый элемент
        if (pointer[pointerAxisType] - marginByOrient - 1 + outerPadding / 2 > chartBlockSizeByDir)
            return scaleKey.domain().length - 1; // последний индекс

        const point = pointer[pointerAxisType] - outerPadding / 2 - marginByOrient - 1;

        return Math.floor(point / scaleStep);
    }
}