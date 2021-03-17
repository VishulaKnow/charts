import { AxisScale } from "d3-axis";
import { pointer, select } from "d3-selection";
import { BlockMargin, Size, TwoDimensionalOptionsModel, PolarOptionsModel, DonutChartSettings } from "../model/model";
import { Block } from "./block/block";
import { ElementHighlighter } from "./elementHighlighter/elementHighlighter";
import { TipBox } from "./features/tipBox/tipBox";
import { TipBoxHelper } from "./features/tipBox/tipBoxHelper";
import { NamesManager } from "./namesManager";
import { Donut } from "./polarNotation/donut/donut";
import { DonutHelper } from "./polarNotation/donut/DonutHelper";

export class OuterEventManager {
    private block: Block;
    private selectedKeys: string[];

    constructor(block: Block) {
        this.block = block;
        this.selectedKeys = [];
    }

    public getSelectedKeys(): string[] {
        return this.selectedKeys;
    }

    public registerEventFor2D(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, options: TwoDimensionalOptionsModel): void {
        const tipBoxAttributes = TipBox.getTipBoxAttributes(margin, blockSize);
        const tipBox = TipBox.renderTipBox(this.block, tipBoxAttributes);

        //TODO: выделить в отдельную прослойку
        const filterId = NamesManager.getId('shadow', this.block.id);
        ElementHighlighter.renderShadowFilter(this.block, filterId);

        const thisClass = this;

        tipBox.on('click', function (event: MouseEvent) {
            const index = TipBoxHelper.getKeyIndex(pointer(event, this), options.orient, margin, blockSize, scaleKey, options.scale.scaleKey.type);
            let keyValue = scaleKey.domain()[index];
            if (index >= scaleKey.domain().length)
                keyValue = scaleKey.domain()[scaleKey.domain().length - 1];

            if (event.ctrlKey) {
                if (thisClass.selectedKeys.findIndex(key => key === keyValue) === -1) {
                    thisClass.addKey(keyValue);
                    ElementHighlighter.highlightElementsOf2D(thisClass.block, options.data.keyField.name, keyValue, options.charts, filterId, 0);
                } else {
                    thisClass.removeKey(keyValue);
                    ElementHighlighter.remove2DHighlightingByKey(thisClass.block, options.data.keyField.name, keyValue, options.charts, 0);
                }
            } else {
                if (thisClass.selectedKeys[0] === keyValue && thisClass.selectedKeys.length === 1) {
                    thisClass.removeKey(keyValue);
                    ElementHighlighter.remove2DHighlightingByKey(thisClass.block, options.data.keyField.name, keyValue, options.charts, 0);
                } else {
                    thisClass.setKey(keyValue);
                    ElementHighlighter.removeUnselected2DHighlight(thisClass.block, options.data.keyField.name, options.charts, 0);
                }
            }
        });
    }

    public registerEventToDonut(margin: BlockMargin, blockSize: Size, options: PolarOptionsModel, donutSettings: DonutChartSettings): void {
        const arcItems = Donut.getAllArcGroups(this.block);
        const donutThickness = DonutHelper.getThickness(donutSettings, blockSize, margin);

        const thisClass = this;

        arcItems.on('click', function (event, dataRow) {
            const keyValue = dataRow.data[options.data.keyField.name];

            if (thisClass.selectedKeys.findIndex(key => key === keyValue) === -1) {
                thisClass.addKey(keyValue);
                ElementHighlighter.changeDonutHighlightAppearance(select(this), margin, blockSize, donutThickness, thisClass.block.transitionManager.durations.donutHover, true);
            } else {
                thisClass.removeKey(keyValue);
                ElementHighlighter.changeDonutHighlightAppearance(select(this), margin, blockSize, donutThickness, thisClass.block.transitionManager.durations.donutHover, false);
            }
        });
    }

    public clearKeys(): void {
        this.selectedKeys = [];
    }

    private setKey(keyValue: string): void {
        this.selectedKeys = [keyValue];
    }

    private addKey(keyValue: string): void {
        this.selectedKeys.push(keyValue);
    }

    private removeKey(keyValue: string): void {
        const selectedKeys = this.selectedKeys;
        selectedKeys.splice(selectedKeys.findIndex(key => key === keyValue), 1);
    }
}