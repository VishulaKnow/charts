import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, DataRow, PolarChartAppearanceModel, PolarChartModel, Size } from "../../model/model";
import { Helper } from "../helper";
import { Block } from "../block/block";
import { Aggregator } from "./aggregator";

export interface Translate {
    x: number;
    y: number;
}

export class Donut
{
    public static donutBlockClass = 'donut-block';
    private static arcItemClass = 'arc';

    public static render(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size): void {
        const radius = this.getOuterRadius(margin, blockSize);
        const arc = this.getArcGenerator(radius, radius * 0.01 * chart.appearanceOptions.innerRadius);
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
        Aggregator.render(block, data, chart.data.valueField.name, radius, chart.appearanceOptions, translate);      
    }
    
    public static getAllArcs(block: Block): d3.Selection<SVGGElement, d3.PieArcDatum<DataRow>, SVGGElement, unknown> {
        return block.getSvg()
            .selectAll(`.${this.arcItemClass}`) as d3.Selection<SVGGElement, d3.PieArcDatum<DataRow>, SVGGElement, unknown>;
    }

    public static getArcCentroid(blockSize: Size, margin: BlockMargin, dataItem: d3.PieArcDatum<DataRow>, innerRadius: number): [number, number] {
        const outerRadius = this.getOuterRadius(margin, blockSize);
        const arc = this.getArcGenerator(outerRadius, innerRadius * 0.01 * outerRadius);

        return arc.centroid(dataItem);
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
    
    private static getArcGenerator(outerRadius: number, innerRadius: number): d3.Arc<any, d3.PieArcDatum<DataRow>> {
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

    private static setElementsColor(arcItems: d3.Selection<SVGGElement, d3.PieArcDatum<DataRow>, d3.BaseType, unknown>, colorPalette: Color[]): void {
        arcItems
            .select('path')
            .style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}