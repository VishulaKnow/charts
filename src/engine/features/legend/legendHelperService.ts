import { ChartNotation } from "../../../config/config";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { LegendPosition } from "../../../model/model";

export class LegendHelperService {
    getWrapperClassByItemsDirection(itemsDirection: LegendItemsDirection) {
        return itemsDirection === "column" ? "legend-block-column" : "legend-block-row";
    }

    getWrapperJustifyContentClass(itemsDirection: LegendItemsDirection, legendPosition: LegendPosition) {
        return itemsDirection === "column" && legendPosition === "right" ? "legend-block-centered" : "";
    }

    getWrapperClassByWrappingItems(legendPosition: LegendPosition, chartNotation: ChartNotation) {
        if (this.doesLegendInTopBy2d(legendPosition, chartNotation)) {
            return "legend-wrapper-without-wrap"
        }
        return "legend-wrapper-with-wrap"
    }

    getLegendLabelClassByPosition(legendPosition: LegendPosition, chartNotation: ChartNotation, initialLabelClass: string): string {
        if (this.doesLegendInTopBy2d(legendPosition, chartNotation))
            return `${initialLabelClass} ${initialLabelClass + '-nowrap'}`;
        return initialLabelClass;
    }

    getItemClasses(itemsDirection: LegendItemsDirection): string {
        return itemsDirection === 'column' ? 'legend-item-row' : 'legend-item-inline';
    }

    getLegendItemsDirection(legendPosition: LegendPosition): LegendItemsDirection {
        if (legendPosition === 'right' || legendPosition === 'left')
            return 'column';
        return "row";
    }

    private doesLegendInTopBy2d(legendPosition: LegendPosition, chartNotation: ChartNotation,) {
        return (legendPosition === 'top' || legendPosition === 'bottom') && chartNotation === "2d"
    }
}