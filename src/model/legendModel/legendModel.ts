import { Orient, Size } from "../model";
import { LegendCanvasModel } from "./legendCanvasModel";

export class LegendModel
{
    static getLegendSize(position: Orient, texts: string[], legendMaxWidth: number, blockSize: Size): number {
        if(position === 'left' || position === 'right') {
            return this.getLegendWidth(texts, legendMaxWidth);
        } else {
            const legends = LegendCanvasModel.getLegendHeight(texts, blockSize.width);
            return legends;
        }
    }
    
    static getLegendWidth(texts: string[], legendMaxWidth: number): number {
        let longestText = '';
        texts.forEach(text => {
            if(text.length > longestText.length) 
                longestText = text;
        });
        const maxWidth = LegendCanvasModel.getLegendItemWidth(longestText);
        return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
    }
}