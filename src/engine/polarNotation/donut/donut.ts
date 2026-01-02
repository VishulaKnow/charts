import { Arc, Pie, PieArcDatum } from "d3-shape";
import { Selection, BaseType } from "d3-selection";
import { interpolate } from "d3-interpolate";
import { BlockMargin, DonutChartSettings, DonutChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Aggregator } from "../../features/aggregator/aggregator";
import { DonutHelper } from "./donutHelper";
import { DomSelectionHelper } from "../../helpers/domSelectionHelper";
import { MdtChartsDataRow, Size } from "../../../config/config";
import { ColorReader } from "../../colorReader/colorReader";

export interface Translate {
	x: number;
	y: number;
}

export class Donut {
	public static readonly donutBlockClass = "donut-block";
	public static readonly arcPathClass = "arc-path";
	public static readonly arcItemClass = "arc";
	public static readonly arcHighlightedClass = "arc-highlighted";
	public static readonly arcClonesGroupClass = "arc-clones";
	public static readonly arcShadowsGroupClass = "arc-shadow-clones";
	public static readonly arcCloneClass = "arc-clone";
	public static readonly arcShadowClass = "arc-shadow-clone";

	public static render(
		block: Block,
		data: MdtChartsDataRow[],
		chart: DonutChartModel,
		settings: DonutChartSettings
	): void {
		const arcGenerator = DonutHelper.getArcGenerator(chart.sizes.outerRadius, chart.sizes.innerRadius);
		const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, settings.padAngle);

		Aggregator.render(
			block,
			chart.data.valueField,
			chart.sizes.innerRadius,
			chart.sizes.translate,
			chart.sizes.thickness,
			settings.aggregator
		);

		const donutBlock = block
			.getSvg()
			.append("g")
			.attr("class", this.donutBlockClass)
			.attr("x", chart.sizes.translate.x)
			.attr("y", chart.sizes.translate.y)
			.attr("transform", `translate(${chart.sizes.translate.x}, ${chart.sizes.translate.y})`);

		this.renderNewArcItems(arcGenerator, pieGenerator, donutBlock, data, chart);
		this.renderClonesG(donutBlock);
	}

	public static update(
		block: Block,
		data: MdtChartsDataRow[],
		chart: DonutChartModel,
		donutSettings: DonutChartSettings,
		keyField: string
	): Promise<any> {
		const arcGenerator = DonutHelper.getArcGenerator(chart.sizes.outerRadius, chart.sizes.innerRadius);
		const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);

		const oldData = block
			.getSvg()
			.selectAll(`.${this.donutBlockClass}`)
			.selectAll<SVGPathElement, PieArcDatum<MdtChartsDataRow>>("path")
			.data()
			.map((d) => d.data);

		const dataNewZeroRows = DonutHelper.mergeDataWithZeros(
			data,
			oldData,
			keyField,
			ColorReader.getChartColorField(chart)
		);
		const dataExtraZeroRows = DonutHelper.mergeDataWithZeros(
			oldData,
			data,
			keyField,
			ColorReader.getChartColorField(chart)
		);

		const donutBlock = block.getSvg().select<SVGGElement>(`.${this.donutBlockClass}`);

		donutBlock
			.attr("x", chart.sizes.translate.x)
			.attr("y", chart.sizes.translate.y)
			.attr("transform", `translate(${chart.sizes.translate.x}, ${chart.sizes.translate.y})`);

		this.renderNewArcItems(arcGenerator, pieGenerator, donutBlock, dataNewZeroRows, chart);

		const path = this.getAllArcGroups(block).data(pieGenerator(dataExtraZeroRows)).select<SVGPathElement>("path");
		const items = this.getAllArcGroups(block).data(pieGenerator(data));
		this.setElementsColor(this.getAllArcGroups(block), chart);

		Aggregator.update(
			block,
			chart.data.valueField,
			donutSettings.aggregator,
			chart.sizes.innerRadius,
			chart.sizes.translate
		);

		return new Promise((resolve) => {
			this.raiseClonesG(block);
			path.interrupt()
				.transition()
				.duration(block.transitionManager.durations.chartUpdate)
				.on("end", () => {
					items.exit().remove();
					resolve("updated");
				})
				.attrTween("d", function (d) {
					const interpolateFunc = interpolate((this as any)._currentData, d);
					return (t) => {
						(this as any)._currentData = interpolateFunc(t); // _current - старые данные до обновления, задаются во время рендера
						return arcGenerator((this as any)._currentData);
					};
				});
		});
	}

	public static updateColors(block: Block, chart: DonutChartModel): void {
		this.setElementsColor(this.getAllArcGroups(block), chart);
	}

	public static getAllArcGroups(
		block: Block
	): Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown> {
		return block.getSvg().selectAll(`.${this.arcItemClass}`) as Selection<
			SVGGElement,
			PieArcDatum<MdtChartsDataRow>,
			SVGGElement,
			unknown
		>;
	}

	public static getAllArcClones(
		block: Block
	): Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown> {
		return block.getSvg().selectAll(`.${Donut.arcCloneClass}`) as Selection<
			SVGGElement,
			PieArcDatum<MdtChartsDataRow>,
			SVGGElement,
			unknown
		>;
	}

	public static getAllArcShadows(
		block: Block
	): Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown> {
		return block.getSvg().selectAll(`.${this.arcShadowClass}`) as Selection<
			SVGGElement,
			PieArcDatum<MdtChartsDataRow>,
			SVGGElement,
			unknown
		>;
	}

	private static renderNewArcItems(
		arcGenerator: Arc<any, PieArcDatum<MdtChartsDataRow>>,
		pieGenerator: Pie<any, MdtChartsDataRow>,
		donutBlock: Selection<SVGGElement, unknown, HTMLElement, any>,
		data: MdtChartsDataRow[],
		chart: DonutChartModel
	): void {
		const items = donutBlock
			.selectAll(`.${this.arcItemClass}`)
			.data(pieGenerator(data))
			.enter()
			.append("g")
			.attr("class", this.arcItemClass);

		const arcs = items
			.append("path")
			.attr("d", arcGenerator)
			.attr("class", this.arcPathClass)
			.each(function (d) {
				(this as any)._currentData = d;
			}); // _currentData используется для получения текущих данных внутри функции обновления.

		DomSelectionHelper.setCssClasses(arcs, chart.cssClasses);
		this.setElementsColor(items, chart);
	}

	private static setElementsColor(
		arcItems: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		chart: DonutChartModel
	): void {
		arcItems.select("path").style("fill", ({ data }, i) => ColorReader.getColorForArc(data, chart, i));
	}

	/**
	 * Рендер группы для клонов сегментов доната внутри donut-block. Объекдиняет в себе стили для клонов
	 */
	private static renderClonesG(donutBlock: Selection<SVGGElement, unknown, BaseType, unknown>): void {
		const clonesShadowsG = donutBlock.append("g").attr("class", this.arcShadowsGroupClass).raise();
		const clonesG = donutBlock.append("g").attr("class", this.arcClonesGroupClass).raise();
		// ElementHighlighter.setShadowFilter(clonesG);
	}

	private static raiseClonesG(block: Block): void {
		block.getSvg().select(`.${this.donutBlockClass}`).select(`.${this.arcShadowsGroupClass}`).raise();

		block.getSvg().select(`.${this.donutBlockClass}`).select(`.${this.arcClonesGroupClass}`).raise();
	}
}
