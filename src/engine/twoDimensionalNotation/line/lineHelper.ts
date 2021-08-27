import { line, Line as ILine } from 'd3-shape';
import { MdtChartsDataRow } from '../../../config/config';
import { Orient, BlockMargin } from "../../../model/model";
import { Scales, Scale } from "../../features/scale/scale";

export class LineHelper {
    public static getLineGenerator(keyAxisOrient: Orient, scales: Scales, keyFieldName: string, valueFieldName: string, margin: BlockMargin): ILine<MdtChartsDataRow> {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return line<MdtChartsDataRow>()
                .x(d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.left)
                .y(d => scales.value(d[valueFieldName]) + margin.top);
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return line<MdtChartsDataRow>()
                .x(d => scales.value(d[valueFieldName]) + margin.left)
                .y(d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.top);
        }
    }

    public static getSegmentedLineGenerator(keyAxisOrient: Orient, scales: Scales, keyFieldName: string, margin: BlockMargin): ILine<MdtChartsDataRow> {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return line<MdtChartsDataRow>()
                .x(d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.left)
                .y(d => scales.value(d[1]) + margin.top);
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return line<MdtChartsDataRow>()
                .x(d => scales.value(d[1]) + margin.left)
                .y(d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.top);
        }
    }
}