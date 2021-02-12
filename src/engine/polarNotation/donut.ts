import { arc, pie, PieArcDatum, Pie, Arc } from 'd3-shape'
import { Color } from "d3-color";
import { Selection, BaseType } from 'd3-selection'
import { BlockMargin, DataRow, DonutChartSettings, PolarChartModel, Size } from "../../model/model";
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

    public static render(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size, donutSettings: DonutChartSettings): void {
        const outerRadius = this.getOuterRadius(margin, blockSize);
        const thickness = this.getThickness(donutSettings, blockSize, margin);
        const innerRadius = this.getInnerRadius(outerRadius, thickness);

        const arc = this.getArcGenerator(outerRadius, innerRadius);
        const pie = this.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);
    
        const translate = this.getTranslate(margin, blockSize);
    
        const donutBlock = block.getSvg()
            .append('g')
            .attr('class', this.donutBlockClass)
            .attr('x', translate.x)
            .attr('y', translate.y)
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
        this.setElementsColor(items, chart.style.elementColors);
        
        Aggregator.render(block, data, chart.data.valueField.name, innerRadius, translate, thickness);      
    }
    
    public static getAllArcs(block: Block): Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown> {
        return block.getSvg()
            .selectAll(`.${this.arcItemClass}`) as Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>;
    }

    public static getThickness(donutSettings: DonutChartSettings, blockSize: Size, margin: BlockMargin): number {
        if(Math.min(blockSize.width - margin.left - margin.right, blockSize.height - margin.bottom - margin.top) > 400)
            return donutSettings.maxThickness;
        return donutSettings.minThickness;
    }

    public static getArcCentroid(blockSize: Size, margin: BlockMargin, dataItem: PieArcDatum<DataRow>, donutThickness: number): [number, number] {
        const outerRadius = this.getOuterRadius(margin, blockSize);
        const arc = this.getArcGenerator(outerRadius, outerRadius - donutThickness);

        return arc.centroid(dataItem);
    }

    private static getInnerRadius(outerRadius: number, thickness: number): number {
        return outerRadius - thickness;
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
    
    private static getArcGenerator(outerRadius: number, innerRadius: number): Arc<any, PieArcDatum<DataRow>> {
        return arc<PieArcDatum<DataRow>>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
    }
    
    private static getPieGenerator(valueField: string, padAngle: number): Pie<any, DataRow> {
        return pie<DataRow>()
            .padAngle(padAngle)
            .sort(null)
            .value(d => d[valueField]);
    }

    private static setElementsColor(arcItems: Selection<SVGGElement, unknown, BaseType, unknown>, colorPalette: Color[]): void {
        arcItems
            .select('path')
            .style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}