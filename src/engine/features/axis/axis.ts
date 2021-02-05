import * as d3 from "d3";
import { AxisModelOptions, BlockMargin, IAxisModel, IScaleModel, Orient, ScaleKeyModel, ScaleValueModel, Size } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { Scale, Scales } from "../scale/scale";
import { AXIS_HORIZONTAL_LABEL_PADDING, AXIS_VERTICAL_LABEL_PADDING } from "../../../model/marginModel";

type TextAnchor = 'start' | 'end' | 'middle';

const MINIMAL_STEP_SIZE = 40;

export class Axis
{
    public static render(block: Block, scales: Scales, scaleModel: IScaleModel, axisModel: IAxisModel, margin: BlockMargin, blockSize: Size): void {
        this.renderAxis(block, scales.scaleValue, scaleModel.scaleValue, axisModel.valueAxis, margin, blockSize);
        this.renderAxis(block, scales.scaleKey, scaleModel.scaleKey, axisModel.keyAxis, margin, blockSize);
    }

    public static updateValueAxisDomain(block: Block, scaleValue: d3.AxisScale<any>, scaleOptions: ScaleValueModel, axisOptions: AxisModelOptions): void {
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

    private static renderAxis(block: Block, scale: d3.AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions, margin: BlockMargin, blockSize: Size): void {
        const axis = this.getAxisByOrient(axisOptions.orient, scale);

        this.setAxisFormat(scale, scaleOptions, axis);
        
        if(!axisOptions.ticks.flag)
            this.removeTicks(axis);

        if(axisOptions.type === 'value')
            this.setStepSize(blockSize, margin, axis, axisOptions, scaleOptions);

        this.setAxisLabelPaddingByOrient(axis, axisOptions);
    
        const axisElement = block.getSvg()
            .append('g')
            .attr('transform', `translate(${axisOptions.translate.translateX}, ${axisOptions.translate.translateY})`)
            .attr('class', `axis ${axisOptions.cssClass} data-label`)
            .call(axis);
        
        if(axisOptions.labels.visible) {
            if(axisOptions.orient === 'bottom' && axisOptions.type === 'key' && axisOptions.labels.positition === 'rotated')
                this.rotateLabels(axisElement);
                
            if(axisOptions.orient === 'left' && axisOptions.type === 'key' && Scale.getScaleStep(scale) >= 38) {
                (axisElement.selectAll('.tick text') as d3.Selection<SVGGElement, unknown, d3.BaseType, any>).call(this.wrap, axisOptions.labels.maxSize);
            } else {
                this.cropLabels(block, scale, scaleOptions, axisOptions, blockSize);
            }

            if(axisOptions.type === 'key' && axisOptions.orient === 'left') {
                this.alignLabels(axisElement, 'start', axisOptions.labels.maxSize);
            }
        } else {
            this.hideLabels(axisElement);
        }
    }

    private static setStepSize(blockSize: Size, margin: BlockMargin, axis: d3.Axis<any>, axisOptions: AxisModelOptions, scale: ScaleKeyModel | ScaleValueModel): void {
        let axisLength = blockSize.width - margin.left - margin.right;
        if(axisOptions.orient === 'left' || axisOptions.orient === 'right') {
            axisLength = blockSize.height - margin.top - margin.bottom;
        }
        
        if(axisLength / 10 < MINIMAL_STEP_SIZE) {
            if(Math.floor(axisLength / MINIMAL_STEP_SIZE) > 2)
                axis.ticks(Math.floor(axisLength / MINIMAL_STEP_SIZE));
            else
                axis.tickValues([d3.min(scale.domain), d3.max(scale.domain)]);
        }
    }

    private static alignLabels(axisElement: d3.Selection<SVGGElement, unknown, HTMLElement, any>, anchor: TextAnchor, maxLabelSize: number): void {
        const axisTextBlocks = axisElement.selectAll('text');
        axisTextBlocks.attr('text-anchor', anchor);
        axisTextBlocks.attr('x', -(maxLabelSize + AXIS_VERTICAL_LABEL_PADDING));

        const spans = axisElement.selectAll('tspan');
        spans.attr('text-anchor', anchor);
        spans.attr('x', -(maxLabelSize + AXIS_VERTICAL_LABEL_PADDING));
    }

    private static setAxisLabelPaddingByOrient(axis: d3.Axis<any>, axisOptions: AxisModelOptions): void {
        let axisLabelPadding = AXIS_HORIZONTAL_LABEL_PADDING;
        if(axisOptions.orient === 'left' || axisOptions.orient === 'right')
            axisLabelPadding = AXIS_VERTICAL_LABEL_PADDING;
        axis.tickPadding(axisLabelPadding);
    }

    private static rotateLabels(axisElement: d3.Selection<SVGGElement, unknown, HTMLElement, any>): void {
        const labelBlocks = axisElement.selectAll('text');

        labelBlocks.attr('text-anchor', 'end');
        labelBlocks
            .attr('x', -AXIS_HORIZONTAL_LABEL_PADDING)
            .attr('y', -4)
            .attr('transform', 'rotate(-90)');
    }

    private static removeTicks(axis: d3.Axis<any>): void {
        axis.tickSize(0);
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
                axis.tickFormat(d3.format('.2s')); // examples: 1.2K, 350, 0 
            }
        }
    }

    private static cropLabels(block: Block, scale: d3.AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions, blockSize: Size): void {
        if(scaleOptions.type === 'point' || scaleOptions.type === 'band') {
            const axisTextBlocks = block.getSvg().select(`.${axisOptions.cssClass}`).selectAll('text') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
            let labelSize: number;
            if((axisOptions.orient === 'left' || axisOptions.orient === 'right') || (axisOptions.type === 'key' && axisOptions.labels.positition === 'rotated'))
                labelSize = axisOptions.labels.maxSize;
            else
                labelSize = (scale as d3.ScaleBand<string>).step();

            Helper.cropLabels(axisTextBlocks, labelSize);
            
            if(scaleOptions.type === 'point' && axisOptions.labels.positition === 'straight' && (axisOptions.orient === 'top' || axisOptions.orient === 'bottom')) {
                this.cropAndAlignExtremeLabels(block, labelSize, axisOptions, blockSize);
            }
        }
    }

    private static cropAndAlignExtremeLabels(block: Block, labelSize: number, axisOptions: AxisModelOptions, blockSize: Size): void {
        const lastTick = block.getSvg().select(`.${axisOptions.cssClass}`).select('.tick:last-of-type') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
        const lastLabel = lastTick.select('text') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
        const translateX = Helper.getTranslateNumbers(lastTick.attr('transform'))[0];
        
        if(translateX + lastLabel.node().getBBox().width + axisOptions.translate.translateX > blockSize.width) {
            lastLabel.attr('text-anchor', 'end');
            Helper.cropLabels(lastLabel, labelSize / 2);
        }    

        const firtsLabel = block.getSvg()
            .select(`.${axisOptions.cssClass}`)
            .select('.tick:first-of-type')
            .select('text') as d3.Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;

        if(axisOptions.translate.translateX - firtsLabel.node().getBBox().width < 0) {
            firtsLabel.attr('text-anchor', 'start');
            Helper.cropLabels(firtsLabel, labelSize / 2);
        }
    }

    private static hideLabels(axisElement: d3.Selection<SVGGElement, unknown, d3.BaseType, unknown>): void {
        axisElement.selectAll('.tick text')
            .style('display', 'none');
    }

    private static wrap(text: d3.Selection<SVGGElement, unknown, d3.BaseType, any>, maxWidth: number) {
        text.each(function() {
            let textBlock = d3.select(this);
            if(textBlock.node().getBBox().width > maxWidth) {
                let letters = textBlock.text().split('').reverse(), // split text to letters.
                    letter,
                    line: string[] = [], // one line. letters from this var into tpsans.
                    lineNumber = 0,
                    y = textBlock.attr("y"),
                    dy = 1.4,
                    tspan = textBlock.text(null).append("tspan").attr("y", y).attr("dy", dy + "em");
                while(letter = letters.pop()) {
                    line.push(letter);
                    tspan.text(line.join(''));
                    if(tspan.node().getComputedTextLength() > maxWidth && line.length > 1) {
                        line.pop();
                        tspan.text(line.join(''));
                        if(lineNumber === 0 && line[line.length - 1] !== ' ')
                            tspan.text(tspan.text() + '-');
                        line = [letter];
                        if(lineNumber >= 1) { // If text block has 2 lines, text cropped.
                            if(letters.length > 0)
                                tspan.text(tspan.text().substr(0, tspan.text().length - 1) + '...')
                            break;
                        }
                        tspan = textBlock.append("tspan").attr("y", y).attr("dy", dy + "em").text(letter);
                        lineNumber++;
                    }
                }
                if(textBlock.selectAll('tspan').size() > 1) {
                    textBlock.attr('y', -(textBlock.node().getBBox().height / 2 + 4.8));
                }
            }
        });
    }
}