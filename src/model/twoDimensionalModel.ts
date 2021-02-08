import { Color } from "d3";
import { ChartOrientation, Config, TwoDimensionalChart, TwoDimensionalChartType, TwoDimensionalOptions } from "../config/config";
import { BarOptionsCanvas, DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { ChartStyleModel } from "./chartStyleModel";
import { DataManagerModel } from "./dataManagerModel";
import { GridLineModel } from "./gridLineModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataScope, DataSource, AdditionalElementsOptions, TwoDimensionalChartModel, TwoDimensionalOptionsModel, EmbeddedLabelTypeModel, Size } from "./model";
import { AxisType } from "./modelOptions";
import { ScaleModel, ScaleType } from "./scaleModel";

/** If bar has width less than this size embedded labels doesn't show */
export const MIN_BAR_SIZE_FOR_EMBEDDED_LABELS_DISPLAY = 20;

export class TwoDimensionalModel
{
    public static getOptions(config: Config, designerConfig: DesignerConfig, margin: BlockMargin, dataScope: DataScope, data: DataSource): TwoDimensionalOptionsModel {
        const configOptions = <TwoDimensionalOptions>config.options;

        return {
            legend: LegendModel.getLegendModel(config.options.type, config.options.legend.position, config.canvas.size),
            orient: configOptions.orientation,
            isSegmented: configOptions.isSegmented,
            scale: {
                scaleKey: {
                    domain: ScaleModel.getScaleKeyDomain(dataScope.allowableKeys),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Key, configOptions.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleKeyType(configOptions.charts),
                    elementsAmount: ScaleModel.getScaleElementsAmount(this.getChartsByType(configOptions.charts, 'bar'), configOptions.isSegmented)
                },
                scaleValue: {
                    domain: ScaleModel.getScaleLinearValueDomain(configOptions.axis.valueAxis.domain, data, configOptions),
                    range: {
                        start: 0,
                        end: ScaleModel.getScaleRangePeek(ScaleType.Value, configOptions.orientation, margin, config.canvas.size)
                    },
                    type: ScaleModel.getScaleValueType(configOptions.charts)
                }
            },
            axis: {
                keyAxis: {
                    type: 'key',
                    orient: AxisModel.getAxisOrient(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Key, configOptions.orientation, configOptions.axis.keyAxis.position, margin, config.canvas.size.height)
                    },
                    cssClass: 'key-axis',
                    ticks: configOptions.axis.keyAxis.ticks,
                    labels: {
                        maxSize: designerConfig.canvas.axisLabel.maxSize.main,
                        positition: AxisModel.getKeyAxisLabelPosition(margin, config.canvas.size, DataManagerModel.getDataValuesByKeyField(data, configOptions.charts[0]).length),
                        visible: !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(configOptions.charts, configOptions, data, configOptions.orientation, config.canvas.size, margin, designerConfig.canvas.chartOptions.bar)
                    }
                },
                valueAxis: {
                    type: 'value',
                    orient: AxisModel.getAxisOrient(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position),
                    translate: {
                        translateX: AxisModel.getAxisTranslateX(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.width),
                        translateY: AxisModel.getAxisTranslateY(AxisType.Value, configOptions.orientation, configOptions.axis.valueAxis.position, margin, config.canvas.size.height)
                    },          
                    cssClass: 'value-axis',
                    ticks: configOptions.axis.valueAxis.ticks,
                    labels: {
                        maxSize: designerConfig.canvas.axisLabel.maxSize.main,
                        positition: 'straight',
                        visible: true
                    }
                }
            },
            type: configOptions.type,
            charts: this.getChartsModel(configOptions.charts, designerConfig.chart.style.palette, configOptions.orientation, configOptions.isSegmented),
            additionalElements: this.getAdditionalElements(configOptions, designerConfig)
        }
    }

    public static getChartsEmbeddedLabelsFlag(charts: TwoDimensionalChart[], configOptions: TwoDimensionalOptions, data: DataSource, chartOrientation: ChartOrientation, blockSize: Size, margin: BlockMargin, barOptions: BarOptionsCanvas): boolean {
        return chartOrientation === 'horizontal' 
            && charts.length === this.findChartsWithEmbeddedKeyLabels(charts).length
            && this.getBarSize(DataManagerModel.getElementsInGroupAmount(configOptions, charts.length), data[charts[0].data.dataSource].length, chartOrientation, blockSize, margin, barOptions) >= MIN_BAR_SIZE_FOR_EMBEDDED_LABELS_DISPLAY;
    }

    private static getBarSize(elementsInGroupAmount: number, keysAmount: number, chartOrientation: ChartOrientation, blockSize: Size, margin: BlockMargin, barOptions: BarOptionsCanvas): number {
        const axisSize = AxisModel.getAxisLength(chartOrientation, margin, blockSize);
        return (axisSize / keysAmount - (elementsInGroupAmount - 1) * barOptions.barDistance - barOptions.groupMinDistance) / elementsInGroupAmount;
    }

    private static getChartsModel(charts: TwoDimensionalChart[], chartPalette: Color[], chartOrientation: ChartOrientation, isSegmented: boolean): TwoDimensionalChartModel[] {
        const chartsModel: TwoDimensionalChartModel[] = [];
        charts.forEach((chart, index) => {
            chartsModel.push({
                type: chart.type,
                title: chart.title,
                data: { ...chart.data },
                tooltip: chart.tooltip,
                cssClasses: ChartStyleModel.getCssClasses(index),
                style: ChartStyleModel.get2DChartStyle(chartPalette, charts.length, chart.type, this.getChartsValueFieldsAmount(charts), index, isSegmented),
                embeddedLabels: this.getEmbeddedLabelType(chart, chartOrientation),
                index
            });
        });
        
        return chartsModel;
    }

    private static findChartsWithEmbeddedKeyLabels(charts: TwoDimensionalChart[]): TwoDimensionalChart[] {
        const chartsWithEmbeddedLabels: TwoDimensionalChart[] = [];

        charts.forEach(chart => {
            if(chart.type === 'bar' && chart.embeddedLabels === 'key')
                chartsWithEmbeddedLabels.push(chart);
        });

        return chartsWithEmbeddedLabels;
    }

    private static getEmbeddedLabelType(currentChart: TwoDimensionalChart, chartOrientation: ChartOrientation): EmbeddedLabelTypeModel {
        if(chartOrientation === 'horizontal' && currentChart.type === 'bar')
            return currentChart.embeddedLabels;
        return 'none';
    }

    private static getAdditionalElements(options: TwoDimensionalOptions, designerConfig: DesignerConfig): AdditionalElementsOptions {
        return {
            gridLine: GridLineModel.getGridLineOptions(options.additionalElements.gridLine, designerConfig.additionalElements.gridLine)
        }
    }

    private static getChartsByType(charts: TwoDimensionalChart[], type: TwoDimensionalChartType): TwoDimensionalChart[] {
        return charts.filter(chart => chart.type === type);
    }

    private static getChartsValueFieldsAmount(charts: TwoDimensionalChart[]): number[] {
        return charts.map(chart => chart.data.valueFields.length);
    }
}