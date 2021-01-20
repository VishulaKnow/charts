import { LegendBlockModel, Orient, Size } from "../model";
import { LegendCanvasModel } from "./legendCanvasModel";

export class LegendModel
{
    public static getLegendSize(position: Orient, texts: string[], legendMaxWidth: number, blockSize: Size, legendBlockModel: LegendBlockModel): number {
        if(position === 'left' || position === 'right') {
            return this.getLegendWidth(texts, legendMaxWidth);
        } else {
            const legends = LegendCanvasModel.getLegendHeight(texts, blockSize.width, legendBlockModel[position].margin.left, legendBlockModel[position].margin.right);
            return legends;
        }
    }

    public static getBaseLegendBlockModel(): LegendBlockModel {
        const mt = 0, mb = 0, ml = 0, mr = 0;
        return {
            bottom: { 
                size: 0,
                margin: { top: mt, bottom: mb, left: ml, right: mr }
            },
            left: { 
                size: 0,
                margin: { top: mt, bottom: mb, left: ml, right: mr }
            },
            right: { 
                size: 0,
                margin: { top: mt, bottom: mb, left: ml, right: mr }
            },
            top: { 
                size: 0,
                margin: { top: mt, bottom: mb, left: ml, right: mr }
            }
        }
    }
    
    private static getLegendWidth(texts: string[], legendMaxWidth: number): number {
        let longestText = '';
        texts.forEach(text => {
            if(text.length > longestText.length) 
                longestText = text;
        });
        const maxWidth = LegendCanvasModel.getLegendItemWidth(longestText + ' '); //Запас на один символ
        return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
    }
}