import { Color } from "d3";
import { BlockMargin, DataRow, Orient, Size } from "../../model/model";
import { Block } from "../block/svgBlock";
import { Helper } from "../helper";
import { Scale, Scales } from "../twoDimensionalNotation/scale/scale";

interface GanttItemsAttrs {
    x: (data: DataRow) => number;
    y: (data: DataRow) => number;
    width: (data: DataRow) => number;
    height: (data: DataRow) => number;
}

export class Gantt 
{
    public static render(data: DataRow[], scales: Scales, margin: BlockMargin, keyField: string, valueField1: string, valueField2: string, keyAxisOrient: Orient, cssClasses: string[], chartPalette: Color[], blockSize: Size): void {
        const ganttItems = Block
            .getChartBlock()
            .selectAll(`.gantt${Helper.getCssClassesLine(cssClasses)}`)
            .data(data)
            .enter()
                .append('rect')
                .style('clip-path', `url(${Block.getClipPathId()})`);
        
        const itemsAttrs = this.getItemsAttrsByKeyOrient(keyAxisOrient,
                scales,
                margin,
                keyField,
                valueField1,
                valueField2, 
                blockSize);

        this.fillItemsAttrs(ganttItems, itemsAttrs);

        Helper.setCssClasses(ganttItems, cssClasses);
        Helper.setChartElementColor(ganttItems, chartPalette, 'fill');
    }

    private static fillItemsAttrs(ganttItems: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, attrs: GanttItemsAttrs): void {
        ganttItems
            .attr('x', d => attrs.x(d))
            .attr('y', d => attrs.y(d))
            .attr('width', d => attrs.width(d))
            .attr('height', d => attrs.height(d))
    }

    private static getItemsAttrsByKeyOrient(axisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField1: string, valueField2: string, blockSize: Size): GanttItemsAttrs {
        const attrs: GanttItemsAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }
        if(axisOrient === 'top' || axisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(d[keyField]) + margin.left;
            attrs.width = d => Scale.getScaleWidth(scales.scaleKey);
        }
        if(axisOrient === 'left' || axisOrient === 'right') {
            attrs.y = d => scales.scaleKey(d[keyField]) + margin.top;
            attrs.height = d => Scale.getScaleWidth(scales.scaleKey);;
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
}