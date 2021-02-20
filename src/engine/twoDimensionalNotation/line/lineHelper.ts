import { line, Line as ILine } from 'd3-shape';
import { Orient, BlockMargin, DataRow } from "../../../model/model";
import { Scales, Scale } from "../../features/scale/scale";

export class LineHelper
{
    public static getLineGenerator(keyAxisOrient: Orient, scales: Scales, keyFieldName: string, valueFieldName: string, margin: BlockMargin): ILine<DataRow> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return line<DataRow>()
                .x(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.left)
                .y(d => scales.scaleValue(d[valueFieldName]) + margin.top);
        }

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return line<DataRow>()
                .x(d => scales.scaleValue(d[valueFieldName]) + margin.left)
                .y(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.top);
        }
    }

    public static getSegmentedLineGenerator(keyAxisOrient: Orient, scales: Scales, keyFieldName: string, margin: BlockMargin): ILine<DataRow> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return line<DataRow>()
                .x(d => Scale.getScaleKeyPoint(scales.scaleKey, d.data[keyFieldName]) + margin.left)
                .y(d => scales.scaleValue(d[1]) + margin.top);
        }

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return line<DataRow>()
                .x(d => scales.scaleValue(d[1]) + margin.left)
                .y(d => Scale.getScaleKeyPoint(scales.scaleKey, d.data[keyFieldName]) + margin.top);
        }
    }
}