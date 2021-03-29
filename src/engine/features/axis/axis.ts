import { max } from 'd3-array';
import { format } from 'd3-format';
import { AxisScale, Axis as IAxis } from 'd3-axis';
import { AxisModelOptions, BlockMargin, IAxisModel, IScaleModel, ScaleKeyModel, ScaleValueModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Scale, Scales } from "../scale/scale";
import { AXIS_VERTICAL_LABEL_PADDING } from "../../../model/marginModel";
import { NamesManager } from '../../namesManager';
import { AxisHelper } from './axisHelper';

import { AxisLabelHelper } from './axisLabelDomHelper';
import { AxisDomHelper } from './axisDomHelper';
import { Size } from '../../../config/config';


const MINIMAL_STEP_SIZE_FOR_WRAPPING = 38;

export class Axis {
    public static axesClass = NamesManager.getClassName('axis');

    public static render(block: Block, scales: Scales, scaleModel: IScaleModel, axisModel: IAxisModel, margin: BlockMargin, blockSize: Size): void {
        if (axisModel.valueAxis.visibility)
            this.renderAxis(block, scales.value, scaleModel.value, axisModel.valueAxis, margin, blockSize);
        if (axisModel.keyAxis.visibility)
            this.renderAxis(block, scales.key, scaleModel.key, axisModel.keyAxis, margin, blockSize);
    }

    public static update(block: Block, scales: Scales, scalesOptions: IScaleModel, axisModel: IAxisModel, blockSize: Size, keyDomainsEquality: boolean): void {
        if (axisModel.valueAxis.visibility)
            this.updateValueAxis(block, scales.value, scalesOptions.value, axisModel.valueAxis);
        if (axisModel.keyAxis.visibility)
            this.updateKeyAxis(block, scales.key, scalesOptions.key, axisModel.keyAxis, blockSize, keyDomainsEquality);
    }

    private static updateValueAxis(block: Block, scaleValue: AxisScale<any>, scaleOptions: ScaleValueModel, axisOptions: AxisModelOptions): void {
        const axisGenerator = this.getBaseAxisGenerator(axisOptions, scaleValue, scaleOptions);

        const axisElement = block.getSvg()
            .select<SVGGElement>(`g.${axisOptions.cssClass}`);
        AxisDomHelper.updateAxisElement(axisGenerator, axisElement, axisOptions.translate, block.transitionManager.durations.chartUpdate);
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
        AxisDomHelper.updateAxisElement(axisGenerator, axisElement, axisOptions.translate, domainNotUpdated ? 0 : block.transitionManager.durations.chartUpdate)
            .then(() => {
                if (axisOptions.orient === 'bottom' || axisOptions.orient === 'top') {
                    // Обратное выравнивание лейблов, если они были перевернуты, но теперь могут отображаться прямо
                    AxisDomHelper.rotateElementsBack(axisElement, axisOptions.labels.positition);
                    AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
                }
                if (axisOptions.orient === 'left' || axisOptions.orient === 'right') {
                    if (Scale.getScaleStep(scaleKey) >= MINIMAL_STEP_SIZE_FOR_WRAPPING)
                        axisElement.selectAll<SVGGElement, unknown>('.tick text').call(AxisLabelHelper.wrapHandler, axisOptions.labels.maxSize);
                    else
                        AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
                    AxisLabelHelper.alignLabelsInKeyAxis(axisOptions, axisElement);
                }
                AxisLabelHelper.setTitles(axisElement, axisGenerator.scale().domain());
            });

        let frame = 0;
        const labelHandle = () => {
            frame++;
            if (frame < 10)
                requestAnimationFrame(labelHandle);
            if (axisOptions.orient === 'left' || axisOptions.orient === 'right') {
                if (Scale.getScaleStep(scaleKey) >= MINIMAL_STEP_SIZE_FOR_WRAPPING)
                    axisElement.selectAll<SVGGElement, unknown>('.tick text').call(AxisLabelHelper.wrapHandler, axisOptions.labels.maxSize);
                else
                    AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
                AxisLabelHelper.alignLabelsInKeyAxis(axisOptions, axisElement);
            }
            if (axisOptions.orient === 'bottom' || axisOptions.orient === 'top') {
                axisElement.selectAll('.tick > text').attr('text-anchor', 'center');
                if (axisOptions.labels.positition === 'rotated')
                    AxisLabelHelper.rotateLabels(axisElement, axisOptions.orient);
                AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
            }
        }
        requestAnimationFrame(labelHandle);
    }

    private static renderAxis(block: Block, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel, axisOptions: AxisModelOptions, margin: BlockMargin, blockSize: Size): void {
        const axisGenerator = this.getBaseAxisGenerator(axisOptions, scale, scaleOptions);

        if (axisOptions.type === 'value')
            AxisHelper.setStepSize(blockSize, margin, axisGenerator, axisOptions.orient, scaleOptions.domain);

        const axisElement = block.getSvg()
            .append('g')
            .attr('class', `${this.axesClass} ${axisOptions.cssClass} data-label`);

        AxisDomHelper.updateAxisElement(axisGenerator, axisElement, axisOptions.translate);

        if (axisOptions.labels.visible) {
            if (axisOptions.type === 'key' && axisOptions.labels.positition === 'rotated' && (axisOptions.orient === 'top' || axisOptions.orient === 'bottom'))
                AxisLabelHelper.rotateLabels(axisElement, axisOptions.orient);

            if ((axisOptions.orient === 'left' || axisOptions.orient === 'right') && axisOptions.type === 'key' && Scale.getScaleStep(scale) >= MINIMAL_STEP_SIZE_FOR_WRAPPING)
                axisElement.selectAll<SVGGElement, unknown>('.tick text').call(AxisLabelHelper.wrapHandler, axisOptions.labels.maxSize);
            else
                AxisLabelHelper.cropLabels(block, scale, scaleOptions, axisOptions, blockSize);

            if (axisOptions.type === 'key') {
                AxisLabelHelper.setTitles(axisElement, axisGenerator.scale().domain());
            }

            if (axisOptions.type === 'key') {
                AxisLabelHelper.alignLabelsInKeyAxis(axisOptions, axisElement);
            }
        } else {
            AxisLabelHelper.hideLabels(axisElement);
        }
    }

    private static getBaseAxisGenerator(axisOptions: AxisModelOptions, scale: AxisScale<any>, scaleOptions: ScaleKeyModel | ScaleValueModel): IAxis<any> {
        const axis = AxisHelper.getAxisByOrient(axisOptions.orient, scale);
        if (!axisOptions.ticks.flag)
            this.removeTicks(axis);
        AxisLabelHelper.setAxisLabelPaddingByOrient(axis, axisOptions);
        this.setTickFormat(scale, scaleOptions, axis);

        return axis;
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