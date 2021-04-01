import { axisTop, axisBottom, axisLeft, axisRight, AxisScale, Axis as IAxis } from 'd3-axis';
import { AxisModelOptions, Orient, ScaleKeyModel, ScaleValueModel } from "../../../model/model";
import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { AxisLabelHelper } from './axisLabelDomHelper';

const MINIMAL_STEP_SIZE = 40;
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


    public static setStepSize(axisGenerator: IAxis<any>, scaleDomain: any[], range: number[]): void {
        const axisLength = range[1] - range[0];
        let ticksAmount: number;
        if (axisLength / 10 < MINIMAL_STEP_SIZE) {
            if (Math.floor(axisLength / MINIMAL_STEP_SIZE) > 2) {
                ticksAmount = Math.floor(axisLength / MINIMAL_STEP_SIZE);
                axisGenerator.ticks(Math.floor(axisLength / MINIMAL_STEP_SIZE));
            }
            else {
                ticksAmount = 2;
                axisGenerator.tickValues([min(scaleDomain), max(scaleDomain)]);
            }
        }
        (axisGenerator.scale() as any).ticks(ticksAmount).forEach((value: number) => {
            if (format('~s')(value).indexOf('.') !== -1) {
                this.setNumTickFormat(axisGenerator, '.2s');
            }
        });
    }

    public static getBaseAxisGenerator(axisOptions: AxisModelOptions, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel): IAxis<any> {
        const axisGenerator = AxisHelper.getAxisByOrient(axisOptions.orient, scale);
        if (!axisOptions.ticks.flag)
            this.removeTicks(axisGenerator);
        AxisLabelHelper.setAxisLabelPaddingByOrient(axisGenerator, axisOptions);
        if (scaleOptions.type === 'linear')
            this.setNumTickFormat(axisGenerator);

        return axisGenerator;
    }

    private static removeTicks(axis: IAxis<any>): void {
        axis.tickSize(0);
    }

    private static setNumTickFormat(axis: IAxis<any>, formatName: '~s' | '.2s' = '~s'): void {
        axis.tickFormat(format(formatName));
    }
}