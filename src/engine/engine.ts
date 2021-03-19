import { Block } from './block/block';
import { ValueFormatter } from './valueFormatter';
import { ContentManager } from './contentManager';
import { DataSource, Model } from '../model/model';
import { FilterCallback, FilterEventManager } from './filterEventManager';

export default class Engine {
    public block: Block;
    public filterEventManager: FilterEventManager;
    public data: DataSource;
    private chartId: number;

    constructor(id: number, private filterCallback: FilterCallback) {
        this.chartId = id;
    }

    public render(model: Model, data: DataSource, parentElement: HTMLElement): void {
        this.data = data;

        if(model.options?.data?.dataSource)
            this.filterEventManager = new FilterEventManager(this.filterCallback, this.data[model.options.data.dataSource]);
        else 
            this.filterEventManager = new FilterEventManager(this.filterCallback, []);
            
        this.block = new Block(model.blockCanvas.cssClass, parentElement, this.chartId, this.filterEventManager, model.transitions);
        this.filterEventManager.setBlock(this.block);
        this.block.renderWrapper(model.blockCanvas.size);
        

        if (model.options) {
            ValueFormatter.setFormatFunction(model.dataSettings.format.formatters);
            this.renderCharts(model, this.data);
        }
    }

    public updateFullBlock(model: Model, data: DataSource): void {
        this.destroy();
        this.render(model, data, this.block.parentElement);
    }

    public destroy(): void {
        this.block.transitionManager.interruptTransitions();
        this.block.removeEventListeners();
        this.block.getWrapper().remove();
    }

    public updateData(model: Model, newData: DataSource): void {
        if (!newData) {
            this.data = newData
            this.block.clearWrapper();
        } else {
            if (!this.data) {
                this.data = newData;
                this.updateFullBlock(model, this.data);
            } else {
                for (let source in newData) {
                    this.data[source] = newData[source];
                }
                ContentManager.updateData(this.block, model, newData);
            }
        }
    }

    private renderCharts(model: Model, data: DataSource): void {
        ContentManager.render(model, data, this);
    }
}