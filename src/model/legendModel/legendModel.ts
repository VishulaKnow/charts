import { ChartNotation } from "../../config/config";
import { BlockMargin, ILegendModel, LegendBlockModel, LegendPosition, Orient, Size } from "../model";
import { ModelHelper } from "../modelHelper";
import { LegendCanvasModel, LegendItemsDirection } from "./legendCanvasModel";

/** If donut block has width less than this const, legend change postion from "right" to "bottom" */
export const MIN_DONUT_BLOCK_SIZE = 260;

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
                margin: { top: mt, bottom: mb, left: ml, right: 0 }
            },
            right: { 
                size: 0,
                margin: { top: mt, bottom: mb, left: 0, right: mr }
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

    public static getLegendModel(chartNotation: ChartNotation, legendShow: boolean, blockSize: Size, margin: BlockMargin): ILegendModel {
        let legendPosition: LegendPosition = 'off';
        if(legendShow) {
            if(chartNotation === '2d' || chartNotation === 'interval')
                legendPosition = 'top';
            else if(chartNotation === 'polar') {
                legendPosition = blockSize.width - margin.left - margin.right < MIN_DONUT_BLOCK_SIZE ? 'bottom' : 'right';
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
        let biggestScore = 0;

        texts.forEach(text => {
            if(ModelHelper.getStringScore(text) > biggestScore) {
                longestText = text;
                biggestScore = ModelHelper.getStringScore(text);
            } 
        });

        const maxWidth = LegendCanvasModel.getLegendItemWidth(longestText + '?'); // One letter reserve
        return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
    }
}