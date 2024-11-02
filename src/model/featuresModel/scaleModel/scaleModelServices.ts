import { ChartOrientation, MdtChartsTwoDimensionalChart, TwoDimensionalChartType } from "../../../config/config";
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

    let barAmounts: Partial<Record<TwoDimensionalChartType, number>> = {};
    barCharts.forEach(chart => {
        if (!barAmounts[chart.type])
            barAmounts[chart.type] = 0;

        if (chart.isSegmented)
            barAmounts[chart.type] += 1; // Если бар сегментированный, то все valueFields являются частями одного бара
        else
            barAmounts[chart.type] += chart.data.valueFields.length;
    });

    return Math.max(...Object.values(barAmounts));
}