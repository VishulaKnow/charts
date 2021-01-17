import * as d3 from "d3";
import { AxisModelOptions, Orient, ScaleKeyModel, ScaleValueModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/svgBlock";
import { scaleOrdinal } from "d3";

export class Axis
{
    public static render(scale: d3.AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions): void {
        const axis = this.getAxisByOrient(axisOptions.orient, scale);

        this.setAxisFormat(scale, scaleOptions, axis);
    
        Block.getSvg()
            .append('g')
            .attr('transform', `translate(${axisOptions.translate.translateX}, ${axisOptions.translate.translateY})`)
            .attr('class', `${axisOptions.class} data-label`)
            .call(axis);

        this.cropLabels(scale, scaleOptions, axisOptions);
    }

    public static updateValueAxisDomain(scaleValue: d3.AxisScale<any>, scaleOptions: ScaleValueModel, axisClass: string, axisOrient: Orient) {
        const axis = this.getAxisByOrient(axisOrient, scaleValue);

        this.setAxisFormat(scaleValue, scaleOptions, axis);
        
        Block.getSvg()
            .select(`.${axisClass}`)
            .transition()
            .duration(1000)
                .call(axis.bind(this));
    }

    private static getAxisByOrient(orient: Orient, scale: d3.AxisScale<any>): d3.Axis<any> {
        if(orient === 'top')
            return d3.axisTop(scale);
        if(orient === 'bottom')
            return d3.axisBottom(scale);
        if(orient === 'left')
            return d3.axisLeft(scale);
        if(orient === 'right')
            return d3.axisRight(scale);
    }

    private static setAxisFormat(scale: d3.AxisScale<any>, scaleOptions: ScaleValueModel | ScaleKeyModel, axis: d3.Axis<any>): void {
        if(scaleOptions.type === 'linear') {
            if(d3.max(scale.domain()) > 1000) {
                axis.tickFormat(d3.format('.2s'));
            }
        }
    }

    private static cropLabels(scale: d3.AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions): void {
        if(scaleOptions.type === 'point' || scaleOptions.type === 'band') {
            const axisTextBlocks = d3.select(`.${axisOptions.class}`).selectAll('text') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
            if(axisOptions.orient === 'left' || axisOptions.orient === 'right')
                Helper.cropLabels(axisTextBlocks, axisOptions.maxLabelSize);
            if(axisOptions.orient === 'bottom' || axisOptions.orient === 'top')
                Helper.cropLabels(axisTextBlocks, (scale as d3.ScaleBand<string>).step());
        }
    }
}