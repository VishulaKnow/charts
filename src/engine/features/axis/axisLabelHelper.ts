import { Selection, BaseType } from 'd3-selection';
import { AxisScale, Axis as IAxis } from 'd3-axis';
import { ScaleBand } from 'd3-scale'
import { AxisModelOptions, Orient, ScaleKeyModel, ScaleValueModel, Size } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { AXIS_HORIZONTAL_LABEL_PADDING, AXIS_VERTICAL_LABEL_PADDING } from "../../../model/marginModel";

type TextAnchor = 'start' | 'end' | 'middle';

export class AxisLabelHelper {
    public static alignLabelsInKeyAxis(axisOptions: AxisModelOptions, axisElement: Selection<SVGGElement, unknown, HTMLElement, any>): void {
        if (axisOptions.orient === 'left')
            this.alignLabelsInVerticalAxis(axisElement, 'start', axisOptions.labels.maxSize, true);
        else if (axisOptions.orient === 'right')
            this.alignLabelsInVerticalAxis(axisElement, 'start', axisOptions.labels.maxSize, false);
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
            let labelSize: number;
            if ((axisOptions.orient === 'left' || axisOptions.orient === 'right') || (axisOptions.type === 'key' && axisOptions.labels.positition === 'rotated'))
                labelSize = axisOptions.labels.maxSize;
            else
                labelSize = (scale as ScaleBand<string>).step();

            Helper.cropSvgLabels(axisTextBlocks, labelSize);

            if (scaleOptions.type === 'point' && axisOptions.labels.positition === 'straight' && (axisOptions.orient === 'top' || axisOptions.orient === 'bottom')) {
                this.cropAndAlignExtremeLabels(block, labelSize, axisOptions, blockSize);
            }
        }
    }

    public static hideLabels(axisElement: Selection<SVGGElement, unknown, BaseType, unknown>): void {
        axisElement.selectAll('.tick text')
            .style('display', 'none');
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

    private static cropAndAlignExtremeLabels(block: Block, labelSize: number, axisOptions: AxisModelOptions, blockSize: Size): void {
        const lastTick = block.getSvg().select(`.${axisOptions.cssClass}`).select<SVGGraphicsElement>('.tick:last-of-type');
        const lastLabel = lastTick.select<SVGGraphicsElement>('text');
        const translateX = Helper.getTranslateNumbers(lastTick.attr('transform'))[0];

        if (translateX + lastLabel.node().getBBox().width + axisOptions.translate.translateX > blockSize.width) {
            lastLabel.attr('text-anchor', 'end');
            Helper.cropSvgLabels(lastLabel, labelSize / 2);
        }

        const firtsLabel = block.getSvg()
            .select(`.${axisOptions.cssClass}`)
            .select('.tick:first-of-type')
            .select<SVGGraphicsElement>('text');

        if (axisOptions.translate.translateX - firtsLabel.node().getBBox().width < 0) {
            firtsLabel.attr('text-anchor', 'start');
            Helper.cropSvgLabels(firtsLabel, labelSize / 2);
        }
    }
}