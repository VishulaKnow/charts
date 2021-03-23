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

export interface SelectDetails {
    multySelect: boolean;
}

//TODO: вынести в отдельную папку / продумать разделение ID-менеджера и менеджера событий
export class FilterEventManager {
    private block: Block;
    private selectedIds: number[];

    constructor(private callback: FilterCallback, private fullDataset: DataRow[], selected: number[] = []) {
        this.selectedIds = selected;
    }

    public setBlock(block: Block): void {
        this.block = block;
    }

    public getSelectedKeys(keyFieldName: string): string[] {
        return Helper.getKeysByIds(this.selectedIds, keyFieldName, this.fullDataset);
    }

    public update(newDataset: DataRow[]): void {
        this.fullDataset = newDataset;
    }

    public isSelected(keyValue: string, keyFieldName: string): boolean {
        return Helper.getKeysByIds(this.selectedIds, keyFieldName, this.fullDataset).findIndex(key => key === keyValue) !== -1;
    }

    public eventPolarUpdate(margin: BlockMargin, blockSize: Size, options: PolarOptionsModel, donutSettings: DonutChartSettings): void {
        //TODO: разрешить
        this.registerEventToDonut(margin, blockSize, options, donutSettings);
        const selectedElems = Donut.getAllArcGroups(this.block).filter(d => this.selectedIds.findIndex(sid => sid === d.data.$id) !== -1);
        this.selectedIds = [];
        selectedElems.dispatch('click', { bubbles: false, cancelable: true, detail: { multySelect: true } });
    }

    public event2DUpdate(options: TwoDimensionalOptionsModel): void {
        const removedIds: number[] = [];
        this.selectedIds.forEach(id => {
            const key = Helper.getKeyById(id, options.data.keyField.name, this.fullDataset);
            if (!key)
                removedIds.push(id);
            else
                SelectHighlighter.click2DHandler(true, true, key, this.block, options);
        });
        removedIds.forEach(rid => this.selectedIds.splice(this.selectedIds.findIndex(sid => sid === rid), 1));
    }

    public registerEventFor2D(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, options: TwoDimensionalOptionsModel): void {
        const tipBox = TipBox.renderOrGet(this.block, margin, blockSize);
        const thisClass = this;

        tipBox.on('click', function (e: MouseEvent) {
            const keyValue = TipBoxHelper.getKeyValueByPointer(pointer(e, this), options.orient, margin, blockSize, scaleKey, options.scale.key.type);
            const appended = thisClass.processKey(e.ctrlKey, keyValue, options.data.keyField.name);
            SelectHighlighter.click2DHandler(e.ctrlKey, appended, keyValue, thisClass.block, options);

            if (thisClass.callback) {
                thisClass.callback(Helper.getRowsByIds(thisClass.selectedIds, thisClass.fullDataset));
            }
        });
    }

    public registerEventToDonut(margin: BlockMargin, blockSize: Size, options: PolarOptionsModel, donutSettings: DonutChartSettings): void {
        const arcItems = Donut.getAllArcGroups(this.block);
        const thisClass = this;

        arcItems.on('click', function (e: CustomEvent<SelectDetails>, dataRow) {
            const multySelect = thisClass.getMultySelectParam(e);
            const keyValue = dataRow.data[options.data.keyField.name];
            const appended = thisClass.processKey(multySelect, keyValue, options.data.keyField.name);
            SelectHighlighter.clickPolarHandler(multySelect, appended, this, thisClass.getSelectedKeys(options.data.keyField.name), margin, blockSize, thisClass.block, options, arcItems, donutSettings);

            if (thisClass.callback) {
                thisClass.callback(Helper.getRowsByIds(thisClass.selectedIds, thisClass.fullDataset));
            }
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

    private getMultySelectParam(e: CustomEvent<SelectDetails>): boolean {
        return ((e as Event) as MouseEvent).ctrlKey === undefined
            ? (e.detail.multySelect === undefined ? false : e.detail.multySelect)
            : ((e as Event) as MouseEvent).ctrlKey;
    }
}