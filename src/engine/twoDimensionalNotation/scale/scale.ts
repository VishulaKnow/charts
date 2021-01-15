import * as d3 from 'd3'
import { RangeModel, ScaleKeyModel, ScaleValueModel } from '../../../model/model';

export interface Scales {
    scaleKey: d3.AxisScale<any>;
    scaleValue: d3.ScaleLinear<number, number>;
}

export class Scale 
{
    public static scales: Scales = {
        scaleKey: null,
        scaleValue: null
    }

    public static fillScales(scaleKey: ScaleKeyModel, scaleValue: ScaleValueModel, scaleKeyPadding: number): void {
        if(scaleKey.type === 'band')
            this.scales.scaleKey = this.getScaleBand(scaleKey.domain,
                scaleKey.range,
                scaleKeyPadding);
        else if(scaleKey.type === 'point')
            this.scales.scaleKey = this.getScalePoint(scaleKey.domain,
                scaleKey.range);

        if(scaleValue.type === 'linear')
            this.scales.scaleValue = this.getScaleLinear(scaleValue.domain,
                scaleValue.range);
    }

    public static getScaleWidth(scale: d3.AxisScale<any>): number {
        if((scale as d3.ScaleBand<string>).bandwidth) {
            return scale.bandwidth();
        }
    }

    public static getScaleStep(scale: d3.AxisScale<any>): number {
        if((scale as d3.ScaleBand<string>).step) {
            return (scale as d3.ScaleBand<string>).step();
        }
    }

    public static getScaleKeyPoint(scale: d3.AxisScale<any>, value: any): number {
        if((scale as d3.ScaleBand<string>).bandwidth) {
            return scale(value) + this.getScaleWidth(scale) / 2;
        }
        return scale(value);
    }

    private static getScaleBand(domain: string[], range: RangeModel, scalePadding: number): d3.ScaleBand<string> {
        const scale = d3.scaleBand()
            .domain(domain)
            .range([range.start, range.end]);
                
        const bandSize = scale.bandwidth();
        if(scalePadding < bandSize) {
            scale.paddingInner(scalePadding / bandSize);
            scale.paddingOuter(scalePadding / 2 / bandSize);
        }
        return scale;
    }
    
    private static getScaleLinear(domain: number[], range: RangeModel): d3.ScaleLinear<number, number> {
        return d3.scaleLinear()
            .domain(domain)
            .range([range.start, range.end]);
    }

    private static getScaleOrdinal(domain: string[], range: RangeModel): any {
        return d3.scaleOrdinal()
            .domain(domain)
            .range([0, 200, 400, 600, 800, 1000, 1100]);
    }

    private static getScalePoint(domain: string[], range: RangeModel): d3.ScalePoint<string> {
        return d3.scalePoint()
            .domain(domain)
            .range([range.start, range.end]);
    }

    private static getScaleTime(domain: string[], range: RangeModel): d3.ScaleTime<number, number, never> {
        return d3.scaleTime()
            .domain(this.getTimeDomain(domain))
            .range([range.start, range.end]);
    }

    private static getTimeDomain(domain: string[]): any {
        domain.sort((a, b) => d3.timeParse('%b %y')(a) > d3.timeParse('%b %y')(b) ? 1 : -1);
        return [d3.timeParse('%b %y')(domain[0]), d3.timeParse('%b %y')(domain[domain.length - 1])];
    }
}