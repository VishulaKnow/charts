import { Block } from './block/block';
import { ValueFormatter } from './valueFormatter';
import { ChartRenderer } from './chartRenderer';
import { DataSource, Model } from '../model/model';
import { Tooltip } from './features/tolltip/tooltip';
import { Donut } from './polarNotation/donut';
import { interrupt } from 'd3-transition';
import { arc } from 'd3-shape';
import { MarkDot } from './features/lineDots/markDot';

export default class Engine {
    private block: Block;

    public render(model: Model, data: DataSource, parentElement: HTMLElement): void {
        this.block = new Block(model.blockCanvas.cssClass, parentElement);

        this.block.renderWrapper(model.blockCanvas.size);

        if (model.options) {
            ValueFormatter.setFormatFunction(model.dataSettings.format.formatters);
            this.renderCharts(model, data);
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

    public updateValueAxis(model: Model, data: any): void {
        ChartRenderer.updateByValueAxis(this.block, model, data);
    }

    public destroy(): void {
        this.interruptAnimations();
        this.removeEventListeners();
        this.block.getWrapper().remove();
    }

    private renderCharts(model: Model, data: DataSource): void {
        if (model.options.type === '2d')
            ChartRenderer.render2D(this.block, model, data);
        else if (model.options.type === 'polar')
            ChartRenderer.renderPolar(this.block, model, data);
        else if (model.options.type === 'interval')
            ChartRenderer.renderInterval(this.block, model, data);
    }

    private interruptAnimations(): void {
        const arcItems = Donut.getAllArcGroups(this.block);
        arcItems.select('path').nodes().forEach(node => interrupt(node));

        const dots = MarkDot.getAllDots(this.block);
        dots.nodes().forEach(node => interrupt(node));

        const lines = this.block.getSvg().selectAll(`.${Tooltip.tooltipLineClass}`);
        lines.nodes().forEach(node => interrupt(node));

        const tooltips = this.block.getWrapper().selectAll(`.${Tooltip.tooltipBlockClass}`);
        tooltips.nodes().forEach(node => interrupt(node));

        this.block.getSvg().selectAll('.bar-clone').remove();
        this.block.getSvg().selectAll('.donut-segmentd-clone').remove();
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
