import { axisTop, axisBottom, axisLeft, axisRight, AxisScale, Axis as IAxis } from 'd3-axis';
import { AxisLabelModel, AxisModelOptions, Orient, ScaleValueModel } from "../../../model/model";
import { format } from 'd3-format';
import { AxisLabelHelper } from './axisLabelDomHelper';

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


    public static setValueAxisLabelsSettings(axisGenerator: IAxis<any>, scaleOptions: ScaleValueModel, labelsOptions: AxisLabelModel): void {
        if (labelsOptions.tickAmountSettings.policy.type === "amount")
            axisGenerator.ticks(labelsOptions.tickAmountSettings.policy.amount);

        if (labelsOptions.tickAmountSettings.policy.type === "constant")
            axisGenerator.tickValues(labelsOptions.tickAmountSettings.policy.values);

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