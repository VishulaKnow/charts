import { BlockMargin, DataRow, DataSource, Field, TwoDimensionalChartModel } from "../../model/model";
import { DataHelper, } from "../dataHelper/dataHelper";

export class TooltipHelper
{
    static getTooltipText(fields: Field[], dataRow: DataRow): string {
        let text = '';    
        fields.forEach(field => {
            text += `<strong class="tooltip-field">${field.name}</strong>: <span class="tooltip-value">${DataHelper.formatValue(field.format, dataRow[field.name])}</span><br>`;
        });
        return text;
    }
    
    static getMultplyTooltipText(charts: TwoDimensionalChartModel[], data: DataSource, key: string): string {
        let text = '';
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.tooltip.data.fields.length !== 0) {
                text += `<div class="tooltip-chart-item"><span class="legend-circle" style="background-color: ${chart.elementColors[0]}"></span><br>`;
                if(chart.tooltip.data.fields.length !== 0)
                    text += this.getTooltipText(chart.tooltip.data.fields, data[chart.data.dataSource].find((d: DataRow) => d[chart.data.keyField.name] === key));
                text += '</div>'
            }
        });
        return text;
    }

    static getKeyIndex(pointer: [number, number], context: SVGRectElement, orient: 'vertical' | 'horizontal', margin: BlockMargin, bandSize: number): number {
        const pointerAxis = orient === 'vertical' ? 0 : 1;
        const marginByOrient = orient === 'vertical' ? margin.left : margin.top;
        
        const point = pointer[pointerAxis] - marginByOrient - 1;
        if(point < 0)
            return 0;
        return Math.floor(point / bandSize);
    }
}