import { ChartNotation, Size } from "../../../config/config";
import { ILegendModel, LegendBlockModel, LegendPosition, Orient, TitleBlockModel } from "../../model";
import { ModelHelper } from "../../modelHelper";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { PolarModel } from "../../notations/polarModel";
import { LegendCanvasModel, LegendItemsDirection } from "./legendCanvasModel";


export class LegendModel {
    public static getLegendSize(chartNotation: ChartNotation, position: Orient, texts: string[], legendMaxWidth: number, blockSize: Size, legendBlockModel: LegendBlockModel): number {
        if (position === 'left' || position === 'right')
            return this.getLegendWidth(texts, legendMaxWidth);

        if (chartNotation === '2d' || chartNotation === 'interval') {
            return LegendCanvasModel.getLegendHeight(texts, blockSize.width, legendBlockModel.coordinate[position].margin.left, legendBlockModel.coordinate[position].margin.right, 'row', position);
        } else if (chartNotation === 'polar') {
            const size = LegendCanvasModel.getLegendHeight(texts, blockSize.width, legendBlockModel.coordinate[position].margin.left, legendBlockModel.coordinate[position].margin.right, 'column', position);
            return size;
        }
    }

    public static getBaseLegendBlockModel(notation: ChartNotation, canvasModel: CanvasModel): LegendBlockModel {
        const mt = 20, mb = 20, ml = 20, mr = 20;

        return {
            coordinate: {
                left: {
                    size: 0,
                    margin: { top: mt, bottom: mb, left: ml, right: 0 },
                    pad: 0
                },
                bottom: {
                    size: 0,
                    margin: { top: 0, bottom: 20, left: 20, right: 20 },
                    pad: 0
                },
                right: {
                    size: 0,
                    margin: { top: canvasModel.titleCanvas.getAllNeededSpace(), bottom: mb, left: 0, right: mr },
                    pad: 0
                },
                top: {
                    size: 0,
                    margin: { top: 20, bottom: 0, left: 20, right: 20 },
                    pad: canvasModel.titleCanvas.getAllNeededSpace()
                }
            },
            standartTooltip: notation === 'polar' ? false : true
        }
    }

    public static getLegendModel(chartNotation: ChartNotation, legendShow: boolean, canvasModel: CanvasModel): ILegendModel {
        let legendPosition: LegendPosition = 'off';

        if (legendShow) {
            if (chartNotation === '2d' || chartNotation === 'interval')
                legendPosition = 'top';
            else if (chartNotation === 'polar') {
                legendPosition = PolarModel.getLegendPositionByBlockSize(canvasModel);
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
            if (ModelHelper.getStringScore(text) > biggestScore) {
                longestText = text;
                biggestScore = ModelHelper.getStringScore(text);
            }
        });

        const maxWidth = LegendCanvasModel.getLegendItemWidth(longestText + '?'); // One letter reserve
        return maxWidth > legendMaxWidth ? legendMaxWidth : maxWidth;
    }
}