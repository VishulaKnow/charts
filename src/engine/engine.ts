import { Block } from './block/block';
import { ValueFormatter } from './valueFormatter';
import { ChartRenderer } from './chartRenderer';
import { DataSource, Model } from '../model/model';
import { Tooltip } from './features/tolltip/tooltip';
import { Donut } from './polarNotation/donut';
import { interrupt } from 'd3-transition';
import { MarkDot } from './features/markDots/markDot';

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

    public updateData(newModel: Model, newData: DataSource, parentElement: HTMLElement): void {
        this.destroy();
        this.render(newModel, newData, parentElement);
        // this.block.getSvg().remove();
        // this.renderCharts(newModel, newData);
    }

    public updateFullBlock(model: Model, data: DataSource): void {
        this.destroy();
        this.render(model, data, this.block.parentElement);
    }

    public destroy(): void {
        this.block.transitionManager.interruptTransitions();
        this.removeEventListeners();
        this.block.getWrapper().remove();
    }

    public updateValues(model: Model, newData: DataSource): void {
        for (let source in newData) {
            this.data[source] = newData[source];
        }
        if (model.options.type === '2d') {
            ChartRenderer.updateByValueAxis(this.block, model, newData);
        } else if (model.options.type === 'polar') {
            ChartRenderer.updatePolarValues(this.block, model, newData);
        }
    }

    private renderCharts(model: Model, data: DataSource): void {
        if (model.options.type === '2d')
            ChartRenderer.render2D(this, model);
        else if (model.options.type === 'polar')
            ChartRenderer.renderPolar(this, model);
        else if (model.options.type === 'interval')
            ChartRenderer.renderInterval(this.block, model, data);
    }

    private removeEventListeners(): void {
        const tipBoxes = this.block.getSvg().selectAll(`.${Tooltip.tipBoxClass}`)
        tipBoxes.on('mousemove', null);
        tipBoxes.on('mouseleave', null);

        const arcItems = Donut.getAllArcGroups(this.block);
        arcItems.on('mouseover', null);
        arcItems.on('mouseleave', null);
        arcItems.select('path').nodes().forEach(node => interrupt(node));
    }
}