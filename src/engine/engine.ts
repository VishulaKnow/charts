import { Block } from './block/block';
import { ValueFormatter } from './valueFormatter';
import { ContentManager } from './contentManager/contentManager';
import { IntervalOptionsModel, Model, OptionsModel, PolarOptionsModel, TwoDimensionalOptionsModel } from '../model/model';
import { FilterCallback, FilterEventManager } from './filterManager/filterEventManager';
import { Helper } from './helpers/helper';
import { MdtChartsDataSource } from '../config/config';

export default class Engine {
    public block: Block;
    public filterEventManager: FilterEventManager;
    public data: MdtChartsDataSource;
    private chartId: number;

    constructor(id: number, private filterCallback: FilterCallback, private initializeSelected: number[]) {
        this.chartId = id;
    }

    public render(model: Model, data: MdtChartsDataSource, parentElement: HTMLElement): void {
        this.data = data;
        this.setFilterEventManager(model?.options);
        this.block = new Block(model.blockCanvas.cssClass, parentElement, this.chartId, this.filterEventManager, model.transitions);
        this.filterEventManager?.setBlock(this.block);
        this.block.renderWrapper(model.blockCanvas.size);

        if (model.options) {
            ValueFormatter.setFormatFunction(model.dataSettings.format.formatters);
            this.renderCharts(model);
        }
    }

    public updateFullBlock(model: Model, data: MdtChartsDataSource): void {
        this.destroy();
        this.render(model, data, this.block.parentElement);
    }

    public destroy(): void {
        this.block.destroy();
    }

    public updateData(model: Model, newData: MdtChartsDataSource): void {
        if (!newData) {
            this.data = newData;
            this.block.clearWrapper();
        } else {
            if (!this.data) {
                this.data = newData;
                this.updateFullBlock(model, this.data);
            } else if (!Helper.compareData(this.data, newData, model.options.data.dataSource)) {
                for (let source in newData) {
                    this.data[source] = newData[source];
                }
                ContentManager.updateData(this.block, model, newData);
            }
        }
    }

    public updateColors(model: Model): void {
        ContentManager.updateColors(this, model);
    }

    private renderCharts(model: Model): void {
        ContentManager.render(model, this);
    }

    private setFilterEventManager(options: OptionsModel): void {
        if (options.type === "card") return;

        let highlightIds: number[] = [];
        if (this.initializeSelected instanceof Array && this.initializeSelected.length > 0)
            highlightIds = [...this.initializeSelected];
        if (options?.data?.dataSource)
            this.filterEventManager = new FilterEventManager(this.filterCallback, this.data[options.data.dataSource], options.selectable, options.data.keyField.name, highlightIds);
        else
            this.filterEventManager = new FilterEventManager(this.filterCallback, [], options?.selectable, options?.data?.keyField?.name, highlightIds);
    }
}