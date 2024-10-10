import { area, Area as IArea } from 'd3-shape';
import { MdtChartsDataRow, Size } from '../../../config/config';
import { BlockMargin, Orient } from "../../../model/model";
import { Scales, Scale } from "../../features/scale/scale";

export class AreaHelper {
    public static getGroupedAreaGenerator(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string, valueFieldName: string, blockSize: Size): IArea<MdtChartsDataRow> {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top')
            return area<MdtChartsDataRow>()
                .x(d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.left)
                .y0(d => scales.value(0) + margin.top)
                .y1(d => scales.value(d[valueFieldName]) + margin.top);
        if (keyAxisOrient === 'left' || keyAxisOrient === 'right')
            return area<MdtChartsDataRow>()
                .x0(d => scales.value(0) + margin.left)
                .x1(d => scales.value(d[valueFieldName]) + margin.left)
                .y(d => Scale.getScaledValue(scales.key, d[keyFieldName]) + margin.top);
    }

    public static getSegmentedAreaGenerator(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyFieldName: string): IArea<MdtChartsDataRow> {
        if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return area<MdtChartsDataRow>()
                .x(d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.left)
                .y0(d => scales.value(d[0]) + margin.top)
                .y1(d => scales.value(d[1]) + margin.top);
        }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return area<MdtChartsDataRow>()
                .x0(d => scales.value(d[0]) + margin.left)
                .x1(d => scales.value(d[1]) + margin.left)
                .y(d => Scale.getScaledValue(scales.key, d.data[keyFieldName]) + margin.top);
        }
    }
}