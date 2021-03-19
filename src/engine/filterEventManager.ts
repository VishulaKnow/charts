import { AxisScale } from "d3-axis";
import { pointer } from "d3-selection";
import { BlockMargin, Size, TwoDimensionalOptionsModel, PolarOptionsModel, DonutChartSettings, DataRow } from "../model/model";
import { Block } from "./block/block";
import { ElementHighlighter } from "./elementHighlighter/elementHighlighter";
import { SelectHighlighter } from "./elementHighlighter/selectHighlighter";
import { TipBox } from "./features/tipBox/tipBox";
import { TipBoxHelper } from "./features/tipBox/tipBoxHelper";
import { Donut } from "./polarNotation/donut/donut";

export type FilterCallback = (rows: DataRow[]) => void;

export class FilterEventManager {
    private block: Block;
    private selectedKeys: string[];

    constructor(private callback: FilterCallback, private dataSet: DataRow[]) {
        this.selectedKeys = [];
    }

    public setBlock(block: Block): void {
        this.block = block;
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
            const keyValue = TipBoxHelper.getKeyValueByPointer(pointer(event, this), options.orient, margin, blockSize, scaleKey, options.scale.key.type);
            const appended = thisClass.processKey(event.ctrlKey, keyValue);
            SelectHighlighter.click2DHandler(event.ctrlKey, appended, keyValue, thisClass.block, options);
        });
    }

    public registerEventToDonut(margin: BlockMargin, blockSize: Size, options: PolarOptionsModel, donutSettings: DonutChartSettings): void {
        const arcItems = Donut.getAllArcGroups(this.block);
        const thisClass = this;

        arcItems.on('click', function (event: MouseEvent, dataRow) {
            const keyValue = dataRow.data[options.data.keyField.name];
            const appended = thisClass.processKey(event.ctrlKey, keyValue);
            SelectHighlighter.clickPolarHandler(event.ctrlKey, appended, this, thisClass.getSelectedKeys(), margin, blockSize, thisClass.block, options, arcItems, donutSettings);
        });
    }

    private processKey(multySelect: boolean, keyValue: string): boolean {
        if (multySelect) {
            if (this.getSelectedKeys().findIndex(key => key === keyValue) === -1) {
                this.addKey(keyValue);
                return true;
            } else {
                this.removeKey(keyValue);
                return false;
            }
        } else {
            if (this.getSelectedKeys()[0] === keyValue && this.getSelectedKeys().length === 1) {
                this.removeKey(keyValue);
                return false;
            } else {
                this.setKey(keyValue);
                return true;
            }
        }
    }
}