import {
    ChartOrientation,
    MdtChartsTwoDimensionalChart,
    TwoDimensionalChartType,
    MdtChartsTwoDimensionalOptions,
} from "../../config/config";
import { ChartOptionsCanvas, DesignerConfig } from "../../designer/designerConfig";
import { ChartStyleModelService } from "../chartStyleModel/chartStyleModel";
import { TwoDimensionalChartStyleModel } from "../chartStyleModel/twoDimensionalChartStyleModel";
import { AxisModel } from "../featuresModel/axisModel";
import { ScaleAxisRecalcer } from "../featuresModel/scaleModel/scaleAxisRecalcer";
import { ScaleModel } from "../featuresModel/scaleModel/scaleModel";
import {
    TwoDimensionalOptionsModel,
    TwoDimensionalChartModel,
    EmbeddedLabelTypeModel,
    AdditionalElementsOptions,
    TwoDimChartElementsSettings,
    Orient,
} from "../model";
import { TwoDimConfigReader } from "../modelInstance/configReader";
import { ModelInstance } from "../modelInstance/modelInstance";
import {
    getAreaViewOptions,
    getBarViewOptions,
    getLegendMarkerOptions,
    LINE_CHART_DEFAULT_WIDTH,
    parseDashStyles,
    parseShape
} from "./twoDimensional/styles";
import { DataRepositoryModel } from "../modelInstance/dataModel/dataRepository";
import {
    calculateValueLabelAlignment,
    getValueLabelX, getValueLabelY
} from "../../model/featuresModel/valueLabelsModel/valueLabelsModel";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { TwoDimensionalModelHelper } from "../helpers/twoDimensionalModelHelper";
import { TitleConfigReader } from "../modelInstance/titleConfigReader";


export class TwoDimensionalModel {
    public static getOptions(configReader: TwoDimConfigReader, designerConfig: DesignerConfig, modelInstance: ModelInstance): TwoDimensionalOptionsModel {
        const options = configReader.options;
        const canvasModel = modelInstance.canvasModel;
        const scaleModel = new ScaleModel();
        const titleConfig = TitleConfigReader.create(options.title, modelInstance);
        const scaleMarginRecalcer = new ScaleAxisRecalcer(() => scaleModel.getScaleLinear(options, modelInstance.dataModel.repository.getScopedRows(), canvasModel, configReader));
        scaleMarginRecalcer.recalculateMargin(canvasModel, options.orientation, options.axis.key);
        const scaleValueInfo = scaleMarginRecalcer.getScaleValue();

        let secondaryScaleValueInfo;
        if (configReader.containsSecondaryAxis()) {
            const secondaryScaleMarginRecalcer = new ScaleAxisRecalcer(() => scaleModel.getScaleSecondaryLinear(options, modelInstance.dataModel.repository.getScopedRows(), canvasModel, configReader));
            secondaryScaleMarginRecalcer.recalculateMargin(canvasModel, options.orientation, options.axis.key);
            secondaryScaleValueInfo = secondaryScaleMarginRecalcer.getScaleValue();
        }

        const keyAxis = AxisModel.getKeyAxis(options, modelInstance.dataModel.repository.getScopedFullSource(), designerConfig.canvas.axisLabel, canvasModel, designerConfig.elementsOptions.tooltip, () => scaleValueInfo.scaleFn(0));

        const charts = this.getChartsModel(options.charts, configReader, options.orientation, designerConfig, modelInstance.dataModel.repository, keyAxis.orient, canvasModel, options.data.keyField.name);

        const defaultFormatter = configReader.calculateDefaultAxisLabelFormatter();

        return {
            legend: canvasModel.legendCanvas.getModel(),
            title: {
                textContent: titleConfig.getTextContent(),
                fontSize: titleConfig.getFontSize(),
            },
            selectable: !!options.selectable,
            orient: options.orientation,
            scale: {
                key: scaleModel.getScaleKey(modelInstance.dataModel.getAllowableKeys(), options.orientation, canvasModel, options.charts, this.getChartsByTypes(options.charts, ['bar', 'dot'])),
                value: scaleValueInfo.scale,
                ...(configReader.containsSecondaryAxis() && { valueSecondary: secondaryScaleValueInfo.scale }),
            },
            axis: {
                key: keyAxis,
                value: AxisModel.getMainValueAxis(defaultFormatter, options.orientation, options.axis.value.position, options.axis.value, designerConfig.canvas.axisLabel, canvasModel), ...(configReader.containsSecondaryAxis() && { valueSecondary: AxisModel.getSecondaryValueAxis(defaultFormatter, options.orientation, options.axis.value.position, options.axis.valueSecondary, designerConfig.canvas.axisLabel, canvasModel) })
            },
            type: options.type,
            data: { ...options.data },
            charts,
            additionalElements: this.getAdditionalElements(options),
            tooltip: options.tooltip,
            chartSettings: this.getChartsSettings(designerConfig.canvas.chartOptions, options.orientation),
            valueLabels: TwoDimensionalModelHelper.getValueLabels(options.valueLabels, canvasModel, options.orientation, configReader.getValueLabelsStyleModel()),
            defs: {
                gradients: TwoDimensionalModelHelper.getGradientDefs(charts, keyAxis.orient, options.orientation)
            }
        }
    }

    public static getChartsEmbeddedLabelsFlag(charts: MdtChartsTwoDimensionalChart[], chartOrientation: ChartOrientation): boolean {
        // Если НЕ найден хотя бы один чарт, который сегментированный или хотя бы один НЕ бар чарт, то лейблы можно прятать
        return charts.findIndex(chart => chart.isSegmented || chart.type !== 'bar') === -1
            && chartOrientation === 'horizontal'
            && charts.length === this.findChartsWithEmbeddedKeyLabels(charts).length;
    }

    /**
     * Сортирует список чартов в порядке: area - bar - line.
     * Используется для того, чтобы при рендере графики с наибольшей площадью (area) не перекрывали графики с меньшей площадью (bar, line).
     * @param charts Чарты из конфига
     */
    public static sortCharts(charts: MdtChartsTwoDimensionalChart[]): void {
        const chartOrder: TwoDimensionalChartType[] = ['area', 'bar', 'line', 'dot'];
        charts.sort((chart1, chart2) => chartOrder.indexOf(chart1.type) - chartOrder.indexOf(chart2.type));
    }

    public static getChartsSettings(chartOptions: ChartOptionsCanvas, chartOrientation: ChartOrientation): TwoDimChartElementsSettings {
        return {
            bar: { ...chartOptions.bar },
            lineLike: { shape: parseShape(chartOrientation, chartOptions.line?.shape) }
        }
    }

    private static getChartsModel(charts: MdtChartsTwoDimensionalChart[], configReader: TwoDimConfigReader, chartOrientation: ChartOrientation, designerConfig: DesignerConfig, dataModelRep: DataRepositoryModel, keyAxisOrient: Orient, canvasModel: CanvasModel, keyFieldName: string): TwoDimensionalChartModel[] {
        const styleModel = new TwoDimensionalChartStyleModel(charts, designerConfig.chartStyle);
        const chartsModel: TwoDimensionalChartModel[] = [];
        charts.forEach((chart, index) => {
            const style = styleModel.getChartStyle(chart, index);

            chartsModel.push({
                type: chart.type,
                isSegmented: chart.isSegmented,
                data: { ...chart.data },
                tooltip: { show: true },
                cssClasses: ChartStyleModelService.getCssClasses(index),
                style,
                embeddedLabels: this.getEmbeddedLabelType(chart, chartOrientation),
                markersOptions: {
                    show: ({ row, valueFieldName }) => TwoDimensionalModelHelper.shouldMarkerShow(chart, dataModelRep.getRawRows(), valueFieldName, row, keyFieldName),
                    styles: {
                        highlighted: {
                            size: { radius: designerConfig.canvas.markers?.highlighted?.radius ?? 4, borderSize: '3.5px' }
                        },
                        normal: {
                            size: {
                                radius: designerConfig.canvas.markers?.normal?.radius ?? 3,
                                borderSize: `${designerConfig.canvas.markers?.normal?.borderSize ?? 2}px`
                            }
                        }
                    }
                },
                lineLikeViewOptions: {
                    dashedStyles: parseDashStyles(chart.lineStyles?.dash),
                    strokeWidth: chart.lineStyles?.width ?? LINE_CHART_DEFAULT_WIDTH,
                    renderForKey: (dataRow, valueFieldName) => dataRow[valueFieldName] !== null && dataRow[valueFieldName] !== undefined
                },
                barViewOptions: getBarViewOptions(chart, keyAxisOrient),
                legend: getLegendMarkerOptions(chart),
                index,
                valueLabels: {
                    show: chart.valueLabels?.on ?? false,
                    handleX: (scaledValue) => getValueLabelX(scaledValue, keyAxisOrient, canvasModel.getMargin()),
                    handleY: (scaledValue) => getValueLabelY(scaledValue, keyAxisOrient, canvasModel.getMargin()),
                    textAnchor: calculateValueLabelAlignment(keyAxisOrient).textAnchor,
                    dominantBaseline: calculateValueLabelAlignment(keyAxisOrient).dominantBaseline,
                    format: configReader.getValueLabelFormatterForChart(index),
                },
                areaViewOptions: getAreaViewOptions(chart, index, style),
                dotViewOptions: {
                    shape: {
                        type: "line",
                        handleEndCoordinate: (v) => v + 2,
                        handleStartCoordinate: (v) => v - 2,
                        width: chart.dotLikeStyles?.shape?.width ?? LINE_CHART_DEFAULT_WIDTH
                    }
                }
            });
        });

        return chartsModel;
    }

    private static findChartsWithEmbeddedKeyLabels(charts: MdtChartsTwoDimensionalChart[]): MdtChartsTwoDimensionalChart[] {
        const chartsWithEmbeddedLabels: MdtChartsTwoDimensionalChart[] = [];

        charts.forEach(chart => {
            if (chart.type === 'bar' && chart.embeddedLabels === 'key')
                chartsWithEmbeddedLabels.push(chart);
        });

        return chartsWithEmbeddedLabels;
    }

    private static getEmbeddedLabelType(currentChart: MdtChartsTwoDimensionalChart, chartOrientation: ChartOrientation): EmbeddedLabelTypeModel {
        if (chartOrientation === 'horizontal' && currentChart.type === 'bar')
            return currentChart.embeddedLabels;
        return 'none';
    }

    private static getAdditionalElements(options: MdtChartsTwoDimensionalOptions): AdditionalElementsOptions {
        const { flag, styles } = options.additionalElements.gridLine;

        return {
            gridLine: {
                flag,
                styles: {
                    dash: { on: styles?.dash?.on ?? false }
                }
            }
        }
    }

    private static getChartsByTypes(charts: MdtChartsTwoDimensionalChart[], types: TwoDimensionalChartType[]): MdtChartsTwoDimensionalChart[] {
        return charts.filter(chart => types.includes(chart.type));
    }
}