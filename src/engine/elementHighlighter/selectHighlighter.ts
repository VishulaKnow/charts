import { BaseType, Selection } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import { DataRow, Size } from "../../config/config";
import { BlockMargin, DonutChartSettings, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { Legend } from "../features/legend/legend";
import { DomHelper, SelectionCondition } from "../helpers/domHelper";
import { Donut } from "../polarNotation/donut/donut";
import { DonutHelper } from "../polarNotation/donut/DonutHelper";
import { ElementHighlighter } from "./elementHighlighter";

export class SelectHighlighter {
    public static click2DHandler(multySelection: boolean, appendKey: boolean, keyValue: string, selectedKeys: string[], block: Block, options: TwoDimensionalOptionsModel): void {
        options.charts.forEach(chart => {
            const selectedElements = DomHelper.getChartElementsByKeys(DomHelper.get2DChartElements(block, chart), chart.isSegmented, options.data.keyField.name, [keyValue]);
            const elements = DomHelper.get2DChartElements(block, chart);
            if (!appendKey) {
                ElementHighlighter.toggle2DElements(selectedElements, false, chart.type, block.transitionManager.durations.markerHover);
                if (chart.type !== 'bar' && !chart.markersOptions.show)
                    ElementHighlighter.toggleMarkDotVisible(selectedElements, false);

                if (selectedKeys.length > 0) {
                    ElementHighlighter.toggleActivityStyle(selectedElements, false);
                } else {
                    ElementHighlighter.toggleActivityStyle(elements, true);
                    if (chart.type !== 'bar' && !chart.markersOptions.show)
                        ElementHighlighter.toggleMarkDotVisible(elements, false);
                }
                return;
            }

            if (multySelection) {
                ElementHighlighter.toggle2DElements(selectedElements, true, chart.type, block.transitionManager.durations.markerHover);
                ElementHighlighter.toggleActivityStyle(selectedElements, true);
                ElementHighlighter.toggleActivityStyle(DomHelper.getChartElementsByKeys(elements, chart.isSegmented, options.data.keyField.name, selectedKeys, SelectionCondition.Exclude), false)
            } else {
                ElementHighlighter.toggle2DElements(DomHelper.getChartElementsByKeys(elements, chart.isSegmented, options.data.keyField.name, selectedKeys, SelectionCondition.Exclude), false, chart.type, block.transitionManager.durations.markerHover);
                ElementHighlighter.toggleActivityStyle(elements, false);
                if (chart.type !== 'bar' && !chart.markersOptions.show)
                    ElementHighlighter.toggleMarkDotVisible(elements, false);

                ElementHighlighter.toggleActivityStyle(selectedElements, true);
                ElementHighlighter.toggle2DElements(selectedElements, true, chart.type, block.transitionManager.durations.markerHover);
            }
            if (chart.type !== 'bar' && !chart.markersOptions.show)
                ElementHighlighter.toggleMarkDotVisible(selectedElements, true);
        });
    }

    public static clickPolarHandler(multySelection: boolean, appendKey: boolean, selectedSegment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, selectedKeys: string[], margin: BlockMargin, blockSize: Size, block: Block, options: PolarOptionsModel, arcItems: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, donutSettings: DonutChartSettings): void {
        const donutThickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        if (!appendKey) {
            ElementHighlighter.toggleDonutHighlightState(selectedSegment, margin, blockSize, donutThickness, block.transitionManager.durations.higlightedScale, false);
            ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, selectedSegment);

            if (selectedKeys.length > 0) {
                ElementHighlighter.toggleActivityStyle(selectedSegment, false);
                ElementHighlighter.toggleActivityStyle(Legend.getItemsByKeys(block, selectedKeys, SelectionCondition.Exclude), false);
            } else {
                ElementHighlighter.toggleActivityStyle(Donut.getAllArcGroups(block), true);
                ElementHighlighter.toggleActivityStyle(Legend.getItemsByKeys(block, [], SelectionCondition.Exclude), true);
            }
            return;
        }

        if (multySelection) {
            ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, selectedSegment);
            ElementHighlighter.renderArcCloneAndHighlight(block, margin, selectedSegment, blockSize, donutThickness);

            ElementHighlighter.toggleActivityStyle(selectedSegment, true);
            ElementHighlighter.toggleActivityStyle(DomHelper.getChartElementsByKeys(Donut.getAllArcGroups(block), true, options.data.keyField.name, selectedKeys, SelectionCondition.Exclude), false);
        } else {
            ElementHighlighter.removeDonutHighlightingByKeys(arcItems, options.data.keyField.name, selectedKeys, margin, blockSize, donutThickness);
            ElementHighlighter.removeDonutArcClones(block);
            ElementHighlighter.toggleActivityStyle(Donut.getAllArcGroups(block), false);

            ElementHighlighter.toggleActivityStyle(selectedSegment, true);
            ElementHighlighter.renderArcCloneAndHighlight(block, margin, selectedSegment, blockSize, donutThickness);
        }

        ElementHighlighter.toggleActivityStyle(Legend.getItemsByKeys(block, selectedKeys, SelectionCondition.Exclude), false);
        ElementHighlighter.toggleActivityStyle(Legend.getItemsByKeys(block, selectedKeys), true);
    }
}