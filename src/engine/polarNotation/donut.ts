import { PieArcDatum } from 'd3-shape'
import { Color } from "d3-color";
import { Selection, BaseType } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
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

        const arcGenerator = DonutHelper.getArcGenerator(outerRadius, innerRadius);
        const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);

        const translateAttribute = DonutHelper.getTranslate(margin, blockSize);

        const donutBlock = block.getSvg()
            .append('g')
            .attr('class', this.donutBlockClass)
            .attr('x', translateAttribute.x)
            .attr('y', translateAttribute.y)
            .attr('transform', `translate(${translateAttribute.x}, ${translateAttribute.y})`);

        const items = donutBlock
            .selectAll(`.${this.arcItemClass}`)
            .data(pieGenerator(data))
            .enter()
            .append('g')
            .attr('class', this.arcItemClass);

        const arcs = items
            .append('path')
            .attr('d', arcGenerator)
            .each(function(d) { (this as any)._current = d; });

        Helper.setCssClasses(arcs, chart.cssClasses);
        this.setElementsColor(items, chart.style.elementColors);

        Aggregator.render(block, data, chart.data.valueField, innerRadius, translateAttribute, thickness);
    }

    public static updateValues(block: Block, data: DataRow[], margin: BlockMargin, chart: PolarChartModel, blockSize: Size, donutSettings: DonutChartSettings): void {
        const outerRadius = DonutHelper.getOuterRadius(margin, blockSize);
        const thickness = DonutHelper.getThickness(donutSettings, blockSize, margin);
        const innerRadius = DonutHelper.getInnerRadius(outerRadius, thickness);
        const arcGenerator = DonutHelper.getArcGenerator(outerRadius, innerRadius);
        const pieGenerator = DonutHelper.getPieGenerator(chart.data.valueField.name, donutSettings.padAngle);

        const arcs = this.getAllArcGroups(block);
        let path = arcs.select('path');
        path = path.data(pieGenerator);
        path.transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const inter = interpolate((this as any)._current, d);
                const _this = this;
                return function(t) {
                    (_this as any)._current = inter(t);
                    return arcGenerator((_this as any)._current)
                }
            });
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