import { ChartNotation, LegendPosition } from "../../config/config";
import { ILegendModel, LegendBlockModel, Orient, Size } from "../model";
import { LegendCanvasModel, LegendItemsDirection } from "./legendCanvasModel";

export class LegendModel
{
    public static getLegendSize(chartNotation: ChartNotation, position: Orient, texts: string[], legendMaxWidth: number, blockSize: Size, legendBlockModel: LegendBlockModel): number {
        if(position === 'left' || position === 'right')
            return this.getLegendWidth(texts, legendMaxWidth);
        if(chartNotation === '2d' || chartNotation === 'interval') {
            return LegendCanvasModel.getLegendHeight(texts, blockSize.width, legendBlockModel[position].margin.left, legendBlockModel[position].margin.right, 'row', position);
        } else if(chartNotation === 'polar') {
            const size = LegendCanvasModel.getLegendHeight(texts, blockSize.width, legendBlockModel[position].margin.left, legendBlockModel[position].margin.right, 'column', position);
            return size;
        }
    }

    public static getBaseLegendBlockModel(): LegendBlockModel {
        const mt = 20, mb = 20, ml = 20, mr = 20;
        return {
            left: { 
                size: 0,
                margin: { top: mt, bottom: mb, left: ml, right: mr }
            },
            right: { 
                size: 0,
                margin: { top: mt, bottom: mb, left: ml, right: mr }
            },
            bottom: { 
                size: 0,
                margin: { top: 0, bottom: 20, left: 20, right: 20 }
            },
            top: { 
                size: 0,
                margin: { top: 20, bottom: 0, left: 20, right: 20 }
            }
        }
    }

    public static getLegendModel(chartNotation: ChartNotation, position: LegendPosition, blockSize: Size): ILegendModel {
        let legendPosition: LegendPosition = 'off';
        if(position !== 'off') {
            if(chartNotation === '2d' || chartNotation === 'interval')
                legendPosition = 'top';
            else if(chartNotation === 'polar') {
                legendPosition = blockSize.width < 600 ? 'bottom' : 'right';
            }
        }
        
        return {
            position: legendPosition
        }
    }

    public static getLegendItemClass(itemsPosition: LegendItemsDirection): string {
        return itemsPosition === 'column' ? 'legend-item-row' : 'legend-item-inline'; 
    }

    public static getMarginClass(legendPosition: LegendPosition): string {
        return legendPosition === 'right' ? 'mt-15' : 'mt-10';
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