import { BlockMargin, EmbeddedLabelTypeModel, Field, Orient, Size, TwoDimensionalChartDataModel } from "../../../model/model";

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
const MIN_BAR_HEIGHT_FOR_LABEL_SERVE = 12;

export class EmbeddedLabelsHelper
{
    public static getLabelPosition(barAttrs: BarAttrs, labelBlockWidth: number, margin: BlockMargin, blockSize: Size): EmbeddedLabelPosition {
        if(barAttrs.height < MIN_BAR_HEIGHT_FOR_LABEL_SERVE || this.getSpaceSizeForType('inside', barAttrs.width, margin, blockSize) < labelBlockWidth 
            && this.getSpaceSizeForType('inside', barAttrs.width, margin, blockSize) < this.getSpaceSizeForType('outside', barAttrs.width, margin, blockSize))
            return 'outside';

        return 'inside';
    }

    public static getSpaceSizeForType(position: EmbeddedLabelPosition, barWidth: number, margin: BlockMargin, blockSize: Size): number {
        if(position === 'outside')
            return blockSize.width - margin.left - margin.right - barWidth - LABEL_BAR_PADDING;
    
        return barWidth - LABEL_BAR_PADDING * 2;
    }

    public static getLabelAttrs(barAttrs: BarAttrs, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition, keyAxisOrient: Orient): LabelAttrs {
        return {
            x: this.getLabelAttrX(barAttrs, type, position, keyAxisOrient),
            y: this.getLabelAttrY(barAttrs.y, barAttrs.height),
            textAnchor: this.getTextAnchor(type, position, keyAxisOrient)
        }
    }

    public static getLabelField(type: EmbeddedLabelTypeModel, chartData: TwoDimensionalChartDataModel, index: number): Field {
        if(type === 'key')
            return chartData.keyField;
        else if(type === 'value')
            return chartData.valueFields[index];

        return null;
    }

    private static getLabelAttrX(barAttrs: BarAttrs, type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition, keyAxisOrient: Orient): number {
        if(keyAxisOrient === 'left') {
            if(position === 'outside')
                return barAttrs.x + barAttrs.width + LABEL_BAR_PADDING;
        
            if(type === 'key')
                return barAttrs.x + LABEL_BAR_PADDING;

            return barAttrs.x + barAttrs.width - LABEL_BAR_PADDING;
        }

        if(position === 'outside')
            return barAttrs.x - LABEL_BAR_PADDING;
            
        if(type === 'key')
            return barAttrs.x + barAttrs.width - LABEL_BAR_PADDING;

        return barAttrs.x + LABEL_BAR_PADDING;
    }

    private static getLabelAttrY(barY: number, barHeight: number): number {      
        return barY + barHeight / 2;
    }

    private static getTextAnchor(type: EmbeddedLabelTypeModel, position: EmbeddedLabelPosition, keyAxisOrient: Orient): TextAnchor {
        if(keyAxisOrient === 'left') {
            if(position === 'outside' || type === 'key')
                return 'start';
            
            return 'end';
        }

        if(position === 'outside' || type === 'key')
            return 'end';
        return 'start';
    }
}