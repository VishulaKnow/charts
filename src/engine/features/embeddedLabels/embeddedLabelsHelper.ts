import { BlockMargin, DataRow, EmbeddedLabelTypeModel, Field, Size, TwoDimensionalChartDataModel } from "../../../model/model";

export type EmbeddedLabelPosition = 'inside' | 'outside';
export type TextAnchor = 'start' | 'end' | 'center';

export interface LabelAttrs {
    x: number;
    y: number;
    textAnchor: TextAnchor;
}
export interface BarAttrs {
    x: number;
    y: number;
    width: number;
    height: number;
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

    public static getLabelAttrs(barAttrs: BarAttrs, labelBlockHeight: number, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): LabelAttrs {
        return {
            x: this.getLabelAttrX(barAttrs.x, barAttrs.width, type, position),
            y: this.getLabelAttrY(barAttrs.y, barAttrs.height, labelBlockHeight),
            textAnchor: this.getTextAnchor(type, position)
        }
    }

    public static getLabelField(type: EmbeddedLabelTypeModel, chartData: TwoDimensionalChartDataModel, index: number): Field {
        if(type === 'key')
            return chartData.keyField;
        else if(type === 'value')
            return chartData.valueFields[index];

        return null;
    }

    private static getLabelAttrX(barX: number, barWidth: number, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): number {
        if(position === 'outside')
            return barX + barWidth + LABEL_BAR_PADDING;
        
        if(type === 'key')
            return barX + LABEL_BAR_PADDING;

        return barX + barWidth - LABEL_BAR_PADDING;
    }

    private static getLabelAttrY(barY: number, barHeight: number, labelBlockHeight: number): number {      
        const PADDING_OF_TEXT_BLOCK = 1;
        return barY + barHeight - (barHeight - labelBlockHeight) / 2 - PADDING_OF_TEXT_BLOCK;
    }

    private static getTextAnchor(type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition): TextAnchor {
        if(position === 'outside')
            return 'start';
        
        if(type === 'key')
            return 'start';
        return 'end';
    }
}