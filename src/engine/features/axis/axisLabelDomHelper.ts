import { Selection, BaseType, select } from 'd3-selection';
import { AxisScale, Axis as IAxis } from 'd3-axis';
import { ScaleBand } from 'd3-scale'
import { AxisModelOptions, Orient, ScaleKeyModel, ScaleValueModel } from "../../../model/model";
import { Block } from "../../block/block";
import { AXIS_HORIZONTAL_LABEL_PADDING, AXIS_VERTICAL_LABEL_PADDING } from "../../../model/marginModel";
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';
import { Size } from '../../../config/config';

type TextAnchor = 'start' | 'end' | 'middle';

export class AxisLabelHelper {
    public static setTitles(axisElement: Selection<SVGGElement, unknown, HTMLElement, any>, tickValues: string[]): void {
        axisElement.selectAll('.tick text')
            .each(function (d, i) {
                const tickTitle = select(this).select('title');
                if (tickTitle.empty())
                    select(this)
                        .append('title')
                        .text(tickValues[i]);
                else
                    tickTitle.text(tickValues[i]);
            });
    }

    public static setAxisLabelPaddingByOrient(axis: IAxis<any>, axisOptions: AxisModelOptions): void {
        let axisLabelPadding = AXIS_HORIZONTAL_LABEL_PADDING;
        if (axisOptions.orient === 'left' || axisOptions.orient === 'right')
            axisLabelPadding = AXIS_VERTICAL_LABEL_PADDING;
        axis.tickPadding(axisLabelPadding);
    }

    public static rotateLabels(axisElement: Selection<SVGGElement, unknown, HTMLElement, any>, keyAxisOrient: Orient): void {
        const labelBlocks = axisElement.selectAll('text');
        labelBlocks.attr('transform', 'rotate(-90)');

        if (keyAxisOrient === 'bottom') {
            labelBlocks
                .attr('text-anchor', 'end')
                .attr('x', -AXIS_HORIZONTAL_LABEL_PADDING)
                .attr('y', -4);
        }
        else if (keyAxisOrient === 'top') {
            labelBlocks
                .attr('text-anchor', 'start')
                .attr('x', AXIS_HORIZONTAL_LABEL_PADDING)
                .attr('y', 6);
        }
    }

    public static cropLabels(block: Block, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions, blockSize: Size): void {
        if (scaleOptions.type === 'point' || scaleOptions.type === 'band') {
            const axisTextBlocks = block.getSvg().select(`.${axisOptions.cssClass}`).selectAll<SVGGraphicsElement, unknown>('text');
            let maxLabelSize: number;
            if ((axisOptions.orient === 'left' || axisOptions.orient === 'right') || (axisOptions.type === 'key' && axisOptions.labels.position === 'rotated'))
                maxLabelSize = axisOptions.labels.maxSize;
            else
                maxLabelSize = (scale as ScaleBand<string>).step() - 4;

            DomHelper.cropSvgLabels(axisTextBlocks, maxLabelSize);
            if (scaleOptions.type === 'point' && axisOptions.labels.position === 'straight' && (axisOptions.orient === 'top' || axisOptions.orient === 'bottom')) {
                this.cropAndAlignExtremeLabels(block, maxLabelSize, axisOptions, blockSize);
            }
        }
    }

    public static hideLabels(axisElement: Selection<SVGGElement, unknown, BaseType, unknown>): void {
        axisElement.selectAll('.tick text').style('display', 'none');
    }

    public static alignLabelsInKeyAxis(axisOptions: AxisModelOptions, axisElement: Selection<SVGGElement, unknown, HTMLElement, any>): void {
        if (axisOptions.orient === 'left')
            this.alignLabelsInVerticalAxis(axisElement, 'start', axisOptions.labels.maxSize, true);
        else if (axisOptions.orient === 'right')
            this.alignLabelsInVerticalAxis(axisElement, 'start', axisOptions.labels.maxSize, false);
    }

    private static alignLabelsInVerticalAxis(axisElement: Selection<SVGGElement, unknown, HTMLElement, any>, anchor: TextAnchor, maxLabelSize: number, changeCoordinate: boolean): void {
        const axisTextBlocks = axisElement.selectAll('text');
        const spans = axisElement.selectAll('tspan');
        axisTextBlocks.attr('text-anchor', anchor);
        spans.attr('text-anchor', anchor);

        if (changeCoordinate) {
            axisTextBlocks.attr('x', -(maxLabelSize + AXIS_VERTICAL_LABEL_PADDING));
            spans.attr('x', -(maxLabelSize + AXIS_VERTICAL_LABEL_PADDING));
        } else {
            spans.attr('x', AXIS_VERTICAL_LABEL_PADDING);
        }
    }

    private static cropAndAlignExtremeLabels(block: Block, maxLabelSize: number, axisOptions: AxisModelOptions, blockSize: Size): void {
        const lastTick = block.getSvg().select(`.${axisOptions.cssClass}`).select<SVGGraphicsElement>('.tick:last-of-type');
        const lastLabel = lastTick.select<SVGGraphicsElement>('text');
        const tickTranslateX = Helper.getTranslateNumbers(lastTick.attr('transform'))[0];

        const marginRight = blockSize.width - axisOptions.translate.translateX - tickTranslateX;
        if (tickTranslateX + lastLabel.node().getBBox().width + axisOptions.translate.translateX > blockSize.width) {
            lastLabel.attr('text-anchor', 'start');
            lastLabel.attr('transform', `translate(${this.getTranslateNumber(maxLabelSize, lastLabel, marginRight)}, 0)`);
            DomHelper.cropSvgLabels(lastLabel, maxLabelSize / 2 + marginRight);
        }

        const firstLabel = block.getSvg()
            .select(`.${axisOptions.cssClass}`)
            .select('.tick:first-of-type')
            .select<SVGGraphicsElement>('text');
        const axisElementTranslate = Helper.getTranslateNumbers(block.getSvg().select(`.${axisOptions.cssClass}`).attr('transform'))[0];
        if (axisOptions.translate.translateX - firstLabel.node().getBBox().width / 2 < 0) {
            firstLabel.attr('text-anchor', 'start');
            firstLabel.attr('transform', `translate(${-axisOptions.translate.translateX}, 0)`);
            DomHelper.cropSvgLabels(firstLabel, maxLabelSize / 2 + axisElementTranslate);
        }
    }

    private static getTranslateNumber(maxLabelSize: number, lastLabel: Selection<SVGGraphicsElement, unknown, HTMLElement, any>, marginRight: number) {
        if (maxLabelSize / 2 > lastLabel.node().getBBox().width)
            return -(lastLabel.node().getBBox().width - marginRight);
        return -maxLabelSize / 2;
        // return -Math.min(maxLabelSize / 2, lastLabel.node().getBBox().width - marginRight)
    }

    public static wrapHandler(textBlocks: Selection<SVGGElement, unknown, BaseType, any>, maxWidth: number) {
        textBlocks.each(function () {
            let textBlock = select(this);
            if (!textBlock.selectAll('tspan').empty())
                return;
            textBlock.select('title').remove();
            let textContent = textBlock.text();
            if (textBlock.node().getBBox().width > maxWidth) {
                let letters = textBlock.text().split('').reverse(), // split text to letters.
                    letter,
                    line: string[] = [], // one line. letters from this var into tpsans.
                    lineNumber = 0,
                    y = textBlock.attr("y"),
                    dy = 1.4,
                    tspan = textBlock.text(null).append("tspan").attr("dy", dy + "em");

                while (letter = letters.pop()) {
                    line.push(letter);
                    tspan.text(line.join(''));
                    if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1 && letters.length > 0) {
                        line.pop();
                        tspan.text(line.join(''));
                        if (lineNumber === 0 && line[line.length - 1] !== ' ')
                            tspan.text(tspan.text() + '-');
                        line = [letter];
                        if (lineNumber >= 1) { // If text block has 2 lines, text cropped.
                            if (letters.length > 0)
                                tspan.text(tspan.text().substr(0, tspan.text().length - 1) + '...')
                            break;
                        }
                        tspan = textBlock.append("tspan").attr("dy", dy * lineNumber + 1 + "em").text(letter);
                        lineNumber++;
                    }
                }

                if (textBlock.selectAll('tspan').size() === 1) {
                    textBlock.text(textContent).attr('y', null);
                }

                if (!textBlock.selectAll('tspan').empty()) {
                    textBlock.attr('y', -(textBlock.node().getBBox().height / 2 + 4.8));
                }
            }
        });
    }
}