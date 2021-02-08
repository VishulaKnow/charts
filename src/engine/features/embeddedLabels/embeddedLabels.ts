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

    private static renderOneLabel(block: Block, bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, dataRow: DataRow, field: Field, type: EmbeddedLabelTypeModel, blockSize: Size, margin: BlockMargin): void {
        const labelBlock = block.getChartBlock()
            .append('text')
            .attr('class', 'embedded-label')
            .style('pointer-events', 'none')
            .text(ValueFormatter.formatValue(field.format, dataRow[field.name]));

        const barWidth = Helper.getSelectionNumericAttr(bar, 'width');
            
        const position = EmbeddedLabelsHelper.getLabelPosition(barWidth, labelBlock.node().getBBox().width, margin, blockSize);
        const attrs = EmbeddedLabelsHelper.getLabelAttrs(bar, labelBlock, type, position);

        labelBlock
            .attr('x', attrs.x)
            .attr('y', attrs.y)
            .attr('text-anchor', attrs.textAnchor);

        if(position === 'inside')
            labelBlock.style('fill', '#FFFFFF');

        Helper.cropLabels(labelBlock, EmbeddedLabelsHelper.getSpaceSizeForType(position, barWidth, margin, blockSize));
    }
}