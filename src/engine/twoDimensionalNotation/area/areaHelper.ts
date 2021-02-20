import { area, Area as IArea } from 'd3-shape';
import { BlockMargin, DataRow, Orient, Size } from "../../../model/model";
import { Scales, Scale } from "../../features/scale/scale";

export class AreaHelper {
    public static getGroupedAreaGenerator(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string, valueFieldName: string, blockSize: Size): IArea<DataRow> {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top')
            return area<DataRow>()
                .x(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.left)
                .y0(d => this.getZeroCoordinate(keyAxisOrient, margin, blockSize))
                .y1(d => scales.scaleValue(d[valueFieldName]) + margin.top);
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right')
            return area<DataRow>()
                .x0(d => this.getZeroCoordinate(keyAxisOrient, margin, blockSize))
                .x1(d => scales.scaleValue(d[valueFieldName]) + margin.left,)
                .y(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.top);
    }

    public static getSegmentedAreaGenerator(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string): IArea<DataRow> {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return area<DataRow>()
                .x(d => Scale.getScaleKeyPoint(scales.scaleKey, d.data[keyFieldName]) + margin.left)
                .y0(d => scales.scaleValue(d[0]) + margin.top)
                .y1(d => scales.scaleValue(d[1]) + margin.top);
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return area<DataRow>()
                .x0(d => scales.scaleValue(d[0]) + margin.left)
                .x1(d => scales.scaleValue(d[1]) + margin.left)
                .y(d => Scale.getScaleKeyPoint(scales.scaleKey, d.data[keyFieldName]) + margin.top);
        }
    }

    public static getZeroCoordinate(axisOrient: Orient, margin: BlockMargin, blockSize: Size): number {
        if (axisOrient === 'bottom')
            return blockSize.height - margin.bottom;
        if (axisOrient === 'top')
            return margin.top;

        if (axisOrient === 'left')
            return margin.left;
        if (axisOrient === 'right')
            return blockSize.width - margin.right;
    }
}