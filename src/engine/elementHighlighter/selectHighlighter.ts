import { BaseType, Selection } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import { Size } from "../../config/config";
import { BlockMargin, DataRow, DonutChartSettings, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { DomHelper, SelectionCondition } from "../helpers/domHelper";
import { Donut } from "../polarNotation/donut/donut";
import { DonutHelper } from "../polarNotation/donut/DonutHelper";
import { ElementHighlighter } from "./elementHighlighter";

//TODO: отрефакторить после окночательного решения 
export class SelectHighlighter {
    public static click2DHandler(multySelection: boolean, appendKey: boolean, keyValue: string, block: Block, options: TwoDimensionalOptionsModel): void {
        ElementHighlighter.renderShadowFilter(block);
        if (!appendKey) {
            ElementHighlighter.remove2DHighlightingByKey(block, options.data.keyField.name, keyValue, options.charts, 0);
            return;
        }

        if (multySelection) {
            ElementHighlighter.highlightElementsOf2D(block, options.data.keyField.name, keyValue, options.charts, 0);
        } else {
            ElementHighlighter.removeUnselected2DHighlight(block, options.data.keyField.name, options.charts, 0);
            ElementHighlighter.highlightElementsOf2D(block, options.data.keyField.name, keyValue, options.charts, 0);
        }
    }

    public static clickPolarHandler(multySelection: boolean, appendKey: boolean, selectedSegment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, selectedKeys: string[], margin: BlockMargin, blockSize: Size, block: Block, options: PolarOptionsModel, arcItems: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, donutSettings: DonutChartSettings): void {
        const donutThickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        ElementHighlighter.renderShadowFilter(block);
        if (!appendKey) {
            ElementHighlighter.toggleDonutHighlightState(selectedSegment, margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, false);
            ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, selectedSegment);

            if (Donut.getAllArcGroups(block).filter(`:not(.${ElementHighlighter.inactiveElemClass})`).size() > 1) {
                selectedSegment.classed(ElementHighlighter.inactiveElemClass, true);
            } else {
                Donut.getAllArcGroups(block).classed(ElementHighlighter.inactiveElemClass, false);
            }
            return;
        }

        if (multySelection) {
            ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, selectedSegment);
            ElementHighlighter.renderArcCloneAndHighlight(block, margin, selectedSegment, blockSize, donutThickness);

            selectedSegment.classed(ElementHighlighter.inactiveElemClass, false);
            DomHelper.getChartElementsByKeys(Donut.getAllArcGroups(block), true, options.data.keyField.name, selectedKeys, SelectionCondition.Exclude)
                .classed(ElementHighlighter.inactiveElemClass, true);
        } else {
            selectedSegment.classed(ElementHighlighter.inactiveElemClass, false);

            ElementHighlighter.removeDonutHighlightingByKeys(arcItems, options.data.keyField.name, selectedKeys, margin, blockSize, donutThickness);
            ElementHighlighter.removeDonutArcClones(block);
            ElementHighlighter.renderArcCloneAndHighlight(block, margin, selectedSegment, blockSize, donutThickness);

            Donut.getAllArcGroups(block).classed(ElementHighlighter.inactiveElemClass, true);
            selectedSegment.classed(ElementHighlighter.inactiveElemClass, false);
        }
    }
}