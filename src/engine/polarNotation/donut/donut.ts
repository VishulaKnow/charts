import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, DataRow, PolarChartAppearanceModel, Size } from "../../../model/model";
import { Helper } from "../../helper";
import { SvgBlock } from "../../svgBlock/svgBlock";

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
    static getOuterRadiusRadius(margin: BlockMargin, blockSize: Size): number {
        return Math.min(blockSize.width - margin.left - margin.right,
            blockSize.height - margin.top - margin.bottom) / 2;
    }
    
    static getArc(outerRadius: number, innerRadius: number = 0): d3.Arc<any, d3.PieArcDatum<DataRow>> {
        return d3.arc<d3.PieArcDatum<DataRow>>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
    }
    
    static getPie(valueField: string, padAngle: number = 0): d3.Pie<any, DataRow> {
        return d3.pie<DataRow>()
            .padAngle(padAngle)
            .sort(null)
            .value(d => d[valueField]);
    }
    
    static renderDonutText(arcItems: d3.Selection<SVGGElement, d3.PieArcDatum<DataRow>, d3.BaseType, unknown>, arc: d3.Arc<any, d3.PieArcDatum<DataRow>>, field: string): void {
        arcItems
            .append('text')
            .attr('transform', d => `translate(${arc.centroid(d)}) rotate(-90) rotate(${d.endAngle < Math.PI ? 
                (d.startAngle / 2 + d.endAngle / 2) * 180 / Math.PI : 
                (d.startAngle / 2  + d.endAngle / 2 + Math.PI) * 180 / Math.PI})`)
            .attr('font-size', 10)
            .attr('class', 'data-label')
            .text(d => d.data[field])
            .style('text-anchor', 'middle');
    }
    
    static render(data: DataRow[], margin: BlockMargin, valueField: string, appearanceOptions: PolarChartAppearanceModel, cssClasses: string[], chartPalette: Color[], blockSize: Size): void {
        const radius = this.getOuterRadiusRadius(margin, blockSize);
        const arc = this.getArc(radius, radius * 0.01 * appearanceOptions.innerRadius);
        const pie = this.getPie(valueField, appearanceOptions.padAngle);
    
        const translateX = (blockSize.width - margin.left - margin.right) / 2 + margin.left;
        const translateY = (blockSize.height - margin.top - margin.bottom) / 2 + margin.top;
    
        const donutBlock = SvgBlock.getSvg()
            .append('g')
            .attr('class', 'donut-block')
            .attr('transform', `translate(${translateX}, ${translateY})`);
        
        const items = donutBlock
            .selectAll('.arc')
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', 'arc');
    
        const arcs = items
            .append('path')
            .attr('d', arc);
    
        Helper.setCssClasses(arcs, cssClasses);
        this.setElementsColor(items, chartPalette, 'donut');
    
        const aggregator: Aggregator = {
            name: 'Сумма',
            value: d3.sum(data.map(d => d[valueField]))
        }
        const translate: Translate = {
            x: translateX,
            y: translateY
        }
        this.renderDonutCenterText(radius * 0.01 * appearanceOptions.innerRadius, aggregator, translate);
    }
    
    static renderDonutCenterText(innerRadius: number, aggregator: Aggregator, translate: Translate): void {
        if(innerRadius > 100) {
            const text = SvgBlock.getSvg()
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

    static setElementsColor(arcItems: d3.Selection<SVGGElement, d3.PieArcDatum<DataRow>, d3.BaseType, unknown>, colorPalette: Color[], chartType: 'donut'): void {
        if(chartType === 'donut') {
            arcItems
                .select('path')
                .style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
        }
    }
}