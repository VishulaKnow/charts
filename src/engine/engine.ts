import * as d3 from 'd3'

import { Block } from './block/block';
import { ValueFormatter } from './valueFormatter';
import { ChartRenderer } from './chartRenderer';
import { Model } from '../model/model';

export default class Engine {
    private block: Block;

    public render(model: Model, data: any, parentSelector: string): void {       
        ValueFormatter.format = model.dataFormat.formatters;
        this.block = new Block(model.blockCanvas.cssClass, parentSelector);
        this.block.renderWrapper(model.blockCanvas.size);
        if(model.options.type === '2d')
            ChartRenderer.render2D(this.block, model, data);
        else if(model.options.type === 'polar')
            ChartRenderer.renderPolar(this.block, model, data);
        else if(model.options.type === 'interval')
            ChartRenderer.renderInterval(this.block, model, data);
    }

    public updateFullBlock(model: Model, data: any): void {
        this.clearBlock();
        this.render(model, data, this.block.parentElementSelector);
    }

    public updateValueAxis(model: Model, data: any): void {
        ChartRenderer.updateByValueAxis(this.block, model, data);
    }

    private clearBlock(): void {
        this.block.getWrapper().remove();
    }
}
