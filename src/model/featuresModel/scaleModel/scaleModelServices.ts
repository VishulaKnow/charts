import { ChartOrientation, MdtChartsTwoDimensionalChart } from "../../../config/config";
import { CanvasSizesModel } from "../../modelInstance/canvasModel/canvasSizesModel/canvasSizeModel";

export function getScaleKeyRangePeek(chartOrientation: ChartOrientation, canvasModel: CanvasSizesModel) {
    if (chartOrientation === 'vertical')
        return canvasModel.getChartBlockWidth();
    return canvasModel.getChartBlockHeight();
}

export function getScaleValueRangePeek(chartOrientation: string, canvasModel: CanvasSizesModel) {
    if (chartOrientation === 'vertical')
        return canvasModel.getChartBlockHeight();
    return canvasModel.getChartBlockWidth();
}

export function getElementsAmountForScale(barCharts: MdtChartsTwoDimensionalChart[]) {
    if (barCharts.length === 0)
        return 1;

    let barsAmount = 0;
    barCharts.forEach(chart => {
        if (chart.isSegmented)
            barsAmount += 1; // Если бар сегментированный, то все valueFields являются частями одного бара
        else
            barsAmount += chart.data.valueFields.length;
    });

    return barsAmount;
}