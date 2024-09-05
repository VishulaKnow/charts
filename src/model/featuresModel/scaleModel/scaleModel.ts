import { ScaleKeyModel, ScaleKeyType, ScaleValueModel } from "../../model";
import { MdtChartsTwoDimensionalChart, MdtChartsTwoDimensionalOptions, ChartOrientation, MdtChartsDataRow } from "../../../config/config";
import { Formatter } from "../../../designer/designerConfig";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { getElementsAmountForScale, getScaleKeyRangePeek, getScaleValueRangePeek } from "./scaleModelServices";
import { getScaleLinearDomain } from "./scaleDomainService";
import { TwoDimConfigReader } from "../../modelInstance/configReader";

export enum ScaleType {
    Key, Value
}

export class ScaleModel {
    getScaleKey(allowableKeys: string[], orient: ChartOrientation, canvasModel: CanvasModel, charts: MdtChartsTwoDimensionalChart[], barCharts: MdtChartsTwoDimensionalChart[]): ScaleKeyModel {
        return {
            domain: allowableKeys,
            range: {
                start: 0,
                end: getScaleKeyRangePeek(orient, canvasModel)
            },
            type: this.getScaleKeyType(charts),
            elementsAmount: getElementsAmountForScale(barCharts)
        }
    }

    getScaleLinear(options: MdtChartsTwoDimensionalOptions, dataRows: MdtChartsDataRow[], canvasModel: CanvasModel, configReader?: TwoDimConfigReader): ScaleValueModel {
        return {
            domain: getScaleLinearDomain(options.axis.value.domain, dataRows, options),
            range: {
                start: 0,
                end: getScaleValueRangePeek(options.orientation, canvasModel)
            },
            type: "linear",
            formatter: configReader?.getAxisLabelFormatter() ?? null
        }
    }

    getScaleSecondaryLinear(options: MdtChartsTwoDimensionalOptions, dataRows: MdtChartsDataRow[], canvasModel: CanvasModel, configReader?: TwoDimConfigReader): ScaleValueModel {
        return {
            domain: getScaleLinearDomain(options.axis.value.domain, dataRows, options, 'secondary'),
            range: {
                start: 0,
                end: getScaleValueRangePeek(options.orientation, canvasModel)
            },
            type: "linear",
            formatter: configReader?.getAxisLabelFormatter() ?? null
        }
    }

    private getScaleKeyType(charts: MdtChartsTwoDimensionalChart[]): ScaleKeyType {
        if (charts.findIndex((chart: MdtChartsTwoDimensionalChart) => chart.type === 'bar') === -1)
            return 'point';
        return 'band';
    }
}