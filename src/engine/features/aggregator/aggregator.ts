import { interpolateNumber } from "d3-interpolate";
import { Selection } from "d3-selection";
import { DataType } from "../../../designer/designerConfig";
import { DonutAggregatorModel, Field } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helpers/helper";
import { ValueFormatter } from "../../valueFormatter";
import { Translate } from "../../polarNotation/donut/donut";

export interface AggregatorInfo {
	name: string;
	value: number | string;
	format: DataType;
	marginInPercent: number;
}

export class Aggregator {
	public static readonly aggregatorValueClass = "aggregator-value";

	private static readonly aggregatorTitleClass = "aggregator-name";
	private static readonly aggregatorObjectClass = "aggregator-object";

	public static render(
		block: Block,
		valueField: Field,
		innerRadius: number,
		translate: Translate,
		fontSize: number,
		settings: DonutAggregatorModel
	): void {
		const aggregator = this.buildConfig(valueField, settings);
		this.renderText(block, innerRadius, aggregator, fontSize, translate);
	}

	public static update(block: Block, valueField: Field, settings: DonutAggregatorModel): void {
		const aggregator = this.buildConfig(valueField, settings);
		this.updateText(block, aggregator, typeof aggregator.value === "string");
	}

	private static buildConfig(valueField: Field, settings: DonutAggregatorModel): AggregatorInfo {
		return {
			name: settings.content.title,
			value: settings.content.value,
			format: valueField.format,
			marginInPercent: settings.margin
		};
	}

	private static renderText(
		block: Block,
		innerRadius: number,
		aggregatorInfo: AggregatorInfo,
		fontSize: number,
		translate: Translate
	): void {
		if (innerRadius > 30) {
			const aggregatorObject = this.renderAggregatorObject(block, innerRadius, translate);
			const wrapper = this.renderWrapper(aggregatorObject);

			wrapper
				.append<HTMLDivElement>("div")
				.attr("class", this.aggregatorValueClass)
				.attr("title", this.formatValue(aggregatorInfo.format, aggregatorInfo.value))
				.style("text-align", "center")
				.style("font-size", `${fontSize}px`)
				.text(this.formatValue(aggregatorInfo.format, aggregatorInfo.value));

			const titleBlock = wrapper
				.append("div")
				.attr("class", this.aggregatorTitleClass)
				.attr("title", aggregatorInfo.name)
				.style("text-align", "center")
				.text(aggregatorInfo.name);

			this.setTitleFontSize(titleBlock, innerRadius);
			this.reCalculateAggregatorFontSize(
				aggregatorObject.node().getBoundingClientRect().width,
				block,
				aggregatorInfo.marginInPercent
			);
		}
	}

	private static formatValue(format: string, value: string | number) {
		if (typeof value === "string") return value;
		return ValueFormatter.formatField(format, value);
	}

	private static updateText(block: Block, newAggregator: AggregatorInfo, withoutAnimation?: boolean): void {
		const aggregatorObject = block.getSvg().select<SVGForeignObjectElement>(`.${this.aggregatorObjectClass}`);

		const thisClass = this;
		const valueBlock = block.getSvg().select<HTMLDivElement>(`.${this.aggregatorValueClass}`);

		if (withoutAnimation) {
			valueBlock.text(this.formatValue(newAggregator.format, newAggregator.value));
			return;
		}

		valueBlock
			.interrupt()
			.transition()
			.duration(block.transitionManager.durations.chartUpdate)
			.tween("text", function () {
				const newValue =
					typeof newAggregator.value === "string" ? parseFloat(newAggregator.value) : newAggregator.value;
				const oldValue = Helper.parseFormattedToNumber(this.textContent, ",");
				const precision = Helper.calcDigitsAfterDot(newValue);
				const interpolateFunc = interpolateNumber(oldValue, newValue);

				return (t) => {
					this.textContent = thisClass.formatValue(
						newAggregator.format,
						parseFloat(interpolateFunc(t).toFixed(precision))
					);
					thisClass.reCalculateAggregatorFontSize(
						aggregatorObject.node().getBoundingClientRect().width,
						block,
						newAggregator.marginInPercent
					);
				};
			});
	}

	private static reCalculateAggregatorFontSize(wrapperSize: number, block: Block, pad: number): void {
		const aggregatorValue = block.getSvg().select<HTMLDivElement>(`.${this.aggregatorValueClass}`);

		const sizeCoefficient = 0.25;
		let fontSize = wrapperSize * sizeCoefficient;
		aggregatorValue.style("font-size", `${fontSize}px`);

		const margin = (pad / 100) * wrapperSize;

		while (aggregatorValue.node().getBoundingClientRect().width > wrapperSize - margin * 2 && fontSize > 12) {
			aggregatorValue.style("font-size", `${(fontSize -= 2)}px`);
		}
	}

	private static setTitleFontSize(
		aggregatorTitle: Selection<HTMLDivElement, unknown, HTMLElement, any>,
		innerRadius: number
	) {
		const sizeCoefficient = 0.15;
		aggregatorTitle.style("font-size", `${Math.round(innerRadius * sizeCoefficient)}px`);
		aggregatorTitle.style("max-height", `${sizeCoefficient * 100}%`);
	}

	private static renderAggregatorObject(
		block: Block,
		innerRadius: number,
		translate: Translate
	): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
		return block
			.getSvg()
			.append("foreignObject")
			.attr("class", this.aggregatorObjectClass)
			.attr("transform-origin", "center")
			.attr("width", innerRadius * 2)
			.attr("height", innerRadius * 2)
			.attr("transform", `translate(${translate.x - innerRadius}, ${translate.y - innerRadius})`)
			.style("pointer-events", `none`);
	}

	private static renderWrapper(
		aggregatorObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>
	): Selection<HTMLDivElement, unknown, HTMLElement, any> {
		return aggregatorObject
			.append<HTMLDivElement>("xhtml:div")
			.style("width", "100%")
			.style("height", "100%")
			.style("border-radius", "50%")
			.style("display", "flex")
			.style("flex-direction", "column")
			.style("justify-content", "center")
			.style("align-items", "center");
	}
}
