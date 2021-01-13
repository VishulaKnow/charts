import * as d3 from "d3";
import { AxisModelOptions, Orient } from "../../../model/model";
import { Helper } from "../../helper";
import { SvgBlock } from "../../svgBlock/svgBlock";

export class Axis
{
    static getAxisByOrient(orient: Orient, scale: d3.AxisScale<any>): d3.Axis<any> {
        if(orient === 'top')
            return d3.axisTop(scale);
        if(orient === 'bottom')
            return d3.axisBottom(scale);
        if(orient === 'left')
            return d3.axisLeft(scale);
        if(orient === 'right')
            return d3.axisRight(scale);
    }

    static render(scale: d3.AxisScale<any>, options: AxisModelOptions): void {
        const axis = this.getAxisByOrient(options.orient, scale);
    
        SvgBlock.getSvg()
            .append('g')
            .attr('transform', `translate(${options.translate.translateX}, ${options.translate.translateY})`)
            .attr('class', `${options.class} data-label`)
            .call(axis);

        const axisText = d3.select(`.${options.class}`).selectAll('text') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
    
        if(options.orient === 'left' || options.orient === 'right')
            Helper.cropLabels(axisText, options.maxLabelSize);
        else if(options.orient === 'bottom' || options.orient === 'top') {
            if((scale as d3.ScaleBand<string>).step)
                Helper.cropLabels(axisText, (scale as d3.ScaleBand<string>).step());
        }
    }

    static updateValueAxisDomain(scaleValue: d3.ScaleLinear<number, number>, axisClass: string, axisOrient: Orient) {
        const axis = this.getAxisByOrient(axisOrient, scaleValue);
        
        SvgBlock.getSvg()
            .select(`.${axisClass}`)
            .transition()
            .duration(1000)
                .call(axis.bind(this));
    }
}