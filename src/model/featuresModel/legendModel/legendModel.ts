import { LegendBlockModel, Orient } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { LegendItemsDirection } from "./legendCanvasModel";

export class LegendModel {
    public static getBaseLegendBlockModel(canvasModel: CanvasModel): LegendBlockModel {
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
                    margin: { top: 10, bottom: 20, left: 0, right: 0 },
                    pad: 0
                },
                right: {
                    size: 0,
                    margin: { top: canvasModel.titleCanvas.getAllNeededSpace(), bottom: mb, left: 15, right: 0 },
                    pad: 0
                },
                top: {
                    size: 0,
                    margin: { top: 5, bottom: 10, left: 0, right: 0 },
                    pad: canvasModel.titleCanvas.getAllNeededSpace()
                }
            }
        }
    }

    public static getLegendItemClass(itemsPosition: LegendItemsDirection): string {
        return itemsPosition === 'column' ? 'legend-item-row' : 'legend-item-inline';
    }

    public static appendToGlobalMarginValuesLegendMargin(canvasModel: CanvasModel, position: Orient, legendBlockModel: LegendBlockModel): void {
        const legendCoordinate = legendBlockModel.coordinate;

        if (position === 'left' || position === 'right')
            canvasModel.increaseMarginSide(position, legendCoordinate[position].margin.left + legendCoordinate[position].margin.right);
        else
            canvasModel.increaseMarginSide(position, legendCoordinate[position].margin.top + legendCoordinate[position].margin.bottom)
    }
}