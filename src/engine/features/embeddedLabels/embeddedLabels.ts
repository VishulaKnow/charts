import * as d3 from "d3";
import { BlockMargin, DataRow, EmbeddedLabelTypeModel, Field, Size, TwoDimensionalChartDataModel } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { ValueFormatter } from "../../valueFormatter";
import { EmbeddedLabelPosition, EmbeddedLabelsHelper, LabelAttrs, LABEL_BAR_PADDING, TextAnchor } from "./embeddedLabelsHelper";

export class EmbeddedLabels
{
    public static render(block: Block, bars: d3.Selection<SVGRectElement, DataRow, SVGGElement, any>, field: Field, type: EmbeddedLabelTypeModel, blockSize: Size, margin: BlockMargin): void {
        const thisClass = this;
        
        bars.each(function(d) {
            thisClass.renderOneLabel(block, d3.select(this), d, field, type, blockSize, margin);
        });
    }

    public static getLabelField(type: EmbeddedLabelTypeModel, chartData: TwoDimensionalChartDataModel, index: number): Field {
        if(type === 'key')
            return chartData.keyField;
        else if(type === 'value')
            return chartData.valueFields[index];

        return null;
    }

    private static renderOneLabel(block: Block, bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, dataRow: DataRow, field: Field, type: EmbeddedLabelTypeModel, blockSize: Size, margin: BlockMargin): void {
        const labelBlock = block.getChartBlock()
            .append('text')
            .attr('class', 'embedded-label')
            .style('pointer-events', 'none')
            .text(ValueFormatter.formatValue(field.format, dataRow[field.name]));

        const barWidth = Helper.getSelectionNumericAttr(bar, 'width');
            
        const position = EmbeddedLabelsHelper.getLabelPosition(barWidth, labelBlock.node().getBBox().width, margin, blockSize);
        const attrs = this.getLabelAttrs(bar, labelBlock, type, position);

        labelBlock
            .attr('x', attrs.x)
            .attr('y', attrs.y)
            .attr('text-anchor', attrs.textAnchor);

        if(position === 'inside')
            labelBlock.style('fill', '#FFFFFF');

        Helper.cropLabels(labelBlock, EmbeddedLabelsHelper.getSpaceSizeForType(position, barWidth, margin, blockSize));
    }

    private static getLabelAttrs(bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, labelBlock: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): LabelAttrs {
        if(type === 'key')
            return {
                x: this.getLabelAttrX(bar, type, position),
                y: this.getLabelAttrY(bar, labelBlock),
                textAnchor: this.getTextAnchor(type, position)
            }
        return {
            x: this.getLabelAttrX(bar, type, position),
            y: this.getLabelAttrY(bar, labelBlock),
            textAnchor: this.getTextAnchor(type, position)
        }
    }

    private static getLabelAttrX(bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): number {
        if(position === 'outside')
            return parseFloat(bar.attr('x')) + parseFloat(bar.attr('width')) + LABEL_BAR_PADDING;
        
        if(type === 'key')
            return parseFloat(bar.attr('x')) + LABEL_BAR_PADDING;

        return parseFloat(bar.attr('x')) + parseFloat(bar.attr('width')) - LABEL_BAR_PADDING;
    }

    private static getLabelAttrY(bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, labelBlock: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>): number {      
        const PADDING_OF_TEXT_BLOCK = 2; 
        return parseFloat(bar.attr('y')) + parseFloat(bar.attr('height')) - (parseFloat(bar.attr('height')) - labelBlock.node().getBBox().height) / 2 - PADDING_OF_TEXT_BLOCK;
    }

    private static getTextAnchor(type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): TextAnchor {
        if(position === 'outside')
            return 'start';
        
        if(type === 'key')
            return 'start';
        return 'end';
    }
}