import * as d3 from "d3";
import { DataRow, PolarChartAppearanceModel } from "../../model/model";
import { Block } from "../block/block";
import { Translate } from "./donut";

export interface IAggregator {
    name: string;
    value: number;
}

export class Aggregator
{
    public static render(block: Block, data: DataRow[], valueField: string, radius: number, appearanceOptions: PolarChartAppearanceModel, translate: Translate): void {
        const aggregator: IAggregator = {
            name: 'Сумма',
            value: d3.sum(data.map(d => d[valueField]))
        }
        this.renderAggregatorText(block, radius * 0.01 * appearanceOptions.innerRadius, aggregator, translate);
    }

    private static renderAggregatorText(block: Block, innerRadius: number, aggregator: IAggregator, translate: Translate): void {
        if(innerRadius > 100) {
            const text = block.getSvg()
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('class', 'donut-aggregator')
                .attr('transform', `translate(${translate.x}, ${translate.y})`)
                .html(`${aggregator.name}: ${aggregator.value}`);
    
            let size = 10;
            while(text.node().getBBox().width < innerRadius) {
                size++;
                text.style('font-size', size + 'px');
            }
        }
    }
}