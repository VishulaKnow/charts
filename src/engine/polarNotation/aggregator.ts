import { sum } from 'd3-array'
import { interpolate } from 'd3-interpolate';
import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition';
import { DataType } from '../../designer/designerConfig';
import { DataRow, Field } from "../../model/model";
import { Block } from "../block/block";
import { Helper } from '../helper';
import { ValueFormatter } from '../valueFormatter';
import { Translate } from "./donut/donut";

export interface AggregatorInfo {
    name: string;
    value: number;
    format: DataType;
}

export class Aggregator {
    public static aggregatorValueClass = 'aggregator-value';

    private static aggregatorNameClass = 'aggregator-name';
    private static aggregatorObjectClass = 'aggregator-object';

    public static render(block: Block, data: DataRow[], valueField: Field, innerRadius: number, translate: Translate, fontSize: number): void {
        const aggregator: AggregatorInfo = {
            name: 'Сумма',
            value: sum(data.map(d => d[valueField.name])),
            format: valueField.format
        }

        this.renderText(block, innerRadius, aggregator, translate, fontSize);
    }

    public static update(block: Block, data: DataRow[], valueField: Field): void {
        const aggregator: AggregatorInfo = {
            name: 'Сумма',
            value: sum(data.map(d => d[valueField.name])),
            format: valueField.format
        }

        this.updateText(block, aggregator);
    }

    private static renderText(block: Block, innerRadius: number, aggregatorInfo: AggregatorInfo, translate: Translate, fontSize: number): void {
        if (innerRadius > 50) {
            const aggregatorObject = this.renderAggregatorObject(block, innerRadius, translate);
            const wrapper = this.renderWrapper(aggregatorObject);

            const aggreggatorValue = wrapper
                .append<HTMLDivElement>('div')
                .attr('class', this.aggregatorValueClass)
                .style('text-align', 'center')
                .style('font-size', `${fontSize}px`)
                .text(ValueFormatter.formatField(aggregatorInfo.format, aggregatorInfo.value));

            wrapper
                .append('div')
                .attr('class', this.aggregatorNameClass)
                .style('text-align', 'center')
                .style('font-size', '18px')
                .text(aggregatorInfo.name);

            while (aggreggatorValue.node().getBoundingClientRect().width > innerRadius * 2 - 40 && fontSize > 15) {
                aggreggatorValue
                    .style('font-size', `${fontSize -= 2}px`)
            }
        }
    }

    private static updateText(block: Block, aggregator: AggregatorInfo): void {
        const wrapper = block.getSvg()
            .select(`.${this.aggregatorObjectClass}`);

        const wrapperSize = Helper.getSelectionNumericAttr(wrapper, 'width');

        let aggreggatorValue: Selection<HTMLDivElement, unknown, HTMLElement, any> | Transition<HTMLDivElement, unknown, HTMLElement, any> = block.getSvg()
            .select(`.${this.aggregatorObjectClass}`)
            .select<HTMLDivElement>(`.${this.aggregatorValueClass}`)
            .transition()
            .duration(block.transitionManager.updateChartsDuration)
            .tween('text', function () {
                const interpolateFunc = interpolate(this.textContent, aggregator.value.toString());
                return t => this.textContent = ValueFormatter.formatField(aggregator.format, interpolateFunc(t));
            });

        aggreggatorValue = block.getSvg()
            .select<HTMLDivElement>(`.${this.aggregatorValueClass}`);

        let fontSize = parseInt(aggreggatorValue.style('font-size'));

        while (aggreggatorValue.node().getBoundingClientRect().width > wrapperSize - 40 && fontSize > 15) {
            aggreggatorValue
                .style('font-size', `${fontSize -= 2}px`)
        }

        while (aggreggatorValue.node().getBoundingClientRect().width < wrapperSize - 50 && fontSize < 60) {
            aggreggatorValue
                .style('font-size', `${fontSize += 2}px`)
        }
    }

    private static renderAggregatorObject(block: Block, innerRadius: number, translate: Translate): Selection<SVGForeignObjectElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .append('foreignObject')
            .attr('class', this.aggregatorObjectClass)
            .attr('transform-origin', 'center')
            .attr('width', innerRadius * 2)
            .attr('height', innerRadius * 2)
            .attr('transform', `translate(${translate.x - innerRadius}, ${translate.y - innerRadius})`)
            .style('pointer-events', `none`);
    }

    private static renderWrapper(aggregatorObject: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>): Selection<HTMLDivElement, unknown, HTMLElement, any> {
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