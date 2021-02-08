import { BlockMargin, DataRow, EmbeddedLabelTypeModel, Field, Size, TwoDimensionalChartDataModel } from "../../../model/model";
import { Helper } from "../../helper";

export type EmbeddedLabelPosition = 'inside' | 'outside';
export type TextAnchor = 'start' | 'end' | 'center';
export interface LabelAttrs {
    x: number;
    y: number;
    textAnchor: TextAnchor;
}

export const LABEL_BAR_PADDING = 6;

export class EmbeddedLabelsHelper
{
    public static getLabelPosition(barWidth: number, labelBlockWidth: number, margin: BlockMargin, blockSize: Size): EmbeddedLabelPosition {
        if(this.getSpaceSizeForType('inside', barWidth, margin, blockSize) < labelBlockWidth 
            && this.getSpaceSizeForType('inside', barWidth, margin, blockSize) < this.getSpaceSizeForType('outside', barWidth, margin, blockSize))
            return 'outside';

        return 'inside';
    }

    public static getSpaceSizeForType(position: EmbeddedLabelPosition, barWidth: number, margin: BlockMargin, blockSize: Size): number {
        if(position === 'outside')
            return blockSize.width - margin.left - margin.right - barWidth - LABEL_BAR_PADDING;
    
        return barWidth - LABEL_BAR_PADDING * 2;
    }

    public static getLabelAttrs(bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, labelBlock: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): LabelAttrs {
        if(type === 'key')
            return {
                x: this.getLabelAttrX(bar, type, position),
                y: this.getLabelAttrY(Helper.getSelectionNumericAttr(bar, 'y'), labelBlock.node().getBBox().height),
                textAnchor: this.getTextAnchor(type, position)
            }
        return {
            x: this.getLabelAttrX(bar, type, position),
            y: this.getLabelAttrY(Helper.getSelectionNumericAttr(bar, 'y'), labelBlock.node().getBBox().height),
            textAnchor: this.getTextAnchor(type, position)
        }
    }

    public static getLabelAttrX(bar: d3.Selection<SVGRectElement, DataRow, HTMLElement, any>, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): number {
        if(position === 'outside')
            return parseFloat(bar.attr('x')) + parseFloat(bar.attr('width')) + LABEL_BAR_PADDING;
        
        if(type === 'key')
            return parseFloat(bar.attr('x')) + LABEL_BAR_PADDING;

        return parseFloat(bar.attr('x')) + parseFloat(bar.attr('width')) - LABEL_BAR_PADDING;
    }

    public static getLabelAttrY(barY: number, labelBlockHeight: number): number {      
        const PADDING_OF_TEXT_BLOCK = 2;
        return (barY - labelBlockHeight) / 2 - PADDING_OF_TEXT_BLOCK;
    }

    public static getTextAnchor(type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): TextAnchor {
        if(position === 'outside')
            return 'start';
        
        if(type === 'key')
            return 'start';
        return 'end';
    }

    public static getLabelField(type: EmbeddedLabelTypeModel, chartData: TwoDimensionalChartDataModel, index: number): Field {
        if(type === 'key')
            return chartData.keyField;
        else if(type === 'value')
            return chartData.valueFields[index];

        return null;
    }
}