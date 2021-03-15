import { Block } from './block/block';
import { ValueFormatter } from './valueFormatter';
import { ContentManager } from './contentManager';
import { DataSource, Model } from '../model/model';

export default class Engine {
    public block: Block;
    public data: DataSource;
    private chartId: number;

    constructor(id: number) {
        this.chartId = id;
    }

    public render(model: Model, data: DataSource, parentElement: HTMLElement): void {
        this.block = new Block(model.blockCanvas.cssClass, parentElement, this.chartId);
        this.block.renderWrapper(model.blockCanvas.size);
        this.data = data;

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