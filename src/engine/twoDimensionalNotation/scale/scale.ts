import * as d3 from 'd3'
import { ScaleOptions } from '../../../model/model';

export interface Scales {
    scaleKey: d3.ScaleBand<string>;
    scaleValue: d3.ScaleLinear<number, number>;
}

export class Scale 
{
    static scales: Scales = {
        scaleKey: null,
        scaleValue: null
    }

    static getScaleBand(domain: string[], rangeStart: number, rangeEnd: number, scalePadding: number): d3.ScaleBand<string> {
        const scale = d3.scaleBand()
            .domain(domain)
            .range([rangeStart, rangeEnd]);
                
        const bandSize = scale.bandwidth();
        if(scalePadding < bandSize) {
            scale.paddingInner(scalePadding / bandSize);
            scale.paddingOuter(scalePadding / 2 / bandSize);
        }
        return scale;
    }
    
    static getScaleLinear(domain: number[], rangeStart: number, rangeEnd: number): d3.ScaleLinear<number, number> {
        return d3.scaleLinear()
            .domain(domain)
            .range([rangeStart, rangeEnd]);
    }

    static fillScales(scaleKey: ScaleOptions, scaleValue: ScaleOptions, scaleKeyPadding: number): void {
        this.scales.scaleKey = this.getScaleBand(scaleKey.domain,
            scaleKey.range.start,
            scaleKey.range.end,
            scaleKeyPadding);
        this.scales.scaleValue = this.getScaleLinear(scaleValue.domain,
            scaleValue.range.start,
            scaleValue.range.end);
    }
}