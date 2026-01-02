import { BaseType, select, Selection } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import { MdtChartsDataRow, Size } from "../../config/config";
import { BlockMargin, DonutChartSettings, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { Legend } from "../features/legend/legend";
import { DomSelectionHelper, SelectionCondition } from "../helpers/domSelectionHelper";
import { Donut } from "../polarNotation/donut/donut";
import { ElementHighlighter } from "./elementHighlighter";
import { MarkDot } from "../../engine/features/markDots/markDot";
import { DonutThicknessCalculator } from "../../model/notations/polar/donut/donutThicknessService";

export class SelectHighlighter {
	public static click2DHandler(
		multySelection: boolean,
		appendKey: boolean,
		keyValue: string,
		selectedKeys: string[],
		block: Block,
		options: TwoDimensionalOptionsModel
	): void {
		options.charts.forEach((chart) => {
			const selectedElements = DomSelectionHelper.getChartElementsByKeys(
				DomSelectionHelper.get2DChartElements(block, chart),
				chart.isSegmented,
				options.data.keyField.name,
				[keyValue]
			);
			const elements = DomSelectionHelper.get2DChartElements(block, chart);
			if (!appendKey) {
				ElementHighlighter.toggle2DElements(
					selectedElements,
					false,
					chart,
					block.transitionManager.durations.markerHover
				);
				if (chart.type !== "bar")
					MarkDot.handleMarkDotVisibility(selectedElements, chart.markersOptions, false);

				if (selectedKeys.length > 0) {
					ElementHighlighter.toggleActivityStyle(selectedElements, false);
				} else {
					ElementHighlighter.toggleActivityStyle(elements, true);
					if (chart.type !== "bar") MarkDot.handleMarkDotVisibility(elements, chart.markersOptions, false);
				}
				return;
			}

			if (multySelection) {
				ElementHighlighter.toggle2DElements(
					selectedElements,
					true,
					chart,
					block.transitionManager.durations.markerHover
				);
				ElementHighlighter.toggleActivityStyle(selectedElements, true);
				ElementHighlighter.toggleActivityStyle(
					DomSelectionHelper.getChartElementsByKeys(
						elements,
						chart.isSegmented,
						options.data.keyField.name,
						selectedKeys,
						SelectionCondition.Exclude
					),
					false
				);
			} else {
				ElementHighlighter.toggle2DElements(
					DomSelectionHelper.getChartElementsByKeys(
						elements,
						chart.isSegmented,
						options.data.keyField.name,
						selectedKeys,
						SelectionCondition.Exclude
					),
					false,
					chart,
					block.transitionManager.durations.markerHover
				);
				ElementHighlighter.toggleActivityStyle(elements, false);
				if (chart.type !== "bar") MarkDot.handleMarkDotVisibility(elements, chart.markersOptions, false);

				ElementHighlighter.toggleActivityStyle(selectedElements, true);
				ElementHighlighter.toggle2DElements(
					selectedElements,
					true,
					chart,
					block.transitionManager.durations.markerHover
				);
			}
			if (chart.type !== "bar") MarkDot.handleMarkDotVisibility(selectedElements, chart.markersOptions, true);
		});
	}

	public static clickPolarHandler(
		multySelection: boolean,
		appendKey: boolean,
		selectedSegment: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, BaseType, unknown>,
		selectedKeys: string[],
		block: Block,
		options: PolarOptionsModel,
		arcItems: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown>
	): void {
		if (!appendKey) {
			ElementHighlighter.toggleDonutHighlightState(
				selectedSegment,
				options.charts[0].sizes,
				block.transitionManager.durations.higlightedScale,
				false
			);
			ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, selectedSegment);
			ElementHighlighter.removeShadowClone(
				block,
				options.data.keyField.name,
				selectedSegment,
				options.charts[0].sizes
			);

			if (selectedKeys.length > 0) {
				ElementHighlighter.toggleActivityStyle(selectedSegment, false);
				ElementHighlighter.toggleActivityStyle(
					Legend.getItemsByKeys(block, selectedKeys, SelectionCondition.Exclude),
					false
				);
			} else {
				ElementHighlighter.toggleActivityStyle(Donut.getAllArcGroups(block), true);
				ElementHighlighter.toggleActivityStyle(
					Legend.getItemsByKeys(block, [], SelectionCondition.Exclude),
					true
				);
			}
			return;
		}

		if (multySelection) {
			ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, selectedSegment);
			ElementHighlighter.removeShadowClone(
				block,
				options.data.keyField.name,
				selectedSegment,
				options.charts[0].sizes
			);
			ElementHighlighter.renderArcCloneAndHighlight(block, selectedSegment, options.charts[0].sizes);

			ElementHighlighter.toggleActivityStyle(selectedSegment, true);
			ElementHighlighter.toggleActivityStyle(
				DomSelectionHelper.getChartElementsByKeys(
					Donut.getAllArcGroups(block),
					true,
					options.data.keyField.name,
					selectedKeys,
					SelectionCondition.Exclude
				),
				false
			);
		} else {
			ElementHighlighter.removeDonutHighlightingByKeys(
				arcItems,
				options.data.keyField.name,
				selectedKeys,
				options.charts[0].sizes
			);
			ElementHighlighter.removeDonutArcClones(block);
			ElementHighlighter.toggleActivityStyle(Donut.getAllArcGroups(block), false);

			ElementHighlighter.toggleActivityStyle(selectedSegment, true);
			ElementHighlighter.renderArcCloneAndHighlight(block, selectedSegment, options.charts[0].sizes);
		}

		ElementHighlighter.toggleActivityStyle(
			Legend.getItemsByKeys(block, selectedKeys, SelectionCondition.Exclude),
			false
		);
		ElementHighlighter.toggleActivityStyle(Legend.getItemsByKeys(block, selectedKeys), true);
	}

	public static clear2D(block: Block, options: TwoDimensionalOptionsModel): void {
		options.charts.forEach((chart) => {
			const elements = DomSelectionHelper.get2DChartElements(block, chart);
			ElementHighlighter.toggle2DElements(elements, false, chart, block.transitionManager.durations.markerHover);
			ElementHighlighter.toggleActivityStyle(elements, true);
			if (chart.type !== "bar") MarkDot.handleMarkDotVisibility(elements, chart.markersOptions, false);
		});
	}

	public static clearPolar(
		block: Block,
		options: PolarOptionsModel,
		arcItems: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown>
	): void {
		ElementHighlighter.toggleDonutHighlightState(
			arcItems,
			options.charts[0].sizes,
			block.transitionManager.durations.higlightedScale,
			false
		);
		arcItems.each(function () {
			ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, select(this));
			ElementHighlighter.removeShadowClone(
				block,
				options.data.keyField.name,
				select(this),
				options.charts[0].sizes
			);
		});
		ElementHighlighter.toggleActivityStyle(Donut.getAllArcGroups(block), true);
		ElementHighlighter.toggleActivityStyle(Legend.getItemsByKeys(block, [], SelectionCondition.Exclude), true);
	}
}
