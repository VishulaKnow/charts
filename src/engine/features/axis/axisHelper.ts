import { axisTop, axisBottom, axisLeft, axisRight, AxisScale, Axis as IAxis } from 'd3-axis';
import { AxisModelOptions, Orient, ScaleKeyModel, ScaleValueModel } from "../../../model/model";
import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { AxisLabelHelper } from './axisLabelDomHelper';

const MINIMAL_STEP_SIZE = 60;
export class AxisHelper {
    public static getAxisByOrient(orient: Orient, scale: AxisScale<any>): IAxis<any> {
        if (orient === 'top')
            return axisTop(scale);
        if (orient === 'bottom')
            return axisBottom(scale);
        if (orient === 'left')
            return axisLeft(scale);
        if (orient === 'right')
            return axisRight(scale);
    }


    public static setLabelsSettings(axisGenerator: IAxis<any>, range: number[], scaleOptions: ScaleValueModel): void {
        const axisLength = range[1] - range[0];
        let ticksAmount: number;
        if (axisLength / 10 < MINIMAL_STEP_SIZE) {
            if (Math.floor(axisLength / MINIMAL_STEP_SIZE) > 2) {
                ticksAmount = Math.floor(axisLength / MINIMAL_STEP_SIZE);
                axisGenerator.ticks(Math.floor(axisLength / MINIMAL_STEP_SIZE));
            }
            else {
                ticksAmount = 2;
                axisGenerator.tickValues([min(scaleOptions.domain), max(scaleOptions.domain)]);
            }
        }
        if (scaleOptions.type === 'linear') {
            this.setNumTickFormat(axisGenerator, scaleOptions.formatter);
        }
    }

    public static getBaseAxisGenerator(axisOptions: AxisModelOptions, scale: AxisScale<any>): IAxis<any> {
        const axisGenerator = AxisHelper.getAxisByOrient(axisOptions.orient, scale);
        if (!axisOptions.ticks.flag)
            this.removeTicks(axisGenerator);
        AxisLabelHelper.setAxisLabelPaddingByOrient(axisGenerator, axisOptions);
        return axisGenerator;
    }

    private static removeTicks(axis: IAxis<any>): void {
        axis.tickSize(0);
    }

    private static setNumTickFormat(axis: IAxis<any>, formatter?: (v: number) => string): void {
        const defaultFormatter = format('~s');
        axis.tickFormat(formatter ?? defaultFormatter);
    }
}