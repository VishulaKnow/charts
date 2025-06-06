import { Selection, BaseType } from "d3-selection";
import { MdtChartsDataRow } from "../../config/config";
import { ChartStyle, TwoDimensionalChartModel } from "../../model/model";
import { Block } from "../block/block";
import { MarkDot } from "../features/markDots/markDot";
import { Bar } from "../twoDimensionalNotation/bar/bar";

type StyleColorType = "fill" | "stroke";

export enum SelectionCondition {
	Include,
	Exclude
}

export class DomSelectionHelper {
	public static setCssClasses(elem: Selection<BaseType, unknown, any, unknown>, cssClasses: string[]): void {
		cssClasses.forEach((cssClass) => {
			elem.classed(cssClass, true);
		});
	}

	public static get2DChartElements(
		block: Block,
		chart: TwoDimensionalChartModel
	): Selection<BaseType, MdtChartsDataRow, BaseType, unknown> {
		if (chart.type === "line" || chart.type === "area") return MarkDot.getMarkDotForChart(block, chart.cssClasses);
		else return Bar.get().getAllBarsForChart(block, chart.cssClasses);
	}

	public static getSelectionNumericAttr(
		selection: Selection<BaseType, unknown, BaseType, unknown>,
		attrName: string
	): number {
		return parseFloat(selection.attr(attrName));
	}

	public static setChartStyle(
		elements: Selection<BaseType, unknown, BaseType, unknown>,
		chartStyle: ChartStyle,
		fieldIndex: number,
		styleType: StyleColorType
	): void {
		this.setChartElementColor(elements, chartStyle.elementColors, fieldIndex, styleType);
		this.setChartOpacity(elements, chartStyle.opacity);
	}

	public static setChartElementColor(
		elements: Selection<BaseType, unknown, BaseType, unknown>,
		colorPalette: string[],
		fieldIndex: number,
		styleType: StyleColorType
	): void {
		elements.style(styleType, colorPalette[fieldIndex % colorPalette.length]);
	}

	public static cropSvgLabels(
		labelBlocks: Selection<SVGGraphicsElement, unknown, BaseType, unknown>,
		maxWidth: number
	): void {
		labelBlocks.nodes().forEach((node) => {
			if (node.getBBox().width > maxWidth) {
				const text = node.textContent;
				let textLength = text.length;
				while (node.getBBox().width > maxWidth && textLength > 0) {
					node.textContent = text.substring(0, --textLength) + "...";
				}
				if (textLength === 0) node.textContent = "";
			}
		});
	}

	/**
	 * Возвращает выборку элементов, ключи которых содержатся или НЕ содержатся в переданном массиве
	 * @param initialSelection Изначальная выборка
	 * @param dataWrapped Содержаться ли данные в обертке .data
	 * @param keyFieldName название поля ключей
	 * @param keyValues значения ключей
	 * @param condition включать или исключать элменты по ключам
	 * @returns Выборка по ключам
	 */
	public static getChartElementsByKeys<T extends BaseType>(
		initialSelection: Selection<T, MdtChartsDataRow, BaseType, unknown>,
		dataWrapped: boolean,
		keyFieldName: string,
		keyValues: string[],
		condition: SelectionCondition = SelectionCondition.Include
	): Selection<T, any, BaseType, unknown> {
		return initialSelection.filter((d) => {
			let i: number;
			if (dataWrapped) i = keyValues.findIndex((kv) => kv === d.data[keyFieldName]);
			else i = keyValues.findIndex((kv) => kv === d[keyFieldName]);

			return condition === SelectionCondition.Exclude ? i === -1 : i !== -1;
		});
	}

	private static setChartOpacity(elements: Selection<BaseType, unknown, BaseType, unknown>, opacity: number): void {
		elements.attr("opacity", opacity);
	}
}
