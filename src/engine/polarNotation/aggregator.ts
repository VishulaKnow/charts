import * as d3 from "d3";
import { DataRow, PolarChartSettings } from "../../model/model";
import { Block } from "../block/block";
import { Translate } from "./donut";

export interface IAggregator {
    name: string;
    value: number;
}

export class Aggregator
{
    public static render(block: Block, data: DataRow[], valueField: string, radius: number, appearanceOptions: PolarChartSettings, translate: Translate): void {
        const aggregator: IAggregator = {
            name: 'Сумма',
            value: d3.sum(data.map(d => d[valueField]))
        }
        this.renderAggregatorText(block, radius * 0.01 * appearanceOptions.innerRadius, aggregator, translate);
    }

    private static renderAggregatorText(block: Block, innerRadius: number, aggregator: IAggregator, translate: Translate): void {      
        if(innerRadius > 90) {
            const aggregatorObject = this.renderAggregatorObject(block, innerRadius, translate);
            const wrapper = this.renderAggregatorWrapper(aggregatorObject);

            wrapper
                .append('div') 
                .attr('class', 'aggregator-value')
                .style('text-align', 'center')
                .style('font-size', '60px')
                .text(aggregator.value);

            wrapper
                .append('div') 
                .attr('class', 'aggregator-name')
                .style('text-align', 'center')
                .style('font-size', '18px')
                .text(aggregator.name);
    
            // let size = 10;
            // while(text.node().getBoundingClientRect().width < innerRadius) {
            //     size++;
            //     text.style('font-size', size + 'px');
            // }
        }
    }

    private static renderAggregatorObject(block: Block, innerRadius: number, translate: Translate): d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .append('foreignObject')
            .attr('class', 'aggregator-object')
            .attr('transform-origin', 'center')
            .attr('width', innerRadius * 2)
            .attr('height', innerRadius * 2)
            .attr('transform', `translate(${translate.x - innerRadius}, ${translate.y - innerRadius})`)
            .style('pointer-events', `none`);
    }

    private static renderAggregatorWrapper(aggregatorObject: d3.Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return aggregatorObject
            .append('xhtml:div')
            .style('width', '100%')
            .style('height', '100%')
            .style('border-radius', '50%')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('justify-content', 'center')
            .style('align-items', 'center');
    }
}