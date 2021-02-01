import * as d3 from 'd3'
import { BarChartSettings, RangeModel, ScaleKeyModel, ScaleValueModel } from '../../../model/model';

export interface Scales {
    scaleKey: d3.AxisScale<any>;
    scaleValue: d3.AxisScale<any>;
}

export class Scale 
{
    public static scales: Scales = {
        scaleKey: null,
        scaleValue: null
    }

    public static fillScales(scaleKey: ScaleKeyModel, scaleValue: ScaleValueModel, bandSettings: BarChartSettings): void {
        if(scaleKey.type === 'band')
            this.scales.scaleKey = this.getScaleBand(scaleKey.domain, scaleKey.range, bandSettings);
        else if(scaleKey.type === 'point')
            this.scales.scaleKey = this.getScalePoint(scaleKey.domain,  scaleKey.range);

        if(scaleValue.type === 'linear')
            this.scales.scaleValue = this.getScaleLinear(scaleValue.domain, scaleValue.range);
        else if(scaleValue.type === 'datetime')
            this.scales.scaleValue = this.getScaleTime(scaleValue.domain, scaleValue.range);
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

    private static getScaleBand(domain: string[], range: RangeModel, bandSettings: BarChartSettings, groupedElementsAmount: number = 2): d3.ScaleBand<string> {
        const scale = d3.scaleBand()
            .domain(domain)
            .range([range.start, range.end]);
                
        const bandSize = scale.bandwidth();

        if(bandSettings.groupMinDistance < bandSize) {
            scale.paddingInner(bandSettings.groupMinDistance / bandSize);
            scale.paddingOuter(bandSettings.groupMinDistance / bandSize / 2);
        }

        // const domainLength = range.end - range.start;
        // const fillingDistance = domain.length * (bandSettings.barMaxSize * groupedElementsAmount + bandSettings.barDistance * (groupedElementsAmount - 1)) 
        //     + (domain.length - 1) * bandSettings.groupMaxDistance;
        
        // if(fillingDistance < domainLength) {
        //     const diffSize = (domainLength - fillingDistance);
        //     scale.paddingOuter(diffSize / scale.step());
        // }

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