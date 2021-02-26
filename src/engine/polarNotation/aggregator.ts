import { sum } from 'd3-array'
import { Selection, BaseType } from 'd3-selection'
import { DataType } from '../../designer/designerConfig';
import { DataRow, Field } from "../../model/model";
import { Block } from "../block/block";
import { ValueFormatter } from '../valueFormatter';
import { Translate } from "./donut";

export interface IAggregator {
    name: string;
    value: number;
    format: DataType;
}

export class Aggregator {
    public static render(block: Block, data: DataRow[], valueField: Field, innerRadius: number, translate: Translate, fontSize: number): void {
        const aggregator: IAggregator = {
            name: 'Сумма',
            value: sum(data.map(d => d[valueField.name])),
            format: valueField.format
        }
        this.renderAggregatorText(block, innerRadius, aggregator, translate, fontSize);
    }

    private static renderAggregatorText(block: Block, innerRadius: number, aggregator: IAggregator, translate: Translate, fontSize: number): void {
        if (innerRadius > 50) {
            const aggregatorObject = this.renderAggregatorObject(block, innerRadius, translate);
            const wrapper = this.renderAggregatorWrapper(aggregatorObject);

            wrapper
                .append<HTMLDivElement>('div')
                .attr('class', 'aggregator-value')
                .style('text-align', 'center')
                .style('font-size', `${fontSize}px`)
                .text(ValueFormatter.formatValue(aggregator.format, aggregator.value));

            wrapper
                .append('div')
                .attr('class', 'aggregator-name')
                .style('text-align', 'center')
                .style('font-size', '18px')
                .text(aggregator.name);

            if(wrapper.node().getBoundingClientRect().width > innerRadius * 2 - 20) {
                wrapper.select('aggregator-value')
                    .style('font-size', `${fontSize - 10}px`)
            }
        }
    }

    private static renderAggregatorObject(block: Block, innerRadius: number, translate: Translate): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .append('foreignObject')
            .attr('class', 'aggregator-object')
            .attr('transform-origin', 'center')
            .attr('width', innerRadius * 2)
            .attr('height', innerRadius * 2)
            .attr('transform', `translate(${translate.x - innerRadius}, ${translate.y - innerRadius})`)
            .style('pointer-events', `none`);
    }

    private static renderAggregatorWrapper(aggregatorObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): Selection<HTMLDivElement, unknown, HTMLElement, any> {
        return aggregatorObject
            .append<HTMLDivElement>('xhtml:div')
            .style('width', '100%')
            .style('height', '100%')
            .style('border-radius', '50%')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('justify-content', 'center')
            .style('align-items', 'center');
    }
}