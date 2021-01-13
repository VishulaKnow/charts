import * as d3 from 'd3'

import { SvgBlock } from './svgBlock/svgBlock';
import { DataHelper } from './dataHelper/dataHelper';
import { ChartRenderer } from './chartRenderer';
import { Model } from '../model/model';

function clearBlock(): void {
    SvgBlock.getSvg().remove();
    d3.select('.wrapper').remove()
    d3.select('.tooltip-wrapper').remove();
}

export default {
    render(model: Model, data: any) {
        DataHelper.format = model.dataFormat.formatters;
        DataHelper.prepareData(data, model);
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
