import * as d3 from "d3";
import { color, Color } from "d3";
import { BlockMargin, DataRow, EmbeddedLabelTypeModel, Field, Size, TwoDimensionalChartDataModel } from "../../../model/model";
import { Block } from "../../block/block";
import { ValueFormatter } from "../../valueFormatter";

type EmbeddedLabelPosition = 'inside' | 'outside';
type TextAnchor = 'start' | 'end' | 'center';
interface LabelAttrs {
    x: number;
    y: number;
    textAnchor: TextAnchor;
}

const LABEL_BAR_PADDING = 6;

export class EmbeddedLabels
{
    public static render(block: Block, bars: d3.Selection<SVGRectElement, DataRow, SVGGElement, any>, field: Field, type: EmbeddedLabelTypeModel, blockSize: Size, margin: BlockMargin): void {
        const thisClass = this;
        
        bars.each(function(d, i) {
            thisClass.renderOneLabel(block, d3.select(this), d, field, type, blockSize, margin);
        });
    }

    public static getLabelField(type: EmbeddedLabelTypeModel, chartData: TwoDimensionalChartDataModel, index: number): Field {
        if(type === 'key')
            return chartData.keyField;
        else if(type === 'value')
            return chartData.valueField[index];

        return null;
    }

    private static renderOneLabel(block: Block, bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, dataRow: DataRow, field: Field, type: EmbeddedLabelTypeModel, blockSize: Size, margin: BlockMargin): void {
        const labelBlock = block.getChartBlock()
            .append('text')
            .attr('class', 'embedded-label')
            .text(ValueFormatter.formatValue(field.format, dataRow[field.name]))
            .style('pointer-events', 'none');

        const position = this.getLabelPosition(bar, labelBlock);
        const attrs = this.getLabelAttrs(bar, type, position);

        labelBlock
            .attr('x', attrs.x)
            .attr('y', attrs.y)
            .attr('text-anchor', attrs.textAnchor);

        if(position === 'inside')
            labelBlock.style('fill', '#FFFFFF');

        this.setLabelCoordinate(labelBlock);
    }

    private static getLabelAttrs(bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): LabelAttrs {
        if(type === 'key')
            return {
                x: this.getLabelAttrX(bar, type, position),
                y: parseFloat(bar.attr('y')),
                textAnchor: this.getTextAnchor(type, position)
            }
        return {
            x: this.getLabelAttrX(bar, type, position),
            y: parseFloat(bar.attr('y')),
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

    private static getTextAnchor(type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): TextAnchor {
        if(position === 'outside')
            return 'start';
        
        if(type === 'key')
            return 'start';
        return 'end';
    }

    private static getTextColor(position: EmbeddedLabelPosition): Color {
        if(position === 'inside')
            return color('#FFFFFF');
    }

    private static setLabelCoordinate(labels: d3.Selection<SVGTextElement, unknown, HTMLElement, any>): void {
        labels.each(function(d, i) {
            const thisLabel = d3.select(this);            
            thisLabel.attr('y', parseFloat(thisLabel.attr('y')) + thisLabel.node().getBBox().height)
        })
    }

    private static getLabelPosition(bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, labelBlock: d3.Selection<SVGTextElement, unknown, HTMLElement, any>): EmbeddedLabelPosition {
        if(parseFloat(bar.attr('width')) - LABEL_BAR_PADDING * 2 < labelBlock.node().getBBox().width)
            return 'outside';
        return 'inside';
    }
}