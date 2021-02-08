import * as d3 from "d3";
import { BlockMargin, DataRow, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Dot } from "../../features/lineDots/dot";

export class Line
{
    private static lineChartClass = 'line';

    public static render(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        chart.data.valueFields.forEach((valueField, index) => {
            const line = this.getLineGenerator(keyAxisOrient, scales, chart.data.keyField.name, valueField.name, margin);
            
            const path = block.getChartBlock()
                .append('path')
                .attr('d', line(data))
                .attr('class', this.lineChartClass)
                .style('clip-path', `url(${block.getClipPathId()})`)
                .style('pointer-events', 'none');
        
            Helper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(path, chart.style, index, 'stroke');
            Dot.render(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, valueField.name, chart.cssClasses, index, chart.style.elementColors, blockSize, false);
        });
    }

    public static updateLineChartByValueAxis(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((valueField, index) => {
            const line = this.getLineGenerator(keyAxisOrient, scales, chart.data.keyField.name, valueField.name, margin);
            
            block.getChartBlock()
                .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`)
                .transition()
                .duration(1000)
                    .attr('d', line(data));
    
            Dot.updateDotsCoordinateByValueAxis(block, data, keyAxisOrient, scales, margin, chart.data.keyField.name, valueField.name, chart.cssClasses, index, false);
        });
    }

    public static moveChartsToFront(block: Block): void {
        block.getChartBlock()
            .selectAll(`.${this.lineChartClass}`)
            .raise();
    }

    private static getLineGenerator(keyAxisOrient: Orient, scales: Scales, keyFieldName: string, valueFieldName: string, margin: BlockMargin): d3.Line<DataRow> {
        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            return d3.line<DataRow>()
                .x(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.left)
                .y(d => scales.scaleValue(d[valueFieldName]) + margin.top);
        }

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            return d3.line<DataRow>()
                .x(d => scales.scaleValue(d[valueFieldName]) + margin.left)
                .y(d => Scale.getScaleKeyPoint(scales.scaleKey, d[keyFieldName]) + margin.top)
        }
    }
}