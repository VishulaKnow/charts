import { BarChartSettings, BlockMargin, DataSource, Model, OptionsModelData, Orient, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import Engine from "../engine";
import { Axis } from "../features/axis/axis";
import { EmbeddedLabels } from "../features/embeddedLabels/embeddedLabels";
import { GridLine } from "../features/gridLine/gridLine";
import { Legend } from "../features/legend/legend";
import { RecordOverflowAlert } from "../features/recordOverflowAlert/recordOverflowAlert";
import { Scale, Scales } from "../features/scale/scale";
import { Title } from "../features/title/title";
import { Tooltip } from "../features/tolltip/tooltip";
import { Helper } from "../helper";
import { Area } from "./area/area";
import { Bar } from "./bar/bar";
import { BarHelper } from "./bar/barHelper";
import { Line } from "./line/line";

export class TwoDimensionalManager {
    public static render(engine: Engine, model: Model): void {
        const options = <TwoDimensionalOptionsModel>model.options;

        const scales = Scale.getScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar);

        engine.block.scales = scales;

        engine.block.renderSvg(model.blockCanvas.size);

        Axis.render(engine.block, scales, options.scale, options.axis, model.chartBlock.margin, model.blockCanvas.size);

        GridLine.render(engine.block, options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin, options.scale.scaleKey);

        this.renderCharts(engine.block,
            options.charts,
            scales,
            engine.data,
            options.data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.chartSettings.bar,
            model.blockCanvas.size);

        Title.render(engine.block,
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.render(engine.block,
            engine.data,
            options,
            model.otherComponents.legendBlock,
            model.blockCanvas.size);

        Tooltip.render(engine.block, model, engine.data, scales);

        if (model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(engine.block, model.dataSettings.scope.hidedRecordsAmount, 'top', options.orient);
    }

    public static updateData(block: Block, model: Model, data: DataSource) {
        block.transitionManager.interruptTransitions();

        const options = <TwoDimensionalOptionsModel>model.options;

        const scales = Scale.getScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar);

        const keyDomainEquality = Helper.checkDomainsEqual(block.scales.scaleKey.domain(), scales.scaleKey.domain());
        block.scales = scales;

        Axis.update(block, scales, options.scale, options.axis, model.blockCanvas.size, keyDomainEquality);

        GridLine.rerender(block,
            options.additionalElements.gridLine.flag,
            options.axis.keyAxis,
            options.axis.valueAxis,
            model.blockCanvas.size,
            model.chartBlock.margin,
            options.scale.scaleKey);

        this.updateCharts(block,
            options.charts,
            scales,
            data,
            model.options.data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.blockCanvas.size,
            model.chartSettings.bar);

        Tooltip.render(block, model, data, scales);

        RecordOverflowAlert.update(block, model.dataSettings.scope.hidedRecordsAmount, 'top', options.orient);
    }

    private static renderCharts(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, barSettings: BarChartSettings, blockSize: Size) {
        block.renderClipPath(margin, blockSize);
        block.renderChartsBlock();
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
                    chart);
            else if (chart.type === 'area')
                Area.render(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize);
        });
        EmbeddedLabels.raiseGroups(block);
    }

    private static updateCharts(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, blockSize: Size, barSettings: BarChartSettings): void {
        block.updateClipPath(margin, blockSize);
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if (chart.type === 'bar') {
                Bar.update(block,
                    data[dataOptions.dataSource],
                    scales,
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize,
                    BarHelper.getBarsInGroupAmount(charts),
                    dataOptions.keyField,
                    charts.findIndex(ch => ch.type === 'bar'),
                    barSettings,
                    chart.isSegmented);
            } else if (chart.type === 'line') {
                Line.update(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart);
            }
            else if (chart.type === 'area') {
                Area.update(block,
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