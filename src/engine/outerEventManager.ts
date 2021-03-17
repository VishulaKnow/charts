import { AxisScale } from "d3-axis";
import { pointer } from "d3-selection";
import { ChartOrientation } from "../config/config";
import { BlockMargin, TwoDimensionalChartModel, OptionsModelData, ScaleKeyModel, Size, TwoDimensionalOptionsModel, PolarOptionsModel } from "../model/model";
import { Block } from "./block/block";
import { ElementHighlighter } from "./elementHighlighter";
import { TipBox } from "./features/tipBox/tipBox";
import { TipBoxHelper } from "./features/tipBox/tipBoxHelper";
import { NamesManager } from "./namesManager";

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

    public registerEvents(options: TwoDimensionalOptionsModel | PolarOptionsModel, scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size): void {
        if (options.type === '2d') {
            this.registerEventFor2D(scaleKey, margin, blockSize, options.charts, options.orient, options.data, options.scale.scaleKey)
        }
    }

    private registerEventFor2D(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], chartOrientation: ChartOrientation, dataOptions: OptionsModelData, scaleKeyModel: ScaleKeyModel): void {
        const tipBoxAttributes = TipBox.getTipBoxAttributes(margin, blockSize);
        const tipBox = TipBox.renderTipBox(this.block, tipBoxAttributes);

        //TODO: выделить в отдельную прослойку
        const filterId = NamesManager.getId('shadow', this.block.id);
        ElementHighlighter.renderShadowFilter(this.block, filterId);

        const thisClass = this;

        tipBox.on('click', function (event) {
            const index = TipBoxHelper.getKeyIndex(pointer(event, this), chartOrientation, margin, blockSize, scaleKey, scaleKeyModel.type);
            const keyValue = scaleKey.domain()[index];

            if (thisClass.selectedKeys.findIndex(key => key === keyValue) === -1) {
                thisClass.addKey(keyValue);
                ElementHighlighter.highlightElementsOf2D(thisClass.block, dataOptions.keyField.name, keyValue, charts, filterId, 0);
            } else {
                thisClass.removeKey(keyValue);
                ElementHighlighter.remove2DHighlightingByKey(thisClass.block, dataOptions.keyField.name, keyValue, charts, 0);
            }
        });
    }

    private registerEventForPolar(): void {

    }

    private addKey(keyValue: string): void {
        this.selectedKeys.push(keyValue);
    }

    private removeKey(keyValue: string): void {
        const selectedKeys = this.selectedKeys;
        selectedKeys.splice(selectedKeys.findIndex(key => key === keyValue), 1);
    }
}