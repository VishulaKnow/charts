import { Selection, BaseType, select } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import { BlockMargin, MarkersStyleOptions, TwoDimensionalChartModel } from "../../model/model";
import { Block } from "../block/block";
import { easeLinear } from "d3-ease";
import { interrupt, Transition } from "d3-transition";
import { DomSelectionHelper, SelectionCondition } from "../helpers/domSelectionHelper";
import { MdtChartsDataRow, Size } from "../../config/config";
import { Donut } from "../polarNotation/donut/donut";
import { MarkDot } from "../features/markDots/markDot";
import { RectElemWithAttrs } from "../twoDimensionalNotation/bar/bar";
import { Helper } from "../helpers/helper";
import chroma from "chroma-js";
import { NamesHelper } from "../helpers/namesHelper";
import { DonutHelper } from "../polarNotation/donut/donutHelper";

export class ElementHighlighter {
	private static inactiveElemClass = NamesHelper.getClassName("opacity-inactive");

	public static toggleActivityStyle(
		elementSelection: Selection<BaseType, unknown, BaseType, unknown>,
		isActive: boolean
	): void {
		elementSelection.classed(this.inactiveElemClass, !isActive);
	}

	/**
	 * @param blurPercent процент от макс. размера блюра
	 */
	public static setShadowFilter(
		elemSelection: Selection<BaseType, any, BaseType, any>,
		blurPercent: number = 1
	): void {
		const maxBlurSize = 8;

		elemSelection.each(function () {
			const elemFill = select(this).style("fill") || "rgb(0, 0, 0)";
			const colorInRgb = chroma(elemFill).css();
			const shadowColor = Helper.getRgbaFromRgb(colorInRgb, 0.6);
			select(this).style("filter", `drop-shadow(0px 0px ${blurPercent * maxBlurSize}px ${shadowColor})`);
		});
	}

	public static removeFilter(elemSelection: Selection<BaseType, any, BaseType, any>): void {
		elemSelection.style("filter", null);
	}

	public static removeShadowClone(
		block: Block,
		keyFieldName: string,
		selectedSegment: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		margin: BlockMargin,
		blockSize: Size,
		donutThickness: number
	): void {
		const shadowClone = Donut.getAllArcShadows(block).filter(
			(d: PieArcDatum<MdtChartsDataRow>) => d.data[keyFieldName] === selectedSegment.datum().data[keyFieldName]
		);
		this.removeFilter(shadowClone.select("path"));
		this.toggleDonutHighlightState(
			shadowClone,
			margin,
			blockSize,
			donutThickness,
			block.transitionManager.durations.higlightedScale,
			false
		).then(() => shadowClone.remove());
	}

	public static removeCloneForElem(
		block: Block,
		keyFieldName: string,
		selectedSegment: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>
	): void {
		const clone = Donut.getAllArcClones(block).filter(
			(d: PieArcDatum<MdtChartsDataRow>) => d.data[keyFieldName] === selectedSegment.datum().data[keyFieldName]
		);
		clone.remove();
	}

	public static removeDonutArcClones(block: Block): void {
		Donut.getAllArcClones(block).remove();
		Donut.getAllArcShadows(block).remove();
	}

	public static renderArcCloneAndHighlight(
		block: Block,
		margin: BlockMargin,
		arcSelection: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		blockSize: Size,
		donutThickness: number
	): void {
		const clone = this.makeArcClone(arcSelection, block);
		const shadowClone = this.makeArcShadow(arcSelection, block);
		this.toggleDonutHighlightState(
			arcSelection,
			margin,
			blockSize,
			donutThickness,
			block.transitionManager.durations.higlightedScale,
			true
		);
		this.toggleDonutHighlightState(
			clone,
			margin,
			blockSize,
			donutThickness,
			block.transitionManager.durations.higlightedScale,
			true
		);
		this.toggleDonutHighlightState(
			shadowClone,
			margin,
			blockSize,
			donutThickness,
			block.transitionManager.durations.higlightedScale,
			true
		);
		this.setShadowFilter(shadowClone.select("path"), donutThickness / 60);
	}

	public static toggleDonutHighlightState(
		segment: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		margin: BlockMargin,
		blockSize: Size,
		donutThickness: number,
		transitionDuration: number,
		on: boolean
	): Promise<any> {
		return new Promise((resolve) => {
			let scaleSize = 0;
			if (on) scaleSize = 5; // Если нужно выделить сегмент, то scaleSize не равен нулю и отображается увеличенным

			segment
				.select("path")
				.interrupt()
				.transition()
				.duration(transitionDuration)
				.on("end", () => resolve(""))
				.ease(easeLinear)
				.attr("d", (d, i) =>
					DonutHelper.getArcGeneratorObject(blockSize, margin, donutThickness)
						.outerRadius(DonutHelper.getOuterRadius(margin, blockSize) + scaleSize)
						.innerRadius(DonutHelper.getOuterRadius(margin, blockSize) - donutThickness - scaleSize)(d, i)
				);
		});
	}

	public static removeDonutHighlightingByKeys(
		arcSegments: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		keyFieldName: string,
		keyValues: string[],
		margin: BlockMargin,
		blockSize: Size,
		donutThickness: number
	): void {
		const segments = DomSelectionHelper.getChartElementsByKeys(
			arcSegments,
			true,
			keyFieldName,
			keyValues,
			SelectionCondition.Exclude
		);
		this.toggleDonutHighlightState(segments, margin, blockSize, donutThickness, 0, false);
	}

	public static setInactiveFor2D(block: Block, keyFieldName: string, charts: TwoDimensionalChartModel[]): void {
		charts.forEach((chart) => {
			const elems = DomSelectionHelper.get2DChartElements(block, chart);
			if (block.filterEventManager.getSelectedKeys().length === 0) {
				this.toggleActivityStyle(elems, true);
			} else {
				const unselectedElems = DomSelectionHelper.getChartElementsByKeys(
					elems,
					chart.isSegmented,
					keyFieldName,
					block.filterEventManager.getSelectedKeys(),
					SelectionCondition.Exclude
				);
				const selectedElems = DomSelectionHelper.getChartElementsByKeys(
					elems,
					chart.isSegmented,
					keyFieldName,
					block.filterEventManager.getSelectedKeys()
				);
				this.toggleActivityStyle(unselectedElems, false);
				this.toggleActivityStyle(selectedElems, true);
			}
		});
	}

	public static remove2DChartsFullHighlighting(
		block: Block,
		charts: TwoDimensionalChartModel[],
		transitionDuration: number = 0
	): void {
		charts.forEach((chart) => {
			const elems = DomSelectionHelper.get2DChartElements(block, chart);

			if (chart.type !== "bar") MarkDot.handleMarkDotVisibility(elems, chart.markersOptions, false);
			this.toggle2DElements(elems, false, chart, transitionDuration);
			this.toggleActivityStyle(elems, true);
		});
	}

	public static removeUnselected2DHighlight(
		block: Block,
		keyFieldName: string,
		charts: TwoDimensionalChartModel[],
		transitionDuration: number
	): void {
		charts.forEach((chart) => {
			const elems = DomSelectionHelper.get2DChartElements(block, chart);
			const selectedElems = DomSelectionHelper.getChartElementsByKeys(
				elems,
				chart.isSegmented,
				keyFieldName,
				block.filterEventManager.getSelectedKeys(),
				SelectionCondition.Exclude
			);

			if (chart.type !== "bar") MarkDot.handleMarkDotVisibility(selectedElems, chart.markersOptions, false);
			this.toggle2DElements(selectedElems, false, chart, transitionDuration);
			if (block.filterEventManager.getSelectedKeys().length > 0) this.toggleActivityStyle(selectedElems, false);
		});
	}

	public static toggle2DElements(
		elemSelection: Selection<BaseType, any, BaseType, any>,
		isHighlight: boolean,
		chart: TwoDimensionalChartModel,
		transitionDuration: number
	): void {
		if (chart.type === "area" || chart.type === "line") {
			elemSelection.call(this.toggleDot, isHighlight, chart.markersOptions.styles, transitionDuration);
		} else {
			this.toggleBar(elemSelection, isHighlight);
			if (isHighlight) {
				elemSelection.each(function (d) {
					const attrs = (this as RectElemWithAttrs).attrs;
					const blurPercent = (attrs.orient === "vertical" ? attrs.width : attrs.height) / 30; // 30px = max bar size, 13px - max blurSize
					ElementHighlighter.setShadowFilter(select(this), blurPercent);
				});
			} else {
				this.removeFilter(elemSelection);
			}
		}
	}

	private static makeArcClone(
		segment: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		block: Block
	): Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown> {
		const clone = this.renderDonutSegmentClone(segment, `${Donut.arcCloneClass}`);
		block
			.getSvg()
			.select(`.${Donut.arcClonesGroupClass}`)
			.append(function () {
				return clone.node();
			});
		return clone as Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown>;
	}

	private static makeArcShadow(
		segment: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		block: Block
	): Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown> {
		const shadowClone = this.renderDonutSegmentClone(segment, `${Donut.arcShadowClass}`);
		block
			.getSvg()
			.select(`.${Donut.arcShadowsGroupClass}`)
			.append(function () {
				return shadowClone.node();
			});
		return shadowClone as Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown>;
	}

	private static renderDonutSegmentClone(
		segment: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		newClass: string
	): Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown> {
		return segment
			.clone(true)
			.style("pointer-events", "none")
			.classed(`${Donut.arcCloneClass}`, false)
			.classed(newClass, true)
			.remove();
	}

	private static toggleBar(elemSelection: Selection<BaseType, any, BaseType, any>, isHighlight: boolean): void {
		const animationName = "bar-highlight";
		if (isHighlight) {
			elemSelection.each(function () {
				const attrs = (this as RectElemWithAttrs).attrs;
				const handler = select(this).interrupt(animationName).transition(animationName).duration(200);
				if (attrs.orient === "vertical") {
					handler.attr("x", attrs.x - attrs.scaleSize).attr("width", attrs.width + attrs.scaleSize * 2);
				} else {
					handler.attr("y", attrs.y - attrs.scaleSize).attr("height", attrs.height + attrs.scaleSize * 2);
				}
			});
		} else {
			elemSelection.each(function () {
				const attrs = (this as RectElemWithAttrs).attrs;
				const handler = select(this).interrupt(animationName).transition(animationName).duration(200);
				handler.attr("x", attrs.x).attr("width", attrs.width).attr("y", attrs.y).attr("height", attrs.height);
			});
		}
	}

	private static toggleDot(
		elementSelection: Selection<BaseType, MdtChartsDataRow, BaseType, unknown>,
		isScaled: boolean,
		styles: MarkersStyleOptions,
		transitionDuration: number = 0
	): void {
		const animationName = "size-scale";
		elementSelection.nodes().forEach((node) => {
			interrupt(node, animationName);
		});

		let elementsHandler:
			| Selection<BaseType, MdtChartsDataRow, BaseType, unknown>
			| Transition<BaseType, MdtChartsDataRow, BaseType, unknown> = elementSelection;
		if (transitionDuration > 0) {
			elementsHandler = elementsHandler
				.interrupt()
				.transition(animationName)
				.duration(transitionDuration)
				.ease(easeLinear);
		}

		(
			elementsHandler
				.attr("r", isScaled ? styles.highlighted.size.radius : styles.normal.size.radius)
				.style(
					"stroke-width",
					isScaled ? styles.highlighted.size.borderSize : styles.normal.size.borderSize
				) as
				| Selection<BaseType, MdtChartsDataRow, BaseType, unknown>
				| Transition<BaseType, MdtChartsDataRow, BaseType, unknown>
		).each(function () {
			select(this).style("fill", isScaled ? select(this).style("stroke") : "white");
		});
	}
}
