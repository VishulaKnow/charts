import { select, Selection } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import { Size } from "../../config/config";
import { BlockMargin, DataRow, DonutChartSettings, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { Donut } from "../polarNotation/donut/donut";
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
            if (!appendKey) {
                ElementHighlighter.remove2DHighlightingByKey(block, options.data.keyField.name, keyValue, options.charts, 0);
            } else {
                ElementHighlighter.removeUnselected2DHighlight(block, options.data.keyField.name, options.charts, 0);
                ElementHighlighter.highlightElementsOf2D(block, options.data.keyField.name, keyValue, options.charts, 0);
            }
        }
    }

    public static clickPolarHandler(multySelection: boolean, appendKey: boolean, segment: SVGGElement, selectedKeys: string[], margin: BlockMargin, blockSize: Size, block: Block, options: PolarOptionsModel, arcItems: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, donutSettings: DonutChartSettings): void {
        const donutThickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        if (multySelection) {
            if (appendKey) {
                const oldClone = Donut.getAllArcClones(block)
                    .filter((d: PieArcDatum<DataRow>) => d.data[options.data.keyField.name] === select<SVGGElement, PieArcDatum<DataRow>>(segment).datum().data[options.data.keyField.name]);
                oldClone.remove();
                ElementHighlighter.changeDonutHighlightAppearance(select(segment), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, true);
                const clone = ElementHighlighter.makeArcClone(select(segment));
                ElementHighlighter.changeDonutHighlightAppearance(clone, margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, true);
                ElementHighlighter.setFilter(clone, block);
            } else {
                ElementHighlighter.changeDonutHighlightAppearance(select(segment), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, false);
                const clone = Donut.getAllArcClones(block)
                    .filter((d: PieArcDatum<DataRow>) => d.data[options.data.keyField.name] === select<SVGGElement, PieArcDatum<DataRow>>(segment).datum().data[options.data.keyField.name]);
                clone.remove();
            }
        } else {
            if (appendKey) {
                ElementHighlighter.removeDonutHighlightingByKeys(arcItems, options.data.keyField.name, selectedKeys, margin, blockSize, donutThickness);
                ElementHighlighter.removeDonutArcClones(block);
                ElementHighlighter.setFilter(ElementHighlighter.makeArcClone(select(segment)), block);
                ElementHighlighter.changeDonutHighlightAppearance(select(segment), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, true);
            } else {
                ElementHighlighter.changeDonutHighlightAppearance(select(segment), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, false);
                const clone = Donut.getAllArcClones(block)
                    .filter((d: PieArcDatum<DataRow>) => d.data[options.data.keyField.name] === select<SVGGElement, PieArcDatum<DataRow>>(segment).datum().data[options.data.keyField.name]);
                clone.remove();
            }
        }
    }
}