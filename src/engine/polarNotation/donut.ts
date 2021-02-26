import { PieArcDatum } from 'd3-shape'
import { Color } from "d3-color";
import { Selection, BaseType } from 'd3-selection'
import { BlockMargin, DataRow, DonutChartSettings, PolarChartModel, Size } from "../../model/model";
import { Helper } from "../helper";
import { Block } from "../block/block";
import { Aggregator } from "./aggregator";
import { DonutHelper } from './DonutHelper';

export interface Translate {
    x: number;
    y: number;
}

export class Donut {
    public static donutBlockClass = 'donut-block';
    private static arcItemClass = 'arc';

    public static render(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size, donutSettings: DonutChartSettings): void {
        const outerRadius = DonutHelper.getOuterRadius(margin, blockSize);
        const thickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        const innerRadius = DonutHelper.getInnerRadius(outerRadius, thickness);

        const arc = DonutHelper.getArcGenerator(outerRadius, innerRadius);
        const pie = DonutHelper.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);

        const translate = DonutHelper.getTranslate(margin, blockSize);

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

        Aggregator.render(block, data, chart.data.valueField, innerRadius, translate, thickness);
    }

    public static getAllArcGroups(block: Block): Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown> {
        return block.getSvg()
            .selectAll(`.${this.arcItemClass}`) as Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>;
    }

    private static setElementsColor(arcItems: Selection<SVGGElement, unknown, BaseType, unknown>, colorPalette: Color[]): void {
        arcItems
            .select('path')
            .style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}