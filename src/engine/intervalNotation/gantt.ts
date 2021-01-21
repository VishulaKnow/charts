import * as d3 from "d3";
import { Color } from "d3";
import { BarChartSettings, BlockMargin, DataRow, IntervalChartModel, Orient, Size } from "../../model/model";
import { Block } from "../block/block";
import { Helper } from "../helper";
import { Scale, Scales } from "../features/scale/scale";

interface GanttItemsAttrs {
    x: (data: DataRow) => number;
    y: (data: DataRow) => number;
    width: (data: DataRow) => number;
    height: (data: DataRow) => number;
}

export class Gantt 
{
    private static ganttItemClass = 'gantt-item';

    public static render(block: Block, data: DataRow[], scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, chart: IntervalChartModel, barSettings: BarChartSettings): void {
        const ganttItems = block.getChartBlock()
            .selectAll(`.${this.ganttItemClass}`)
            .data(data)
            .enter()
                .append('rect')
                .attr('class', this.ganttItemClass)
                .style('clip-path', `url(${block.getClipPathId()})`);
        
        const itemsAttrs = this.getItemsAttrsByKeyOrient(keyAxisOrient,
                scales,
                margin,
                chart.data.keyField.name,
                chart.data.valueField1.name,
                chart.data.valueField2.name,
                barSettings);

        this.fillItemsAttrs(ganttItems, itemsAttrs);

        Helper.setCssClasses(ganttItems, chart.cssClasses);
        Helper.setChartElementColor(ganttItems, chart.elementColors, 'fill');

        this.renderArrows(ganttItems, chart.data.keyField.name, 'task1');
    }

    private static fillItemsAttrs(ganttItems: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, attrs: GanttItemsAttrs): void {
        ganttItems
            .attr('x', d => attrs.x(d))
            .attr('y', d => attrs.y(d))
            .attr('width', d => attrs.width(d))
            .attr('height', d => attrs.height(d));
    }

    private static getItemsAttrsByKeyOrient(axisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField1: string, valueField2: string, barSettings: BarChartSettings): GanttItemsAttrs {
        const attrs: GanttItemsAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }
        const itemSize = Scale.getScaleWidth(scales.scaleKey) > barSettings.barMaxSize ? barSettings.barMaxSize : Scale.getScaleWidth(scales.scaleKey);
        const sizeDiff = (Scale.getScaleWidth(scales.scaleKey) - itemSize) / 2;       

        if(axisOrient === 'top' || axisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(d[keyField]) + margin.left + sizeDiff;
            attrs.width = d => itemSize;
        }
        if(axisOrient === 'left' || axisOrient === 'right') {
            attrs.y = d => scales.scaleKey(d[keyField]) + margin.top + sizeDiff;
            attrs.height = d => itemSize;
        }
        if(axisOrient === 'top') {
            attrs.y = d => scales.scaleValue(d[valueField1]) + margin.top;
            attrs.height = d => scales.scaleValue(d[valueField2]) - scales.scaleValue(d[valueField1]);
        } 
        else if(axisOrient === 'bottom') {
            attrs.y = d => scales.scaleValue(d[valueField2]) + margin.top;
            attrs.height = d => scales.scaleValue(d[valueField1]) - scales.scaleValue(d[valueField2]);
        }   
        else if(axisOrient === 'left') {
            attrs.x = d => scales.scaleValue(d[valueField1]) + margin.left;
            attrs.width = d => scales.scaleValue(d[valueField2]) - scales.scaleValue(d[valueField1]);
        }    
        else if(axisOrient === 'right') {
            attrs.x = d => scales.scaleValue(d[valueField2]) + margin.left;
            attrs.width = d => scales.scaleValue(d[valueField1]) - scales.scaleValue(d[valueField2]);
        }
        return attrs;
    }

    private static renderArrows(ganttItems: d3.Selection<SVGRectElement, DataRow, SVGGElement, any>, keyField: string, keyValue: string): void {
        const filteredItems = ganttItems
            .filter(d => d[keyField] === keyValue);

        console.log(filteredItems.size());
    }

    private static renderGanttGroups(block: Block, scales: Scales, data: DataRow[], keyField: string, margin: BlockMargin, blockSize: Size): d3.Selection<d3.BaseType, unknown, SVGGElement, unknown> {
        let ganttGroups = block.getChartBlock()
            .selectAll('.gantt-group');

        if(ganttGroups.size() === 0)
            block.getChartBlock()
                .selectAll('.gantt-group')
                .data(data)
                .enter()
                    .append('g')
                    .attr('class', 'gantt-group')
                    .attr('x', d => scales.scaleKey(d[keyField]) + margin.left)
                    .attr('y', margin.top)
                    .attr('width', Scale.getScaleWidth(scales.scaleKey))
                    .attr('height', blockSize.height - margin.top - margin.bottom);

        return ganttGroups;
    }
}