import * as d3 from 'd3'
import { BarChartSettings, RangeModel, ScaleKeyModel, ScaleValueModel } from '../../../model/model';

export interface Scales {
    scaleKey: d3.AxisScale<any>;
    scaleValue: d3.AxisScale<any>;
}

export class Scale 
{
    public static getScales(scaleKey: ScaleKeyModel, scaleValue: ScaleValueModel, bandSettings: BarChartSettings): Scales {
        const scales: Scales = {
            scaleKey: null,
            scaleValue: null
        }

        console.log(scaleKey);
        
        
        if(scaleKey.type === 'band')
            scales.scaleKey = this.getScaleBand(scaleKey.domain, scaleKey.range, bandSettings, scaleKey.elementsAmount);
        else if(scaleKey.type === 'point')
            scales.scaleKey = this.getScalePoint(scaleKey.domain,  scaleKey.range);

        if(scaleValue.type === 'linear')
            scales.scaleValue = this.getScaleLinear(scaleValue.domain, scaleValue.range);
        else if(scaleValue.type === 'datetime')
            scales.scaleValue = this.getScaleTime(scaleValue.domain, scaleValue.range);

        return scales;
    }

    public static getScaleWidth(scale: d3.AxisScale<any>): number {
        if((scale as d3.ScaleBand<string>).bandwidth && scale.bandwidth() !== 0) {
            return scale.bandwidth();
        } else if((scale as d3.ScalePoint<string>).step) {
            return (scale as d3.ScalePoint<string>).step();
        }
    }

    public static getScaleStep(scale: d3.AxisScale<any>): number {
        if((scale as d3.ScaleBand<string>).step) {
            return (scale as d3.ScaleBand<string>).step();
        }
    }

    public static getScaleKeyPoint(scale: d3.AxisScale<any>, value: any): number {
        if((scale as d3.ScaleBand<string>).bandwidth && (scale as d3.ScaleBand<string>).bandwidth() !== 0) {
            return scale(value) + this.getScaleWidth(scale) / 2;
        }
        return scale(value);
    }

    private static getScaleBand(domain: string[], range: RangeModel, bandSettings: BarChartSettings, elementsInGroupAmount: number): d3.ScaleBand<string> {
        const scale = d3.scaleBand()
            .domain(domain)
            .range([range.start, range.end]);
                
        const bandSize = scale.bandwidth();

        if(bandSettings.groupMinDistance < bandSize) {
            scale.paddingInner(bandSettings.groupMinDistance / bandSize);
            // scale.paddingOuter(bandSettings.groupMinDistance / bandSize / 2);
        }

        while(scale.bandwidth() > bandSettings.maxBarWidth * elementsInGroupAmount + bandSettings.groupMaxDistance){
            scale.paddingOuter(scale.paddingOuter() + 0.05);        
        }

        return scale;
    }
    
    private static getScaleLinear(domain: number[], range: RangeModel): d3.ScaleLinear<number, number> {
        return d3.scaleLinear()
            .domain(domain)
            .range([range.start, range.end]);
    }

    private static getScalePoint(domain: string[], range: RangeModel): d3.ScalePoint<string> {
        return d3.scalePoint()
            .domain(domain)
            .range([range.start, range.end]);
    }

    private static getScaleTime(domain: any, range: RangeModel): d3.ScaleTime<number, number, never> {
        return d3.scaleTime()
            .domain(domain)
            .range([range.start, range.end])
            .nice();
    }
}