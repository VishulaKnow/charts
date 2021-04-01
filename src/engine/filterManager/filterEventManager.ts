import { AxisScale } from "d3-axis";
import { pointer, select } from "d3-selection";
import { Size } from "../../config/config";
import { BlockMargin, TwoDimensionalOptionsModel, PolarOptionsModel, DonutChartSettings, DataRow } from "../../model/model";
import { Block } from "../block/block";
import { SelectHighlighter } from "../elementHighlighter/selectHighlighter";
import { TipBox } from "../features/tipBox/tipBox";
import { TipBoxHelper } from "../features/tipBox/tipBoxHelper";
import { Helper } from "../helpers/helper";
import { Donut } from "../polarNotation/donut/donut";

export type FilterCallback = (rows: DataRow[]) => void;

export interface SelectDetails {
    multySelect: boolean;
}

export class FilterEventManager {
    private filterable: boolean;
    private block: Block;
    private selectedKeys: string[];

    constructor(private callback: FilterCallback, private fullDataset: DataRow[], filtrable: boolean, keyFieldName: string, selectedIds: number[] = []) {
        this.selectedKeys = Helper.getKeysByIds(selectedIds, keyFieldName, fullDataset);
        this.filterable = filtrable;
    }

    public setBlock(block: Block): void {
        this.block = block;
    }

    public getSelectedKeys(): string[] {
        return this.selectedKeys;
    }

    public updateData(newDataset: DataRow[]): void {
        this.fullDataset = newDataset;
    }

    public isSelected(keyValue: string): boolean {
        return this.selectedKeys.findIndex(key => key === keyValue) !== -1;
    }

    private setKey(key: string): void {
        this.selectedKeys = [key];
    }

    private addId(key: string): void {
        this.selectedKeys.push(key);
    }

    private removeId(key: string): void {
        this.selectedKeys.splice(this.selectedKeys.findIndex(k => k === key), 1);
    }

    private processKey(multySelect: boolean, keyValue: string): boolean {
        if (multySelect) {
            if (this.getSelectedKeys().findIndex(key => key === keyValue) === -1) {
                this.addId(keyValue);
                return true;
            } else {
                this.removeId(keyValue);
                return false;
            }
        } else {
            if (this.getSelectedKeys()[0] === keyValue && this.getSelectedKeys().length === 1) {
                this.removeId(keyValue);
                return false;
            } else {
                this.setKey(keyValue);
                return true;
            }
        }
    }

    public setListenerPolar(margin: BlockMargin, blockSize: Size, options: PolarOptionsModel, donutSettings: DonutChartSettings): void {
        if (this.filterable) {
            this.registerEventToDonut(margin, blockSize, options, donutSettings);
            const selectedElems = Donut.getAllArcGroups(this.block).filter(d => this.selectedKeys.findIndex(sid => sid === d.data[options.data.keyField.name]) !== -1);
            this.selectedKeys = [];
            selectedElems.dispatch('click', { bubbles: false, cancelable: true, detail: { multySelect: true } });
        }
    }

    public event2DUpdate(options: TwoDimensionalOptionsModel): void {
        if (this.filterable) {
            const removedKeys: string[] = [];
            this.selectedKeys.forEach(key => {
                if (this.fullDataset.findIndex(row => row[options.data.keyField.name] === key) === -1)
                    removedKeys.push(key);
                else
                    SelectHighlighter.click2DHandler(true, true, key, this.block, options);
            });
            removedKeys.forEach(rKey => this.selectedKeys.splice(this.selectedKeys.findIndex(sKey => sKey === rKey), 1));
        }
    }

    public registerEventFor2D(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, options: TwoDimensionalOptionsModel): void {
        if (this.filterable) {
            const tipBox = TipBox.renderOrGet(this.block, margin, blockSize);
            const thisClass = this;

            tipBox.on('click', function (e: MouseEvent) {
                const multySelect = e.ctrlKey || e.metaKey;
                const keyValue = TipBoxHelper.getKeyValueByPointer(pointer(e, this), options.orient, margin, blockSize, scaleKey, options.scale.key.type, 'click');
                const appended = thisClass.processKey(multySelect, keyValue);
                SelectHighlighter.click2DHandler(multySelect, appended, keyValue, thisClass.block, options);

                if (thisClass.callback) {
                    thisClass.callback(Helper.getRowsByKeys(thisClass.selectedKeys, options.data.keyField.name, thisClass.fullDataset));
                }
            });
        }
    }

    private registerEventToDonut(margin: BlockMargin, blockSize: Size, options: PolarOptionsModel, donutSettings: DonutChartSettings): void {
        const arcItems = Donut.getAllArcGroups(this.block);
        const thisClass = this;

        arcItems.on('click', function (e: CustomEvent<SelectDetails>, dataRow) {
            const multySelect = thisClass.getMultySelectParam(e);
            const keyValue = dataRow.data[options.data.keyField.name];
            const appended = thisClass.processKey(multySelect, keyValue);
            SelectHighlighter.clickPolarHandler(multySelect, appended, select(this), thisClass.getSelectedKeys(), margin, blockSize, thisClass.block, options, arcItems, donutSettings);

            if (thisClass.callback) {
                thisClass.callback(Helper.getRowsByKeys(thisClass.selectedKeys, options.data.keyField.name, thisClass.fullDataset));
            }
        });
    }

    private getMultySelectParam(e: CustomEvent<SelectDetails>): boolean {
        const isMultyButtonToggle = ((e as Event) as MouseEvent).ctrlKey || ((e as Event) as MouseEvent).metaKey;
        return isMultyButtonToggle === undefined
            ? (e.detail.multySelect === undefined ? false : e.detail.multySelect)
            : isMultyButtonToggle;
    }
}