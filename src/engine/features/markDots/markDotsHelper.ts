import { Selection, BaseType } from 'd3-selection';
import { BlockMargin, DataRow, Orient } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { Scale, Scales } from "../scale/scale";
import { DotAttrs, MarkDot } from "./markDot";

export class MarkDotHelper {
    public static getMarkDotForChart(block: Block, chartCssClasses: string[]): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg()
            .selectAll(`.${MarkDot.markerDotClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    public static getDotAttrs(keyAxisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, isSegmented: boolean): DotAttrs {
        const attrs: DotAttrs = { cx: null, cy: null }

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            attrs.cx = d => scales.scaleValue(d[valueField]) + margin.left;
            attrs.cy = d => Scale.getScaledValue(scales.scaleKey, this.getKeyFieldValue(d, keyField, isSegmented)) + margin.top;
        } else if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            attrs.cx = d => Scale.getScaledValue(scales.scaleKey, this.getKeyFieldValue(d, keyField, isSegmented)) + margin.left;
            attrs.cy = d => scales.scaleValue(d[valueField]) + margin.top;
        }

        return attrs;
    }

    public static getKeyFieldValue(row: DataRow, keyFieldName: string, isSegmented: boolean): string {
        return isSegmented ? row.data[keyFieldName] : row[keyFieldName]
    }
}