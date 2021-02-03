import * as d3 from "d3";
import { BlockMargin, DataRow, EmbededLabelTypeModel, Field, Size, TwoDimensionalChartDataModel } from "../../../model/model";
import { Block } from "../../block/block";

type EmbeddedLabelPosition = 'inside' | 'outside'; 

export class EmbeddedLabels
{
    public static render(block: Block, bars: d3.Selection<SVGRectElement, DataRow, SVGGElement, any>, field: Field, type: EmbededLabelTypeModel, blockSize: Size, margin: BlockMargin): void {
        const thisClass = this;
        
        bars.each(function(d, i) {
            thisClass.renderOneLabel(block, d3.select(this), d, field, blockSize, margin);
        });
    }

    public static getLabelField(type: EmbededLabelTypeModel, chartData: TwoDimensionalChartDataModel, index: number): Field {
        if(type === 'key')
            return chartData.keyField;
        else if(type === 'value')
            return chartData.valueField[index];
            
        return null;
    }

    private static renderOneLabel(block: Block, bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, dataRow: DataRow, field: Field, blockSize: Size, margin: BlockMargin): void {
        block.getChartBlock()
            .append('text')
            .attr('x', parseFloat(bar.attr('width')) + margin.left)
            .attr('y', parseFloat(bar.attr('y')))
            .text(dataRow[field.name]);
    }

    // private static getLabelPosition(bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, blockSize: Size, margin: BlockMargin): EmbeddedLabelPosition {
    //     if(parseFloat(bar.attr('width')) > )
    // }
}