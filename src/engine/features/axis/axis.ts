import { select, Selection, BaseType } from 'd3-selection';
import { min, max } from 'd3-array';
import { format } from 'd3-format';
import { axisTop, axisBottom, axisLeft, axisRight, AxisScale, Axis as IAxis } from 'd3-axis';
import { ScaleBand } from 'd3-scale'
import { transition } from 'd3-transition';
import { AxisModelOptions, BlockMargin, IAxisModel, IScaleModel, Orient, ScaleKeyModel, ScaleValueModel, Size } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { Scale, Scales } from "../scale/scale";
import { AXIS_HORIZONTAL_LABEL_PADDING, AXIS_VERTICAL_LABEL_PADDING } from "../../../model/marginModel";

select.prototype.transition = transition;

type TextAnchor = 'start' | 'end' | 'middle';

const MINIMAL_STEP_SIZE = 40;

export class Axis
{
    public static render(block: Block, scales: Scales, scaleModel: IScaleModel, axisModel: IAxisModel, margin: BlockMargin, blockSize: Size): void {
        this.renderAxis(block, scales.scaleValue, scaleModel.scaleValue, axisModel.valueAxis, margin, blockSize);
        this.renderAxis(block, scales.scaleKey, scaleModel.scaleKey, axisModel.keyAxis, margin, blockSize);
    }

    public static updateValueAxisDomain(block: Block, scaleValue: AxisScale<any>, scaleOptions: ScaleValueModel, axisOptions: AxisModelOptions): void {
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

    private static renderAxis(block: Block, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions, margin: BlockMargin, blockSize: Size): void {
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
                
            if((axisOptions.orient === 'left' || axisOptions.orient === 'right') && axisOptions.type === 'key' && Scale.getScaleStep(scale) >= 38) {
                axisElement.selectAll<SVGGElement, unknown>('.tick text').call(this.wrap, axisOptions.labels.maxSize);
            } else {
                this.cropLabels(block, scale, scaleOptions, axisOptions, blockSize);
            }

            if(axisOptions.type === 'key') {
                if(axisOptions.orient === 'left')
                    this.alignLabels(axisElement, 'start', axisOptions.labels.maxSize, true);
                else if(axisOptions.orient === 'right')
                    this.alignLabels(axisElement, 'start', axisOptions.labels.maxSize, false);
            }
        } else {
            this.hideLabels(axisElement);
        }
    }

    private static setStepSize(blockSize: Size, margin: BlockMargin, axis: IAxis<any>, axisOptions: AxisModelOptions, scale: ScaleKeyModel | ScaleValueModel): void {
        let axisLength = blockSize.width - margin.left - margin.right;
        if(axisOptions.orient === 'left' || axisOptions.orient === 'right') {
            axisLength = blockSize.height - margin.top - margin.bottom;
        }
        
        if(axisLength / 10 < MINIMAL_STEP_SIZE) {
            if(Math.floor(axisLength / MINIMAL_STEP_SIZE) > 2)
                axis.ticks(Math.floor(axisLength / MINIMAL_STEP_SIZE));
            else
                axis.tickValues([min(scale.domain), max(scale.domain)]);
        }
    }

    private static alignLabels(axisElement: Selection<SVGGElement, unknown, HTMLElement, any>, anchor: TextAnchor, maxLabelSize: number, changeCoordinate: boolean): void {
        const axisTextBlocks = axisElement.selectAll('text');
        const spans = axisElement.selectAll('tspan');
        axisTextBlocks.attr('text-anchor', anchor);
        spans.attr('text-anchor', anchor);
        if(changeCoordinate) {
            axisTextBlocks.attr('x', -(maxLabelSize + AXIS_VERTICAL_LABEL_PADDING));
            spans.attr('x', -(maxLabelSize + AXIS_VERTICAL_LABEL_PADDING));
        } else {
            spans.attr('x', AXIS_VERTICAL_LABEL_PADDING);
        }
    }

    private static setAxisLabelPaddingByOrient(axis: IAxis<any>, axisOptions: AxisModelOptions): void {
        let axisLabelPadding = AXIS_HORIZONTAL_LABEL_PADDING;
        if(axisOptions.orient === 'left' || axisOptions.orient === 'right')
            axisLabelPadding = AXIS_VERTICAL_LABEL_PADDING;
        axis.tickPadding(axisLabelPadding);
    }

    private static rotateLabels(axisElement: Selection<SVGGElement, unknown, HTMLElement, any>): void {
        const labelBlocks = axisElement.selectAll('text');

        labelBlocks.attr('text-anchor', 'end');
        labelBlocks
            .attr('x', -AXIS_HORIZONTAL_LABEL_PADDING)
            .attr('y', -4)
            .attr('transform', 'rotate(-90)');
    }

    private static removeTicks(axis: IAxis<any>): void {
        axis.tickSize(0);
    }

    private static getAxisByOrient(orient: Orient, scale: AxisScale<any>): IAxis<any> {
        if(orient === 'top')
            return axisTop(scale);
        if(orient === 'bottom')
            return axisBottom(scale);
        if(orient === 'left')
            return axisLeft(scale);
        if(orient === 'right')
            return axisRight(scale);
    }

    private static setAxisFormat(scale: AxisScale<any>, scaleOptions: ScaleValueModel | ScaleKeyModel, axis: IAxis<any>): void {
        if(scaleOptions.type === 'linear') {
            if(max(scale.domain()) > 1000) {
                axis.tickFormat(format('.2s')); // examples: 1.2K, 350, 0 
            }
        }
    }

    private static cropLabels(block: Block, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions, blockSize: Size): void {
        if(scaleOptions.type === 'point' || scaleOptions.type === 'band') {
            const axisTextBlocks = block.getSvg().select(`.${axisOptions.cssClass}`).selectAll('text') as Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
            let labelSize: number;
            if((axisOptions.orient === 'left' || axisOptions.orient === 'right') || (axisOptions.type === 'key' && axisOptions.labels.positition === 'rotated'))
                labelSize = axisOptions.labels.maxSize;
            else
                labelSize = (scale as ScaleBand<string>).step();

            Helper.cropLabels(axisTextBlocks, labelSize);
            
            if(scaleOptions.type === 'point' && axisOptions.labels.positition === 'straight' && (axisOptions.orient === 'top' || axisOptions.orient === 'bottom')) {
                this.cropAndAlignExtremeLabels(block, labelSize, axisOptions, blockSize);
            }
        }
    }

    private static cropAndAlignExtremeLabels(block: Block, labelSize: number, axisOptions: AxisModelOptions, blockSize: Size): void {
        const lastTick = block.getSvg().select(`.${axisOptions.cssClass}`).select('.tick:last-of-type') as Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
        const lastLabel = lastTick.select('text') as Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;
        const translateX = Helper.getTranslateNumbers(lastTick.attr('transform'))[0];
        
        if(translateX + lastLabel.node().getBBox().width + axisOptions.translate.translateX > blockSize.width) {
            lastLabel.attr('text-anchor', 'end');
            Helper.cropLabels(lastLabel, labelSize / 2);
        }    

        const firtsLabel = block.getSvg()
            .select(`.${axisOptions.cssClass}`)
            .select('.tick:first-of-type')
            .select('text') as Selection<SVGGraphicsElement, unknown, HTMLElement, unknown>;

        if(axisOptions.translate.translateX - firtsLabel.node().getBBox().width < 0) {
            firtsLabel.attr('text-anchor', 'start');
            Helper.cropLabels(firtsLabel, labelSize / 2);
        }
    }

    private static hideLabels(axisElement: Selection<SVGGElement, unknown, BaseType, unknown>): void {
        axisElement.selectAll('.tick text')
            .style('display', 'none');
    }

    private static wrap(textBlocks: Selection<SVGGElement, unknown, BaseType, any>, maxWidth: number) {
        textBlocks.each(function() {
            let textBlock = select(this);
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
                    if(tspan.node().getComputedTextLength() > maxWidth && line.length > 1 && letters.length > 0) {
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

                if(textBlock.selectAll('tspan').size() > 0) {
                    textBlock.attr('y', -(textBlock.node().getBBox().height / 2 + 4.8));
                }
            }
        });
    }
}