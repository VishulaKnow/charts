import { sum } from 'd3-array'
import { interpolateNumber } from 'd3-interpolate';
import { Selection } from 'd3-selection'
import { MdtChartsDataRow } from '../../../config/config';
import { DataType } from '../../../designer/designerConfig';
import { DonutChartAggreagorModel, Field } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from '../../helpers/helper';
import { ValueFormatter } from '../../valueFormatter';
import { Translate } from "../../polarNotation/donut/donut";

export interface AggregatorInfo {
    name: string;
    value: number;
    format: DataType;
    margin: number;
}

export class Aggregator {
    public static readonly aggregatorValueClass = 'aggregator-value';

    private static readonly aggregatorNameClass = 'aggregator-name';
    private static readonly aggregatorObjectClass = 'aggregator-object';

    public static render(block: Block, data: MdtChartsDataRow[], valueField: Field, innerRadius: number, translate: Translate, fontSize: number, settings: DonutChartAggreagorModel): void {
        const aggregator: AggregatorInfo = {
            name: settings.text,
            value: sum(data.map(d => d[valueField.name])),
            format: valueField.format,
            margin: settings.margin
        }

        this.renderText(block, innerRadius, aggregator, translate, fontSize);
    }

    public static update(block: Block, data: MdtChartsDataRow[], valueField: Field, settings: DonutChartAggreagorModel): void {
        const aggregator: AggregatorInfo = {
            name: 'Сумма',
            value: sum(data.map(d => d[valueField.name])),
            format: valueField.format,
            margin: settings.margin
        }

        this.updateText(block, aggregator);
    }

    private static renderText(block: Block, innerRadius: number, aggregatorInfo: AggregatorInfo, translate: Translate, fontSize: number): void {
        if (innerRadius > 50) {
            const aggregatorObject = this.renderAggregatorObject(block, innerRadius, translate);
            const wrapper = this.renderWrapper(aggregatorObject);

            wrapper
                .append<HTMLDivElement>('div')
                .attr('class', this.aggregatorValueClass)
                .style('text-align', 'center')
                .style('font-size', `${fontSize}px`)
                .text(ValueFormatter.formatField(aggregatorInfo.format, aggregatorInfo.value));

            wrapper
                .append('div')
                .attr('class', this.aggregatorNameClass)
                .attr('title', aggregatorInfo.name)
                .style('text-align', 'center')
                .style('font-size', '18px')
                .text(aggregatorInfo.name);

            this.reCalculateAggregatorFontSize(aggregatorObject.node().getBoundingClientRect().width, block, aggregatorInfo.margin);
        }
    }

    private static updateText(block: Block, newAggregator: AggregatorInfo): void {
        const aggregatorObject = block.getSvg()
            .select<SVGForeignObjectElement>(`.${this.aggregatorObjectClass}`);

        const thisClass = this;
        block.getSvg()
            .select<HTMLDivElement>(`.${this.aggregatorValueClass}`)
            .interrupt()
            .transition()
            .duration(block.transitionManager.durations.chartUpdate)
            .tween("text", function () {
                const oldValue = Helper.parseFormattedToNumber(this.textContent, ',');
                const precision = Helper.calcDigitsAfterDot(newAggregator.value);
                const interpolateFunc = interpolateNumber(oldValue, newAggregator.value);

                return t => {
                    this.textContent = ValueFormatter.formatField(newAggregator.format, (interpolateFunc(t)).toFixed(precision));
                    thisClass.reCalculateAggregatorFontSize(aggregatorObject.node().getBoundingClientRect().width, block, newAggregator.margin);
                }
            });
    }

    private static reCalculateAggregatorFontSize(wrapperSize: number, block: Block, pad: number): void {
        const aggreggatorValue = block.getSvg()
            .select<HTMLDivElement>(`.${this.aggregatorValueClass}`);

        let fontSize = parseInt(aggreggatorValue.style('font-size'));

        while (aggreggatorValue.node().getBoundingClientRect().width > wrapperSize - pad * 2 && fontSize > 15) {
            aggreggatorValue.style('font-size', `${fontSize -= 2}px`);
        }

        while (aggreggatorValue.node().getBoundingClientRect().width < wrapperSize - pad * 2 && fontSize < 60) {
            aggreggatorValue.style('font-size', `${fontSize += 2}px`);
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