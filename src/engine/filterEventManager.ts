import { AxisScale } from "d3-axis";
import { pointer } from "d3-selection";
import { Size } from "../config/config";
import { BlockMargin, TwoDimensionalOptionsModel, PolarOptionsModel, DonutChartSettings, DataRow } from "../model/model";
import { Block } from "./block/block";
import { SelectHighlighter } from "./elementHighlighter/selectHighlighter";
import { TipBox } from "./features/tipBox/tipBox";
import { TipBoxHelper } from "./features/tipBox/tipBoxHelper";
import { Helper } from "./helpers/helper";
import { Donut } from "./polarNotation/donut/donut";

export type FilterCallback = (rows: DataRow[]) => void;

export class FilterEventManager {
    private block: Block;
    private selectedIds: number[];

    constructor(private callback: FilterCallback, private fullDataset: DataRow[]) {
        this.selectedIds = [];
    }

    public setBlock(block: Block): void {
        this.block = block;
    }

    public getSelectedKeys(keyFieldName: string): string[] {
        return Helper.getKeysByIds(this.selectedIds, keyFieldName, this.fullDataset);
    }

    public update(newDataset: DataRow[]): void {
        this.selectedIds = [];
        this.fullDataset = newDataset;
    }

    public isSelected(keyValue: string, keyFieldName: string): boolean {
        return Helper.getKeysByIds(this.selectedIds, keyFieldName, this.fullDataset).findIndex(key => key === keyValue) !== -1;
    }

    public registerEventFor2D(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, options: TwoDimensionalOptionsModel): void {
        const tipBox = TipBox.renderOrGet(this.block, margin, blockSize);
        const thisClass = this;

        tipBox.on('click', function (event: MouseEvent) {
            const keyValue = TipBoxHelper.getKeyValueByPointer(pointer(event, this), options.orient, margin, blockSize, scaleKey, options.scale.key.type);
            const appended = thisClass.processKey(event.ctrlKey, keyValue, options.data.keyField.name);
            SelectHighlighter.click2DHandler(event.ctrlKey, appended, keyValue, thisClass.block, options);

            if (thisClass.callback)
                thisClass.callback(Helper.getRowsByIds(thisClass.selectedIds, thisClass.fullDataset));
        });
    }

    public registerEventToDonut(margin: BlockMargin, blockSize: Size, options: PolarOptionsModel, donutSettings: DonutChartSettings): void {
        const arcItems = Donut.getAllArcGroups(this.block);
        const thisClass = this;

        arcItems.on('click', function (event: MouseEvent, dataRow) {
            const keyValue = dataRow.data[options.data.keyField.name];
            const appended = thisClass.processKey(event.ctrlKey, keyValue, options.data.keyField.name);
            SelectHighlighter.clickPolarHandler(event.ctrlKey, appended, this, thisClass.getSelectedKeys(options.data.keyField.name), margin, blockSize, thisClass.block, options, arcItems, donutSettings);

            if (thisClass.callback)
                thisClass.callback(Helper.getRowsByIds(thisClass.selectedIds, thisClass.fullDataset));
        });
    }

    private setId(id: number): void {
        this.selectedIds = [id];
    }

    private addId(id: number): void {
        this.selectedIds.push(id);
    }

    private removeId(id: number): void {
        this.selectedIds.splice(this.selectedIds.findIndex($id => $id === id), 1);
    }

    private processKey(multySelect: boolean, keyValue: string, keyFieldName: string): boolean {
        const selectedId = Helper.getIdFromRowByKey(keyFieldName, keyValue, this.fullDataset);
        if (multySelect) {
            if (this.getSelectedKeys(keyFieldName).findIndex(key => key === keyValue) === -1) {
                this.addId(selectedId);
                return true;
            } else {
                this.removeId(selectedId);
                return false;
            }
        } else {
            if (this.getSelectedKeys(keyFieldName)[0] === keyValue && this.getSelectedKeys(keyFieldName).length === 1) {
                this.removeId(selectedId);
                return false;
            } else {
                this.setId(selectedId);
                return true;
            }
        }
    }
}