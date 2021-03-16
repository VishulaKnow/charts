import { Selection, BaseType } from 'd3-selection';
import { min, max } from 'd3-array';
import { format } from 'd3-format';
import { AxisScale, Axis as IAxis } from 'd3-axis';
import { ScaleBand } from 'd3-scale'
import { AxisModelOptions, BlockMargin, IAxisModel, IScaleModel, Orient, ScaleKeyModel, ScaleValueModel, Size, TranslateModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { Scale, Scales } from "../scale/scale";
import { AXIS_HORIZONTAL_LABEL_PADDING, AXIS_VERTICAL_LABEL_PADDING } from "../../../model/marginModel";
import { NamesManager } from '../../namesManager';
import { AxisHelper } from './axisHelper';
import { Transition } from 'd3-transition';

type TextAnchor = 'start' | 'end' | 'middle';

const MINIMAL_STEP_SIZE = 40;
const MINIMAL_STEP_SIZE_FOR_WRAPPING = 38;

export class Axis {
    public static axesClass = NamesManager.getClassName('axis');

    public static render(block: Block, scales: Scales, scaleModel: IScaleModel, axisModel: IAxisModel, margin: BlockMargin, blockSize: Size): void {
        if (axisModel.valueAxis.visibility)
            this.renderAxis(block, scales.scaleValue, scaleModel.scaleValue, axisModel.valueAxis, margin, blockSize);
        if (axisModel.keyAxis.visibility)
            this.renderAxis(block, scales.scaleKey, scaleModel.scaleKey, axisModel.keyAxis, margin, blockSize);
    }

    public static update(block: Block, scales: Scales, scalesOptions: IScaleModel, axisModel: IAxisModel, blockSize: Size, keyDomainsEquality: boolean): void {
        if (axisModel.valueAxis.visibility)
            this.updateValueAxis(block, scales.scaleValue, scalesOptions.scaleValue, axisModel.valueAxis);
        if (axisModel.keyAxis.visibility)
            this.updateKeyAxis(block, scales.scaleKey, scalesOptions.scaleKey, axisModel.keyAxis, blockSize, keyDomainsEquality);
    }

    private static updateValueAxis(block: Block, scaleValue: AxisScale<any>, scaleOptions: ScaleValueModel, axisOptions: AxisModelOptions): void {
        const axisGenerator = this.getBaseAxisGenerator(axisOptions, scaleValue, scaleOptions);

        const axisElement = block.getSvg()
            .select(`g.${axisOptions.cssClass}`);
        this.updateAxisElement(axisGenerator, axisElement, axisOptions.translate, block.transitionManager.durations.chartUpdate);
    }

    private static updateKeyAxis(block: Block, scaleKey: AxisScale<any>, scaleOptions: ScaleKeyModel, axisOptions: AxisModelOptions, blockSize: Size, domainNotUpdated: boolean): void {
        const axisGenerator = this.getBaseAxisGenerator(axisOptions, scaleKey, scaleOptions);

        if (axisOptions.labels.positition === 'rotated') {
            if (axisOptions.orient === 'bottom')
                axisGenerator.tickPadding(-4);
            else if (axisOptions.orient === 'top')
                axisGenerator.tickPadding(-6);
        }

        const axisElement = block.getSvg()
            .select<SVGGElement>(`g.${axisOptions.cssClass}`);

        if (axisOptions.orient === 'left' || axisOptions.orient === 'right') {
            axisElement.selectAll('.tick text').attr('y', null);
            if (axisOptions.orient === 'left')
                axisGenerator.tickPadding(axisOptions.labels.maxSize + AXIS_VERTICAL_LABEL_PADDING);
        }

        // Если ключи оси не меняются, то обновление происходит без анимации
        this.updateAxisElement(axisGenerator, axisElement, axisOptions.translate, domainNotUpdated ? 0 : block.transitionManager.durations.chartUpdate)
            .then(() => {
                if (axisOptions.orient === 'bottom' || axisOptions.orient === 'top') {
                    // Обратное выравнивание лейблов, если они были перевернуты, но теперь могут отображаться прямо
                    if (axisOptions.labels.positition === 'straight') {
                        axisElement.selectAll('.tick text')
                            .attr('transform', null)
                            .attr('text-anchor', 'middle')
                            .attr('x', null);
                    }
                    this.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
                }
                if (axisOptions.orient === 'left' || axisOptions.orient === 'right') {
                    if (Scale.getScaleStep(scaleKey) >= MINIMAL_STEP_SIZE_FOR_WRAPPING)
                        axisElement.selectAll<SVGGElement, unknown>('.tick text').call(AxisHelper.wrapHandler, axisOptions.labels.maxSize);
                    else
                        this.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);

                    this.alignLabelsInKeyAxis(axisOptions, axisElement);
                }
            });

        if (axisOptions.orient === 'left' || axisOptions.orient === 'right') {
            this.alignLabelsInKeyAxis(axisOptions, axisElement);
        }

        if (axisOptions.orient === 'bottom' || axisOptions.orient === 'top') {
            axisElement.selectAll('.tick > text').attr('text-anchor', 'center');
            if (axisOptions.labels.positition === 'rotated')
                this.rotateLabels(axisElement, axisOptions.orient);
            this.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
        }
    }

    private static renderAxis(block: Block, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions, margin: BlockMargin, blockSize: Size): void {
        const axisGenerator = this.getBaseAxisGenerator(axisOptions, scale, scaleOptions);

        if (axisOptions.type === 'value')
            this.setStepSize(blockSize, margin, axisGenerator, axisOptions, scaleOptions);

        const axisElement = block.getSvg()
            .append('g')
            .attr('class', `${this.axesClass} ${axisOptions.cssClass} data-label`)

        this.updateAxisElement(axisGenerator, axisElement, axisOptions.translate);

        if (axisOptions.labels.visible) {
            if (axisOptions.type === 'key' && axisOptions.labels.positition === 'rotated' && (axisOptions.orient === 'top' || axisOptions.orient === 'bottom'))
                this.rotateLabels(axisElement, axisOptions.orient);

            if ((axisOptions.orient === 'left' || axisOptions.orient === 'right') && axisOptions.type === 'key' && Scale.getScaleStep(scale) >= MINIMAL_STEP_SIZE_FOR_WRAPPING) {
                axisElement.selectAll<SVGGElement, unknown>('.tick text').call(AxisHelper.wrapHandler, axisOptions.labels.maxSize);
            } else {
                this.cropLabels(block, scale, scaleOptions, axisOptions, blockSize);
            }

            if (axisOptions.type === 'key') {
                this.alignLabelsInKeyAxis(axisOptions, axisElement);
            }
        } else {
            this.hideLabels(axisElement);
        }
    }

    private static updateAxisElement(axisGenerator: IAxis<any>, axisElement: Selection<BaseType, any, BaseType, any>, translate: TranslateModel, transitionDuration: number = 0): Promise<string> {
        return new Promise(resolve => {
            let axisHandler: Selection<BaseType, any, BaseType, any> | Transition<BaseType, any, BaseType, any> = axisElement;
            if (transitionDuration > 0) {
                axisHandler = axisHandler
                    .interrupt()
                    .transition()
                    .duration(transitionDuration)
                    .on('end', () => resolve('updated'));
            }
            axisHandler.attr('transform', `translate(${translate.translateX}, ${translate.translateY})`)
                .call(axisGenerator.bind(this));

            if (transitionDuration <= 0)
                resolve('updated');
        });
    }

    private static getBaseAxisGenerator(axisOptions: AxisModelOptions, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel): IAxis<any> {
        const axis = AxisHelper.getAxisByOrient(axisOptions.orient, scale);
        if (!axisOptions.ticks.flag)
            this.removeTicks(axis);
        this.setAxisLabelPaddingByOrient(axis, axisOptions);
        this.setAxisFormat(scale, scaleOptions, axis);

        return axis;
    }

    private static setStepSize(blockSize: Size, margin: BlockMargin, axis: IAxis<any>, axisOptions: AxisModelOptions, scale: ScaleKeyModel | ScaleValueModel): void {
        let axisLength = blockSize.width - margin.left - margin.right;
        if (axisOptions.orient === 'left' || axisOptions.orient === 'right') {
            axisLength = blockSize.height - margin.top - margin.bottom;
        }

        if (axisLength / 10 < MINIMAL_STEP_SIZE) {
            if (Math.floor(axisLength / MINIMAL_STEP_SIZE) > 2)
                axis.ticks(Math.floor(axisLength / MINIMAL_STEP_SIZE));
            else
                axis.tickValues([min(scale.domain), max(scale.domain)]);
        }
    }

    private static alignLabelsInKeyAxis(axisOptions: AxisModelOptions, axisElement: Selection<SVGGElement, unknown, HTMLElement, any>): void {
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

    private static setAxisLabelPaddingByOrient(axis: IAxis<any>, axisOptions: AxisModelOptions): void {
        let axisLabelPadding = AXIS_HORIZONTAL_LABEL_PADDING;
        if (axisOptions.orient === 'left' || axisOptions.orient === 'right')
            axisLabelPadding = AXIS_VERTICAL_LABEL_PADDING;
        axis.tickPadding(axisLabelPadding);
    }

    private static rotateLabels(axisElement: Selection<SVGGElement, unknown, HTMLElement, any>, keyAxisOrient: Orient): void {
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

    private static removeTicks(axis: IAxis<any>): void {
        axis.tickSize(0);
    }

    private static setAxisFormat(scale: AxisScale<any>, scaleOptions: ScaleValueModel | ScaleKeyModel, axis: IAxis<any>): void {
        if (scaleOptions.type === 'linear') {
            if (max(scale.domain()) > 1000) {
                axis.tickFormat(format('.2s')); // examples: 1.2K, 350, 0 
            }
        }
    }

    private static cropLabels(block: Block, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions, blockSize: Size): void {
        if (scaleOptions.type === 'point' || scaleOptions.type === 'band') {
            const axisTextBlocks = block.getSvg().select(`.${axisOptions.cssClass}`).selectAll<SVGGraphicsElement, unknown>('text');
            let labelSize: number;
            if ((axisOptions.orient === 'left' || axisOptions.orient === 'right') || (axisOptions.type === 'key' && axisOptions.labels.positition === 'rotated'))
                labelSize = axisOptions.labels.maxSize;
            else
                labelSize = (scale as ScaleBand<string>).step();

            Helper.cropLabels(axisTextBlocks, labelSize);

            if (scaleOptions.type === 'point' && axisOptions.labels.positition === 'straight' && (axisOptions.orient === 'top' || axisOptions.orient === 'bottom')) {
                this.cropAndAlignExtremeLabels(block, labelSize, axisOptions, blockSize);
            }
        }
    }

    private static cropAndAlignExtremeLabels(block: Block, labelSize: number, axisOptions: AxisModelOptions, blockSize: Size): void {
        const lastTick = block.getSvg().select(`.${axisOptions.cssClass}`).select<SVGGraphicsElement>('.tick:last-of-type');
        const lastLabel = lastTick.select<SVGGraphicsElement>('text');
        const translateX = Helper.getTranslateNumbers(lastTick.attr('transform'))[0];

        if (translateX + lastLabel.node().getBBox().width + axisOptions.translate.translateX > blockSize.width) {
            lastLabel.attr('text-anchor', 'end');
            Helper.cropLabels(lastLabel, labelSize / 2);
        }

        const firtsLabel = block.getSvg()
            .select(`.${axisOptions.cssClass}`)
            .select('.tick:first-of-type')
            .select<SVGGraphicsElement>('text');

        if (axisOptions.translate.translateX - firtsLabel.node().getBBox().width < 0) {
            firtsLabel.attr('text-anchor', 'start');
            Helper.cropLabels(firtsLabel, labelSize / 2);
        }
    }

    private static hideLabels(axisElement: Selection<SVGGElement, unknown, BaseType, unknown>): void {
        axisElement.selectAll('.tick text')
            .style('display', 'none');
    }
}