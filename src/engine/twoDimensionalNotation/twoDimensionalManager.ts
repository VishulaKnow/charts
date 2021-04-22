import { select } from "d3-selection";
import { DataSource, Size } from "../../config/config";
import { BarChartSettings, BlockMargin, Model, OptionsModelData, Orient, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { ElementHighlighter } from "../elementHighlighter/elementHighlighter";
import Engine from "../engine";
import { Axis } from "../features/axis/axis";
import { EmbeddedLabels } from "../features/embeddedLabels/embeddedLabels";
import { GridLine } from "../features/gridLine/gridLine";
import { Legend } from "../features/legend/legend";
import { RecordOverflowAlert } from "../features/recordOverflowAlert/recordOverflowAlert";
import { Scale, Scales } from "../features/scale/scale";
import { TipBox } from "../features/tipBox/tipBox";
import { Title } from "../features/title/title";
import { Tooltip } from "../features/tolltip/tooltip";
import { Helper } from "../helpers/helper";
import { Area } from "./area/area";
import { Bar } from "./bar/bar";
import { BarHelper } from "./bar/barHelper";
import { Line } from "./line/line";

export class TwoDimensionalManager {
    public static render(engine: Engine, model: Model): void {
        const options = <TwoDimensionalOptionsModel>model.options;

        const scales = Scale.getScales(options.scale.key,
            options.scale.value,
            model.chartSettings.bar);
        engine.block.scales = scales;

        engine.block.renderSvg(model.blockCanvas.size);

        Axis.render(engine.block, scales, options.scale, options.axis, model.blockCanvas.size);

        GridLine.render(engine.block, options.additionalElements.gridLine.flag, options.axis, model.blockCanvas.size, model.chartBlock.margin, options.scale.key);

        this.renderCharts(engine.block,
            options.charts,
            scales,
            engine.data,
            options.data,
            model.chartBlock.margin,
            options.axis.key.orient,
            model.chartSettings.bar,
            model.blockCanvas.size);

        engine.block.filterEventManager.registerEventFor2D(scales.key, model.chartBlock.margin, model.blockCanvas.size, options);
        engine.block.filterEventManager.event2DUpdate(options);

        Title.render(engine.block,
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.render(engine.block, engine.data, options, model);

        Tooltip.render(engine.block, model, engine.data, model.otherComponents.tooltipBlock, scales);

        if (model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(engine.block, model.dataSettings.scope.hidedRecordsAmount, 'top', options.orient);
    }

    public static updateData(block: Block, model: Model, data: DataSource) {
        block.transitionManager.interruptTransitions();
        block.filterEventManager.updateData(data[model.options.data.dataSource]);
        TipBox.clearEvents(block);
        Tooltip.hide(block);

        const options = <TwoDimensionalOptionsModel>model.options;

        ElementHighlighter.remove2DChartsFullHighlighting(block, options.charts);

        const scales = Scale.getScales(options.scale.key,
            options.scale.value,
            model.chartSettings.bar);

        const keyDomainEquality = Helper.checkDomainsEquality(block.scales.key.domain(), scales.key.domain());
        block.scales = scales;
        Axis.update(block, scales, options.scale, options.axis, model.blockCanvas.size, keyDomainEquality);

        GridLine.update(block,
            options.additionalElements.gridLine.flag,
            options.axis,
            model.blockCanvas.size,
            model.chartBlock.margin,
            options.scale.key);

        const promises = this.updateCharts(block,
            options.charts,
            scales,
            data,
            model.options.data,
            model.chartBlock.margin,
            options.axis.key.orient,
            model.blockCanvas.size,
            model.chartSettings.bar);

        Promise.all(promises)
            .then(() => {
                block.filterEventManager.event2DUpdate(options);
                block.filterEventManager.registerEventFor2D(scales.key, model.chartBlock.margin, model.blockCanvas.size, options);
                Tooltip.render(block, model, data, model.otherComponents.tooltipBlock, scales);
            });

        RecordOverflowAlert.update(block, model.dataSettings.scope.hidedRecordsAmount, 'top', options.orient);
    }

    public static updateColors(block: Block, model: Model): void {
        Legend.updateColors(block, model.options);
        (<TwoDimensionalOptionsModel>model.options).charts.forEach(chart => {
            if (chart.type === 'bar')
                Bar.updateColors(block, chart);
            else if (chart.type === 'line')
                Line.updateColors(block, chart);
            else if (chart.type === 'area')
                Area.updateColors(block, chart);
        });
    }

    private static renderCharts(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, barSettings: BarChartSettings, blockSize: Size) {
        block.renderChartClipPath(margin, blockSize);
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

    private static updateCharts(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, blockSize: Size, barSettings: BarChartSettings): Promise<any>[] {
        block.updateChartClipPath(margin, blockSize);
        let promises: Promise<any>[] = [];
        charts.forEach((chart: TwoDimensionalChartModel) => {
            let proms: Promise<any>[];
            if (chart.type === 'bar') {
                proms = Bar.update(block,
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
                proms = Line.update(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart);
            }
            else if (chart.type === 'area') {
                proms = Area.update(block,
                    scales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    chart,
                    keyAxisOrient,
                    blockSize);
            }
            promises.push(...proms);
        });
        return promises;
    }
}