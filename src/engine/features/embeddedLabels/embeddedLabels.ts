import { select } from 'd3-selection';
import { BlockMargin, DataRow, EmbeddedLabelTypeModel, Field, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { ValueFormatter } from "../../valueFormatter";
import { BarAttrs, EmbeddedLabelPosition, EmbeddedLabelsHelper } from "./embeddedLabelsHelper";

export class EmbeddedLabels
{
    public static render(block: Block, bars: d3.Selection<SVGRectElement, DataRow, SVGGElement, any>, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin): void {
        const thisClass = this;
        
        bars.each(function(d) {
            thisClass.renderOneLabel(block, select(this), d, field, type, keyAxisOrient, blockSize, margin);
        });
    }

    private static renderOneLabel(block: Block, bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, dataRow: DataRow, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin): void {
        const labelBlock = block.getChartBlock()
            .append('text')
            .attr('class', 'embedded-label')
            .style('pointer-events', 'none')
            .text(ValueFormatter.formatValue(field.format, dataRow[field.name]));

        const barAttrs: BarAttrs = {
            x: Helper.getSelectionNumericAttr(bar, 'x'),
            y: Helper.getSelectionNumericAttr(bar, 'y'),
            width: Helper.getSelectionNumericAttr(bar, 'width'),
            height: Helper.getSelectionNumericAttr(bar, 'height')
        }

        const labelUnserveFlag = EmbeddedLabelsHelper.getLabelUnserveFlag(barAttrs.height); // if bar is too small to serve label inside. This flag is needed for set outside postion and change text anchor if bar wide as whole chart block
            
        const position = EmbeddedLabelsHelper.getLabelPosition(barAttrs, labelBlock.node().getBBox().width, margin, blockSize, labelUnserveFlag);

        const attrs = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, type, position, keyAxisOrient);

        labelBlock
            .attr('x', attrs.x)
            .attr('y', attrs.y)
            .attr('text-anchor', attrs.textAnchor)
            .attr('dominant-baseline', 'middle');

        if(position === 'inside')
            labelBlock.style('fill', '#FFFFFF');

        this.checkLabelsToResetTextAnchor(labelBlock, labelUnserveFlag, margin, blockSize);
        this.cropText(labelBlock, barAttrs, position, labelUnserveFlag, margin, blockSize);
    }

    private static checkLabelsToResetTextAnchor(labelBlock: d3.Selection<SVGTextElement, unknown, HTMLElement, unknown>, labelUnserveFlag: boolean, margin: BlockMargin, blockSize: Size): void {
        if(Helper.getSelectionNumericAttr(labelBlock, 'x') + labelBlock.node().getBBox().width > blockSize.width - margin.right && labelUnserveFlag) {
            labelBlock.attr('x', blockSize.width - margin.right);
            labelBlock.attr('text-anchor', 'end');
        }
    }

    private static cropText(labelBlock: d3.Selection<SVGTextElement, unknown, HTMLElement, unknown>, barAttrs: BarAttrs, position: EmbeddedLabelPosition, labelUnserveFlag: boolean, margin: BlockMargin, blockSize: Size): void {
        let labelTextSpace: number;

        if(labelUnserveFlag)
            labelTextSpace = blockSize.width - margin.left - margin.right;
        else
            labelTextSpace = EmbeddedLabelsHelper.getSpaceSizeForType(position, barAttrs.width, margin, blockSize);

        Helper.cropLabels(labelBlock, labelTextSpace);  
    }
}