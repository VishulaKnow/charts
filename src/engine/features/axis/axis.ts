import * as d3 from "d3";
import { AxisModelOptions, IAxisModel, IScaleModel, Orient, ScaleKeyModel, ScaleValueModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { Scales } from "../scale/scale";

interface AxisLabelCoordinate {
    x: number;
    y: number;
}

type TextAnchor = 'start' | 'end' | 'middle';

export class Axis
{
    public static render(block: Block, scales: Scales, scaleModel: IScaleModel, axisModel: IAxisModel): void {
        this.renderAxis(block, scales.scaleValue, scaleModel.scaleValue, axisModel.valueAxis);
        this.renderAxis(block, scales.scaleKey, scaleModel.scaleKey, axisModel.keyAxis);
    }

    private static renderAxis(block: Block, scale: d3.AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions): void {
        const axis = this.getAxisByOrient(axisOptions.orient, scale);

        this.setAxisFormat(scale, scaleOptions, axis);
        
        if(!axisOptions.ticks.flag)
            this.removeTicks(axis);

        this.setAxisLabelPaddingByOrient(axis, axisOptions);
    
        const axisElement = block.getSvg()
            .append('g')
            .attr('transform', `translate(${axisOptions.translate.translateX}, ${axisOptions.translate.translateY})`)
            .attr('class', `axis ${axisOptions.cssClass} data-label`)
            .call(axis);

        this.cropLabels(block, scale, scaleOptions, axisOptions);

        if(axisOptions.orient === 'left' && axisOptions.type === 'key') {
            this.alignLabels(axisElement, 'start', axisOptions.maxLabelSize);
        }
        
        if(axisOptions.orient === 'bottom' && axisOptions.type === 'key')
            this.rotateLabels(axisElement);
    }

    public static updateValueAxisDomain(block: Block, scaleValue: d3.AxisScale<any>, scaleOptions: ScaleValueModel, axisOptions: AxisModelOptions) {
        const axis = this.getAxisByOrient(axisOptions.orient, scaleValue);

        this.setAxisFormat(scaleValue, scaleOptions, axis);
        if(!axisOptions.ticks.flag)
            this.removeTicks(axis);

        this.setAxisLabelPaddingByOrient(axis, axisOptions);

        block.getSvg()
            .select(`g.${axisOptions.cssClass}`)
            .transition()
            .duration(1000)
                .call(axis.bind(this));
    }

    private static alignLabels(axisElement: d3.Selection<SVGGElement, unknown, HTMLElement, any>, anchor: TextAnchor, maxLabelSize: number): void {
        const axisTextBlocks = axisElement.selectAll('text');
        axisTextBlocks.attr('text-anchor', 'start');
        axisTextBlocks.attr('x', -maxLabelSize);
    }

    private static setAxisLabelPaddingByOrient(axis: d3.Axis<any>, axisOptions: AxisModelOptions): void {
        let axisLabelPadding = 15;
        if(axisOptions.orient === 'left' || axisOptions.orient === 'right')
            axisLabelPadding = 10;
        axis.tickPadding(axisLabelPadding);
    }

    private static rotateLabels(axisElement: d3.Selection<SVGGElement, unknown, HTMLElement, any>): void {
        const labelBlocks = axisElement.selectAll('text');
        labelBlocks.attr('text-anchor', 'end');
        labelBlocks
            .attr('x', -15)
            .attr('y', -5)
            .attr('transform', 'rotate(-90)');
    }

    private static removeTicks(axis: d3.Axis<any>): void {
        axis.tickSize(0);
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

    private static setTicksAmount(scale: d3.AxisScale<any>, axisOptions: AxisModelOptions, axis: d3.Axis<any>): void {
        let axisLength: number = scale.range()[1];
        axis.ticks(3);
    }

    private static cropLabels(block: Block, scale: d3.AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions): void {
        if(scaleOptions.type === 'point' || scaleOptions.type === 'band') {
            const axisTextBlocks = block.getSvg().select(`.${axisOptions.cssClass}`).selectAll('text') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
            let labelSize: number;
            if(axisOptions.orient === 'left' || axisOptions.orient === 'right')
                labelSize = axisOptions.maxLabelSize;
            else
                labelSize = (scale as d3.ScaleBand<string>).step();
            Helper.cropLabels(axisTextBlocks, labelSize);
            
            if(scaleOptions.type === 'point') {
                const lastTick = block.getSvg().select(`.${axisOptions.cssClass}`).select('.tick:last-of-type') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
                const lastLabel = lastTick.select('text') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
                const translateX = Helper.getTranslateNumbers(lastTick.attr('transform'))[0];
                if(translateX + lastLabel.node().getBBox().width + axisOptions.translate.translateX > 1200)                
                    Helper.cropLabels(lastLabel, labelSize / 2);
            }
        }
    }
}