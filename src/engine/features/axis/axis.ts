import { Selection, BaseType } from 'd3-selection';
import { min, max } from 'd3-array';
import { format } from 'd3-format';
import { AxisScale, Axis as IAxis } from 'd3-axis';
import { AxisModelOptions, BlockMargin, IAxisModel, IScaleModel, ScaleKeyModel, ScaleValueModel, Size, TranslateModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Scale, Scales } from "../scale/scale";
import { AXIS_VERTICAL_LABEL_PADDING } from "../../../model/marginModel";
import { NamesManager } from '../../namesManager';
import { AxisHelper } from './axisHelper';
import { Transition } from 'd3-transition';
import { AxisLabelHelper } from './axisLabelHelper';

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
            .select<SVGGElement>(`g.${axisOptions.cssClass}`);
        this.updateAxisElement(axisGenerator, axisElement, axisOptions.translate, block.transitionManager.durations.chartUpdate);
    }

    private static updateKeyAxis(block: Block, scaleKey: AxisScale<any>, scaleOptions: ScaleKeyModel, axisOptions: AxisModelOptions, blockSize: Size, domainNotUpdated: boolean): void {
        const axisGenerator = this.getBaseAxisGenerator(axisOptions, scaleKey, scaleOptions);

        if (axisOptions.labels.positition === 'rotated') { // Задание координат для перевернутых лейблов (если до этого они не были перевернуты)
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
                    AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
                }
                if (axisOptions.orient === 'left' || axisOptions.orient === 'right') {
                    if (Scale.getScaleStep(scaleKey) >= MINIMAL_STEP_SIZE_FOR_WRAPPING)
                        axisElement.selectAll<SVGGElement, unknown>('.tick text').call(AxisHelper.wrapHandler, axisOptions.labels.maxSize);
                    else
                        AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);

                    AxisLabelHelper.alignLabelsInKeyAxis(axisOptions, axisElement);
                }
            });

        if (axisOptions.orient === 'left' || axisOptions.orient === 'right') {
            AxisLabelHelper.alignLabelsInKeyAxis(axisOptions, axisElement);
        }
        if (axisOptions.orient === 'bottom' || axisOptions.orient === 'top') {
            axisElement.selectAll('.tick > text').attr('text-anchor', 'center');
            if (axisOptions.labels.positition === 'rotated')
                AxisLabelHelper.rotateLabels(axisElement, axisOptions.orient);
            AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
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
                AxisLabelHelper.rotateLabels(axisElement, axisOptions.orient);

            if ((axisOptions.orient === 'left' || axisOptions.orient === 'right') && axisOptions.type === 'key' && Scale.getScaleStep(scale) >= MINIMAL_STEP_SIZE_FOR_WRAPPING)
                axisElement.selectAll<SVGGElement, unknown>('.tick text').call(AxisHelper.wrapHandler, axisOptions.labels.maxSize);
            else
                AxisLabelHelper.cropLabels(block, scale, scaleOptions, axisOptions, blockSize);

            if (axisOptions.type === 'key') {
                AxisLabelHelper.alignLabelsInKeyAxis(axisOptions, axisElement);
            }
        } else {
            AxisLabelHelper.hideLabels(axisElement);
        }
    }

    private static updateAxisElement(axisGenerator: IAxis<any>, axisElement: Selection<SVGGElement, any, BaseType, any>, translate: TranslateModel, transitionDuration: number = 0): Promise<string> {
        return new Promise(resolve => {
            let axisHandler: Selection<SVGGElement, any, BaseType, any> | Transition<SVGGElement, any, BaseType, any> = axisElement;
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
        AxisLabelHelper.setAxisLabelPaddingByOrient(axis, axisOptions);
        this.setTickFormat(scale, scaleOptions, axis);

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

    private static removeTicks(axis: IAxis<any>): void {
        axis.tickSize(0);
    }

    private static setTickFormat(scale: AxisScale<any>, scaleOptions: ScaleValueModel | ScaleKeyModel, axis: IAxis<any>): void {
        if (scaleOptions.type === 'linear') {
            if (max(scale.domain()) > 1000) {
                axis.tickFormat(format('.2s')); // examples: 1.2K, 350, 0 
            }
        }
    }
}