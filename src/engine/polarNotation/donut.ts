import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, DataRow, PolarChartAppearanceModel, PolarChartModel, Size } from "../../model/model";
import { Helper } from "../helper";
import { Block } from "../block/block";

interface Aggregator {
    name: string;
    value: number;
}
interface Translate {
    x: number;
    y: number;
}

export class Donut
{
    public static donutBlockClass = 'donut-block';
    private static arcItemClass = 'arc';

    public static render(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size): void {
        const radius = this.getOuterRadius(margin, blockSize);
        const arc = this.getArc(radius, radius * 0.01 * chart.appearanceOptions.innerRadius);
        const pie = this.getPie(chart.data.valueField.name, chart.appearanceOptions.padAngle);
    
        const translate = this.getTranslate(margin, blockSize);
    
        const donutBlock = block.getSvg()
            .append('g')
            .attr('class', this.donutBlockClass)
            .attr('transform', `translate(${translate.x}, ${translate.y})`);
        
        const items = donutBlock
            .selectAll(`.${this.arcItemClass}`)
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', this.arcItemClass);
    
        const arcs = items
            .append('path')
            .attr('d', arc);
    
        Helper.setCssClasses(arcs, chart.cssClasses);
        this.setElementsColor(items, chart.elementColors);
        this.renderAggregator(block, data, chart.data.valueField.name, radius, chart.appearanceOptions, translate);      
    }

    private static renderAggregator(block: Block, data: DataRow[], valueField: string, radius: number, appearanceOptions: PolarChartAppearanceModel, translate: Translate): void {
        const aggregator: Aggregator = {
            name: 'Сумма',
            value: d3.sum(data.map(d => d[valueField]))
        }
        this.renderDonutCenterText(block, radius * 0.01 * appearanceOptions.innerRadius, aggregator, translate);
    }

    private static getTranslate(margin: BlockMargin, blockSize: Size): Translate {
        return {
            x: (blockSize.width - margin.left - margin.right) / 2 + margin.left,
            y: (blockSize.height - margin.top - margin.bottom) / 2 + margin.top
        }
    }

    private static getOuterRadius(margin: BlockMargin, blockSize: Size): number {
        return Math.min(blockSize.width - margin.left - margin.right,
            blockSize.height - margin.top - margin.bottom) / 2;
    }
    
    private static getArc(outerRadius: number, innerRadius: number = 0): d3.Arc<any, d3.PieArcDatum<DataRow>> {
        return d3.arc<d3.PieArcDatum<DataRow>>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
    }
    
    private static getPie(valueField: string, padAngle: number = 0): d3.Pie<any, DataRow> {
        return d3.pie<DataRow>()
            .padAngle(padAngle)
            .sort(null)
            .value(d => d[valueField]);
    }
    
    private static renderDonutCenterText(block: Block, innerRadius: number, aggregator: Aggregator, translate: Translate): void {
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

    private static setElementsColor(arcItems: d3.Selection<SVGGElement, d3.PieArcDatum<DataRow>, d3.BaseType, unknown>, colorPalette: Color[]): void {
        arcItems
            .select('path')
            .style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}