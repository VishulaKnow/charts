import * as d3 from 'd3'

import { Block } from './block/svgBlock';
import { ValueFormatter } from './valueFormatter';
import { ChartRenderer } from './chartRenderer';
import { Model } from '../model/model';

function clearBlock(): void {
    Block.getSvg().remove();
    d3.select('.wrapper').remove();
}

export default {
    render(model: Model, data: any) {
        ValueFormatter.format = model.dataFormat.formatters;
        if(model.options.type === '2d')
            ChartRenderer.render2D(model, data);
        else
            ChartRenderer.renderPolar(model, data);
    },
    updateFullBlock(model: Model, data: any) {
        clearBlock();
        this.render(model, data);
    },
    updateValueAxis(model: Model, data: any) {
        ChartRenderer.updateByValueAxis(model, data);
    }
}
