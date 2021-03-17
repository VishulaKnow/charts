import { select, Selection } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import { BlockMargin, DataRow, DonutChartSettings, PolarOptionsModel, Size, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { OuterEventManager } from "../outerEventManager";
import { DonutHelper } from "../polarNotation/donut/DonutHelper";
import { ElementHighlighter } from "./elementHighlighter";

export class SelectHighlighter {
    public static click2DHandler(event: MouseEvent, eventManger: OuterEventManager, keyValue: string, block: Block, options: TwoDimensionalOptionsModel): void {
        if (event.ctrlKey) {
            if (eventManger.getSelectedKeys().findIndex(key => key === keyValue) === -1) {
                eventManger.addKey(keyValue);
                ElementHighlighter.highlightElementsOf2D(block, options.data.keyField.name, keyValue, options.charts, 0);
            } else {
                eventManger.removeKey(keyValue);
                ElementHighlighter.remove2DHighlightingByKey(block, options.data.keyField.name, keyValue, options.charts, 0);
            }
        } else {
            if (eventManger.getSelectedKeys()[0] === keyValue && eventManger.getSelectedKeys().length === 1) {
                eventManger.removeKey(keyValue);
                ElementHighlighter.remove2DHighlightingByKey(block, options.data.keyField.name, keyValue, options.charts, 0);
            } else {
                eventManger.setKey(keyValue);
                ElementHighlighter.removeUnselected2DHighlight(block, options.data.keyField.name, options.charts, 0);
            }
        }
    }

    public static clickPolarHandler(event: MouseEvent, eventManager: OuterEventManager, segment: SVGGElement, keyValue: string, margin: BlockMargin, blockSize: Size, block: Block, options: PolarOptionsModel, arcItems: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, donutSettings: DonutChartSettings): void {
        const donutThickness = DonutHelper.getThickness(donutSettings, blockSize, margin);

        if (event.ctrlKey) {
            if (eventManager.getSelectedKeys().findIndex(key => key === keyValue) === -1) {
                eventManager.addKey(keyValue);
                ElementHighlighter.changeDonutHighlightAppearance(select(segment), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, true);
            } else {
                eventManager.removeKey(keyValue);
                ElementHighlighter.changeDonutHighlightAppearance(select(segment), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, false);
            }
        } else {
            if (eventManager.getSelectedKeys()[0] === keyValue && eventManager.getSelectedKeys().length === 1) {
                eventManager.removeKey(keyValue);
                ElementHighlighter.changeDonutHighlightAppearance(select(segment), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, false);
            } else {
                eventManager.setKey(keyValue);
                ElementHighlighter.removeDonutHighlightingByKeys(arcItems, options.data.keyField.name, eventManager.getSelectedKeys(), margin, blockSize, donutThickness);
            }
        }
    }
}