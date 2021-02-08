import { BlockMargin, DataRow, Size } from "../../../model/model";
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
}