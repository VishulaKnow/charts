import { BaseType, Selection } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import { Size } from "../../config/config";
import { BlockMargin, DataRow, DonutChartSettings, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { DonutHelper } from "../polarNotation/donut/DonutHelper";
import { ElementHighlighter } from "./elementHighlighter";

export class SelectHighlighter {
    public static click2DHandler(multySelection: boolean, appendKey: boolean, keyValue: string, block: Block, options: TwoDimensionalOptionsModel): void {
        ElementHighlighter.renderShadowFilter(block);
        if (multySelection) {
            if (appendKey) {
                ElementHighlighter.highlightElementsOf2D(block, options.data.keyField.name, keyValue, options.charts, 0);
            } else {
                ElementHighlighter.remove2DHighlightingByKey(block, options.data.keyField.name, keyValue, options.charts, 0);
            }
        } else {
            if (appendKey) {
                ElementHighlighter.removeUnselected2DHighlight(block, options.data.keyField.name, options.charts, 0);
                ElementHighlighter.highlightElementsOf2D(block, options.data.keyField.name, keyValue, options.charts, 0);
            } else {
                ElementHighlighter.remove2DHighlightingByKey(block, options.data.keyField.name, keyValue, options.charts, 0);
            }
        }
    }

    public static clickPolarHandler(multySelection: boolean, appendKey: boolean, selectedSegment: Selection<SVGGElement, PieArcDatum<DataRow>, BaseType, unknown>, selectedKeys: string[], margin: BlockMargin, blockSize: Size, block: Block, options: PolarOptionsModel, arcItems: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, donutSettings: DonutChartSettings): void {
        const donutThickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        if (!appendKey) {
            ElementHighlighter.changeDonutHighlightAppearance(selectedSegment, margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, false);
            ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, selectedSegment);
            return;
        }

        if (multySelection) {
            ElementHighlighter.removeCloneForElem(block, options.data.keyField.name, selectedSegment);
            ElementHighlighter.renderArcCloneAndHighlight(block, margin, selectedSegment, blockSize, donutThickness);
        } else {
            ElementHighlighter.removeDonutHighlightingByKeys(arcItems, options.data.keyField.name, selectedKeys, margin, blockSize, donutThickness);
            ElementHighlighter.removeDonutArcClones(block);
            ElementHighlighter.renderArcCloneAndHighlight(block, margin, selectedSegment, blockSize, donutThickness);
        }
    }
}