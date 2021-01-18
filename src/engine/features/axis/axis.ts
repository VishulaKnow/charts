import * as d3 from "d3";
import { AxisModelOptions, Orient, ScaleKeyModel, ScaleValueModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/svgBlock";

interface AxisLabelCoordinate {
    x: number;
    y: number;
}

export class Axis
{
    public static render(scale: d3.AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions): void {
        const axis = this.getAxisByOrient(axisOptions.orient, scale);

        this.setAxisFormat(scale, scaleOptions, axis);
        
        if(!axisOptions.ticks.flag)
            this.removeTicks(axis);
    
        const axisElement = Block.getSvg()
            .append('g')
            .attr('transform', `translate(${axisOptions.translate.translateX}, ${axisOptions.translate.translateY})`)
            .attr('class', `axis ${axisOptions.class} data-label`)
            .call(axis);

        this.setAxisLabelMargin(axisElement, axisOptions.orient, 9);
        this.cropLabels(scale, scaleOptions, axisOptions);
    }

    public static updateValueAxisDomain(scaleValue: d3.AxisScale<any>, scaleOptions: ScaleValueModel, axisClass: string, axisOrient: Orient) {
        const axis = this.getAxisByOrient(axisOrient, scaleValue);

        this.setAxisFormat(scaleValue, scaleOptions, axis);
        this.removeTicks(axis);
        
        Block.getSvg()
            .select(`.${axisClass}`)
            .transition()
            .duration(1000)
                .call(axis.bind(this));
    }

    private static removeTicks(axis: d3.Axis<any>): void {
        axis.tickSize(0);
    }
    
    private static setAxisLabelMargin(axisElement: d3.Selection<SVGGElement, unknown, HTMLElement, any>, axisOrient: Orient, labelMargin: number): void {
        const axisTexts = axisElement
            .selectAll('.tick')
            .select('text');

        const coordinate = this.getAxisLabelCoordinate(axisOrient, labelMargin);
        axisTexts
            .attr('x', coordinate.x)
            .attr('y', coordinate.y);
    }

    private static getAxisLabelCoordinate(axisOrient: Orient, labelMargin: number): AxisLabelCoordinate {
        const coordinate: AxisLabelCoordinate = {
            x: null,
            y: null
        }
        if(axisOrient === 'bottom')
            coordinate.y = labelMargin;
        else if(axisOrient === 'top')
            coordinate.y = -labelMargin;
        else if(axisOrient === 'left')
            coordinate.x = -labelMargin;
        else if(axisOrient === 'right')
            coordinate.x = labelMargin;
        return coordinate;
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