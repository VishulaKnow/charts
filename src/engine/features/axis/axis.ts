import { AxisScale } from "d3-axis";
import {
	AxisModelOptions,
	DiscreteAxisLabelModel,
	IAxisModel,
	IScaleModel,
	ScaleKeyModel,
	ScaleValueModel
} from "../../../model/model";
import { Block } from "../../block/block";
import { Scale, ScalesWithSecondary } from "../scale/scale";
import { NamesHelper } from "../../helpers/namesHelper";
import { AxisHelper } from "./axisHelper";
import { AxisLabelHelper } from "./axisLabelDomHelper";
import { AxisDomHelper } from "./axisDomHelper";
import { Size } from "../../../config/config";
import { BaseType, select, Selection } from "d3-selection";
import { AxisLabelsEventManager } from "./axisLabelsEventManager";
import { AXIS_VERTICAL_LABEL_PADDING } from "../../../model/margin/twoDim/twoDimMarginModel";

const MINIMAL_STEP_SIZE_FOR_WRAPPING = 38;

export class Axis {
	public static axesClass = NamesHelper.getClassName("axis");

	public static render(
		block: Block,
		scales: ScalesWithSecondary,
		scaleModel: IScaleModel,
		axisModel: IAxisModel,
		blockSize: Size
	): void {
		if (axisModel.value.visibility)
			this.renderAxis(block, scales.value, scaleModel.value, axisModel.value, blockSize);
		if (axisModel.valueSecondary?.visibility)
			this.renderAxis(
				block,
				scales.valueSecondary,
				scaleModel.valueSecondary,
				axisModel.valueSecondary,
				blockSize
			);
		if (axisModel.key.visibility) this.renderAxis(block, scales.key, scaleModel.key, axisModel.key, blockSize);
	}

	public static update(
		block: Block,
		scales: ScalesWithSecondary,
		scalesOptions: IScaleModel,
		axisModel: IAxisModel,
		blockSize: Size,
		keyDomainsEquality: boolean
	): void {
		if (axisModel.value.visibility)
			this.updateValueAxis(block, scales.value, scalesOptions.value, axisModel.value, blockSize);
		if (axisModel.valueSecondary?.visibility)
			this.updateValueAxis(
				block,
				scales.valueSecondary,
				scalesOptions.valueSecondary,
				axisModel.valueSecondary,
				blockSize
			);
		if (axisModel.key.visibility)
			this.updateKeyAxis(block, scales.key, scalesOptions.key, axisModel.key, blockSize, keyDomainsEquality);
	}

	public static raiseKeyAxis(block: Block, axisOptions: AxisModelOptions) {
		const axisElement = this.findAxis(block, axisOptions.cssClass);
		axisElement.raise();
	}

	private static findAxis(block: Block, axisCssClass: string) {
		return block.getSvg().select<SVGGElement>(`g.${axisCssClass}`);
	}

	private static renderAxis(
		block: Block,
		scale: AxisScale<any>,
		scaleOptions: ScaleKeyModel | ScaleValueModel,
		axisOptions: AxisModelOptions,
		blockSize: Size
	): void {
		const axisGenerator = AxisHelper.getBaseAxisGenerator(axisOptions, scale);

		if (axisOptions.type === "value" && scaleOptions.type === "linear")
			AxisHelper.setValueAxisLabelsSettings(axisGenerator, scaleOptions, axisOptions.labels);
		else axisGenerator.tickFormat((d, i) => this.getKeyAxisTickFormat(d, i, axisOptions));

		const axisElement = block
			.getSvg()
			.append("g")
			.attr("class", `${this.axesClass} ${axisOptions.cssClass} data-label`);
		AxisDomHelper.updateAxisElement(axisGenerator, axisElement, axisOptions.translate);

		if (!axisOptions.line.visible) axisElement.select(".domain").style("display", "none");

		if (!axisOptions.labels.visible) {
			AxisLabelHelper.hideLabels(axisElement);
			return;
		}

		if (axisOptions.type === "key") {
			if (
				axisOptions.labels.position === "rotated" &&
				(axisOptions.orient === "top" || axisOptions.orient === "bottom")
			)
				AxisLabelHelper.rotateLabels(axisElement, axisOptions.orient);

			if (
				(axisOptions.orient === "left" || axisOptions.orient === "right") &&
				Scale.getScaleStep(scale) >= MINIMAL_STEP_SIZE_FOR_WRAPPING
			)
				axisElement
					.selectAll<SVGGElement, unknown>(".tick text")
					.call(AxisLabelHelper.wrapHandler, axisOptions.labels.maxSize);
			else AxisLabelHelper.cropLabels(block, scale, scaleOptions, axisOptions, blockSize);

			AxisLabelHelper.alignLabelsInKeyAxis(axisOptions, axisElement);
			AxisLabelsEventManager.setHoverEvents(block, axisElement);
			block.filterEventManager.eventEmitter.subscribe("change", (selectedKeys) => {
				this.handleLabelsHighlight(axisElement, selectedKeys);
			});
		}
		if (axisOptions.type === "value") {
			AxisLabelHelper.cropLabels(block, scale, scaleOptions, axisOptions, blockSize);
		}
	}

	private static updateValueAxis(
		block: Block,
		scaleValue: AxisScale<any>,
		scaleOptions: ScaleValueModel,
		axisOptions: AxisModelOptions,
		blockSize: Size
	): void {
		const axisGenerator = AxisHelper.getBaseAxisGenerator(axisOptions, scaleValue);
		AxisHelper.setValueAxisLabelsSettings(axisGenerator, scaleOptions, axisOptions.labels);
		const axisElement = block.getSvg().select<SVGGElement>(`g.${axisOptions.cssClass}`);
		AxisDomHelper.updateAxisElement(
			axisGenerator,
			axisElement,
			axisOptions.translate,
			block.transitionManager.durations.chartUpdate
		).then(() => {
			if (axisOptions.orient === "bottom" || axisOptions.orient === "top") {
				AxisLabelHelper.cropLabels(block, scaleValue, scaleOptions, axisOptions, blockSize);
			}
		});
	}

	private static updateKeyAxis(
		block: Block,
		scaleKey: AxisScale<any>,
		scaleOptions: ScaleKeyModel,
		axisOptions: AxisModelOptions,
		blockSize: Size,
		domainNotUpdated: boolean
	): void {
		const axisGenerator = AxisHelper.getBaseAxisGenerator(axisOptions, scaleKey);

		if (axisOptions.labels.position === "rotated") {
			// Задание координат для перевернутых лейблов (если до этого они не были перевернуты)
			if (axisOptions.orient === "bottom") axisGenerator.tickPadding(-4);
			else if (axisOptions.orient === "top") axisGenerator.tickPadding(-6);
		}
		axisGenerator.tickFormat((d, i) => this.getKeyAxisTickFormat(d, i, axisOptions));

		const axisElement = block.getSvg().select<SVGGElement>(`g.${axisOptions.cssClass}`);

		AxisLabelsEventManager.removeEvents(axisElement);

		if (axisOptions.orient === "left" || axisOptions.orient === "right") {
			axisElement.selectAll(".tick text").attr("y", null);
			if (axisOptions.orient === "left")
				axisGenerator.tickPadding(axisOptions.labels.maxSize + AXIS_VERTICAL_LABEL_PADDING);
		}

		// Если ключи оси не меняются, то обновление происходит без анимации
		AxisDomHelper.updateAxisElement(
			axisGenerator,
			axisElement,
			axisOptions.translate,
			domainNotUpdated ? 0 : block.transitionManager.durations.chartUpdate
		).then(() => {
			if (axisOptions.orient === "bottom" || axisOptions.orient === "top") {
				AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
			}
			AxisLabelsEventManager.setHoverEvents(block, axisElement);
			this.handleLabelsHighlight(axisElement, block.filterEventManager.getSelectedKeys());
		});

		// Ведется отсчет нескольких кадров, чтобы получить уже 100%-отрендеренные лейблы оси.
		let frame = 0;
		const labelHandler = () => {
			frame++;
			if (frame < 10) requestAnimationFrame(labelHandler);

			if (frame === 2) {
				axisElement.selectAll<SVGTextElement, string>(".tick").each(function (d) {
					if (scaleKey.domain().findIndex((key) => key === d) === -1) {
						select(this).style("opacity", 0);
					} else {
						select(this).style("opacity", 1);
					}
				});
			}

			if (axisOptions.orient === "left" || axisOptions.orient === "right") {
				if (Scale.getScaleStep(scaleKey) >= MINIMAL_STEP_SIZE_FOR_WRAPPING)
					axisElement
						.selectAll<SVGTextElement, unknown>(".tick text")
						.call(AxisLabelHelper.wrapHandler, axisOptions.labels.maxSize);
				else AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);

				AxisLabelHelper.alignLabelsInKeyAxis(axisOptions, axisElement);
			}
			if (axisOptions.orient === "bottom" || axisOptions.orient === "top") {
				if (axisOptions.labels.position === "rotated")
					AxisLabelHelper.rotateLabels(axisElement, axisOptions.orient);
				if (axisOptions.labels.position === "straight")
					// Обратное выравнивание лейблов, если они были перевернуты, но теперь могут отображаться прямо
					AxisDomHelper.rotateElementsBack(axisElement);

				AxisLabelHelper.cropLabels(block, scaleKey, scaleOptions, axisOptions, blockSize);
			}
		};
		requestAnimationFrame(labelHandler);
	}

	private static handleLabelsHighlight(
		axisElement: Selection<SVGGElement, any, BaseType, any>,
		selectedKeys: string[]
	): void {
		const labels = axisElement.selectAll<SVGTextElement, string>(".tick text");

		if (selectedKeys.length === 0) labels.classed("mdt-charts-opacity-inactive", false);
		else
			labels.each(function (this: SVGTextElement, data: string) {
				const isActive = selectedKeys.includes(data);
				select(this).classed("mdt-charts-opacity-inactive", !isActive);
			});
	}

	private static getKeyAxisTickFormat(
		datumKey: string,
		index: number,
		axisOptions: AxisModelOptions
	): string | undefined {
		const shouldBeShown = axisOptions.labels.showTick(datumKey, index);
		return shouldBeShown ? (axisOptions.labels as DiscreteAxisLabelModel).format({ key: datumKey }) : undefined;
	}
}
