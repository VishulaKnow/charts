import { Orient, Size } from "../model";
import { LegendCanvasModel } from "./legendCanvasModel";

export class LegendModel
{
    public static getLegendSize(position: Orient, texts: string[], legendMaxWidth: number, blockSize: Size): number {
        if(position === 'left' || position === 'right') {
            return this.getLegendWidth(texts, legendMaxWidth);
        } else {
            const legends = LegendCanvasModel.getLegendHeight(texts, blockSize.width);
            return legends;
        }
    }
    
    private static getLegendWidth(texts: string[], legendMaxWidth: number): number {
        let longestText = '';
        texts.forEach(text => {
            if(text.length > longestText.length) 
                longestText = text;
        });
        const maxWidth = LegendCanvasModel.getLegendItemWidth(longestText + '0'); //Запас на один символ
        return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
    }
}