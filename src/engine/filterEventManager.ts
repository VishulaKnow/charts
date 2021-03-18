import { AxisScale } from "d3-axis";
import { pointer } from "d3-selection";
import { BlockMargin, Size, TwoDimensionalOptionsModel, PolarOptionsModel, DonutChartSettings } from "../model/model";
import { Block } from "./block/block";
import { ElementHighlighter } from "./elementHighlighter/elementHighlighter";
import { SelectHighlighter } from "./elementHighlighter/selectHighlighter";
import { TipBox } from "./features/tipBox/tipBox";
import { TipBoxHelper } from "./features/tipBox/tipBoxHelper";
import { Donut } from "./polarNotation/donut/donut";

export class FilterEventManager {
    private block: Block;
    private selectedKeys: string[];

    constructor(block: Block) {
        this.block = block;
        this.selectedKeys = [];
    }

    public getSelectedKeys(): string[] {
        return this.selectedKeys;
    }

    public clearKeys(): void {
        this.selectedKeys = [];
    }

    public isSelected(keyValue: string): boolean {
        return this.selectedKeys.findIndex(key => key === keyValue) !== -1;
    }

    public setKey(keyValue: string): void {
        this.selectedKeys = [keyValue];
    }

    public addKey(keyValue: string): void {
        this.selectedKeys.push(keyValue);
    }

    public removeKey(keyValue: string): void {
        const selectedKeys = this.selectedKeys;
        selectedKeys.splice(selectedKeys.findIndex(key => key === keyValue), 1);
    }

    public registerEventFor2D(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, options: TwoDimensionalOptionsModel): void {
        const tipBox = TipBox.render(this.block, margin, blockSize);

        ElementHighlighter.renderShadowFilter(this.block);

        const thisClass = this;

        tipBox.on('click', function (event: MouseEvent) {
            const index = TipBoxHelper.getKeyIndex(pointer(event, this), options.orient, margin, blockSize, scaleKey, options.scale.scaleKey.type);
            let keyValue = scaleKey.domain()[index];
            if (index >= scaleKey.domain().length)
                keyValue = scaleKey.domain()[scaleKey.domain().length - 1];

            SelectHighlighter.click2DHandler(event, thisClass, keyValue, thisClass.block, options);
        });
    }

    public registerEventToDonut(margin: BlockMargin, blockSize: Size, options: PolarOptionsModel, donutSettings: DonutChartSettings): void {
        const arcItems = Donut.getAllArcGroups(this.block);

        const thisClass = this;

        arcItems.on('click', function (event: MouseEvent, dataRow) {
            const keyValue = dataRow.data[options.data.keyField.name];

            SelectHighlighter.clickPolarHandler(event, thisClass, this, keyValue, margin, blockSize, thisClass.block, options, arcItems, donutSettings);
        });
    }
}