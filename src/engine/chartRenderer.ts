import { BarChartSettings, BlockMargin, ChartElementsSettings, DataSource, DonutChartSettings, IntervalChartModel, IntervalOptionsModel, Model, OptionsModelData, Orient, PolarChartModel, PolarOptionsModel, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../model/model";
import { Area } from "./twoDimensionalNotation/area/area";
import { Axis } from "./features/axis/axis";
import { Bar } from "./twoDimensionalNotation/bar/bar";
import { Donut } from "./polarNotation/donut";
import { GridLine } from "./features/gridLine/gridLine";
import { Legend } from "./features/legend/legend";
import { Line } from "./twoDimensionalNotation/line/line";
import { Scale, Scales } from "./features/scale/scale";
import { Block } from "./block/block";
import { Tooltip } from "./features/tolltip/tooltip";
import { RecordOverflowAlert } from "./features/recordOverflowAlert/recordOverflowAlert";
import { Gantt } from "./intervalNotation/gantt";
import { BarHelper } from "./twoDimensionalNotation/bar/barHelper";
import { Title } from "./features/title/title";

export class ChartRenderer {
    public static render2D(block: Block, model: Model, data: DataSource, chartId: number): void {
        const options = <TwoDimensionalOptionsModel>model.options;

        const scales = Scale.getScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar);

        block.renderSvg(model.blockCanvas.size);

        Axis.render(block, scales, options.scale, options.axis, model.chartBlock.margin, model.blockCanvas.size);

        GridLine.render(block, options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin, options.scale.scaleKey);

        this.render2DCharts(block,
            options.charts,
            scales,
            data,
            options.data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.chartSettings.bar,
            model.blockCanvas.size,
            options.additionalElements.marks.show);
        
        Title.render(block, 
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.render(block,
            data,
            options,
            model.otherComponents.legendBlock,
            model.blockCanvas.size);

        Tooltip.renderTooltips(block, model, data, chartId, scales);
        if (model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount, 'top', options.orient);
    }

    public static renderPolar(block: Block, model: Model, data: DataSource, chartId: number) {
        const options = <PolarOptionsModel>model.options;

        block.renderSvg(model.blockCanvas.size);

        this.renderPolarCharts(block, options.charts,
            data,
            options.data.dataSource,
            model.chartBlock.margin,
            model.blockCanvas.size,
            model.chartSettings.donut);

        Title.render(block, 
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.render(block, data, options, model.otherComponents.legendBlock, model.blockCanvas.size);

        Tooltip.renderTooltips(block, model, data, chartId);
        if (model.dataSettings.scope.hidedRecordsAmount !== 0 && model.options.legend.position !== 'off')
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount, model.options.legend.position);
    }

    private static render2DCharts(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, barSettings: BarChartSettings, blockSize: Size, markFlag: boolean) {
        block.renderClipPath(margin, blockSize);
        block.renderChartBlock();
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if (chart.type === 'bar')
                Bar.render(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize,
                    barSettings,
                    BarHelper.getBarsInGroupAmount(charts),
                    chart.isSegmented,
                    charts.findIndex(ch => ch.type === 'bar'));
            else if (chart.type === 'line')
                Line.render(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart,
                    markFlag);
            else if (chart.type === 'area')
                Area.render(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize,
                    markFlag);
        });
    }

    private static renderPolarCharts(block: Block, charts: PolarChartModel[], data: DataSource, dataSource: string, margin: BlockMargin, blockSize: Size, donutSettings: DonutChartSettings) {
        charts.forEach((chart: PolarChartModel) => {
            if (chart.type === 'donut')
                Donut.render(block,
                    data[dataSource],
                    margin,
                    chart,
                    blockSize,
                    donutSettings);
        });
    }

    private static renderIntervalCharts(block: Block, charts: IntervalChartModel[], scales: Scales, data: DataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, chartSettings: ChartElementsSettings): void {
        block.renderChartBlock();
        charts.forEach(chart => {
            if (chart.type === 'gantt')
                Gantt.render(block,
                    data[dataOptions.dataSource],
                    dataOptions,
                    scales,
                    margin,
                    keyAxisOrient,
                    chart,
                    chartSettings.bar);
        });
    }

    public static updateByValueAxis(block: Block, model: Model, data: DataSource) {
        const options = <TwoDimensionalOptionsModel>model.options;

        const scales = Scale.getScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar);

        Axis.updateValueAxisDomain(block,
            scales.scaleValue,
            options.scale.scaleValue,
            options.axis.valueAxis);

        GridLine.rerender(block,
            options.additionalElements.gridLine.flag,
            options.axis.keyAxis,
            options.axis.valueAxis,
            model.blockCanvas.size,
            model.chartBlock.margin,
            options.scale.scaleKey);

        this.updateChartsByValueAxis(block,
            options.charts,
            scales,
            data,
            model.options.data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.blockCanvas.size);
    }

    private static updateChartsByValueAxis(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, blockSize: Size): void {
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if (chart.type === 'bar') {
                Bar.updateBarChartByValueAxis(block,
                    data[dataOptions.dataSource],
                    scales,
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize,
                    chart.isSegmented);
            }
            else if (chart.type === 'line') {
                Line.updateLineChartByValueAxis(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart);
            }
            else if (chart.type === 'area') {
                Area.updateAreaChartByValueAxis(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    chart,
                    keyAxisOrient,
                    blockSize);
            }
        });
    }
}