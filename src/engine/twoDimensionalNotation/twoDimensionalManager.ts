import { MdtChartsDataSource, Size } from "../../config/config";
import { BlockMargin, Model, OptionsModelData, Orient, TwoDimChartElementsSettings, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import { ElementHighlighter } from "../elementHighlighter/elementHighlighter";
import { Engine } from "../engine";
import { Axis } from "../features/axis/axis";
import { EmbeddedLabels } from "../features/embeddedLabels/embeddedLabels";
import { GridLine } from "../features/gridLine/gridLine";
import { Legend } from "../features/legend/legend";
import { Scale, Scales, ScalesWithSecondary } from "../features/scale/scale";
import { TipBox } from "../features/tipBox/tipBox";
import { Title } from "../features/title/title";
import { Tooltip } from "../features/tolltip/tooltip";
import { Helper } from "../helpers/helper";
import { Area } from "./area/area";
import { Bar } from "./bar/bar";
import { BarHelper } from "./bar/barHelper";
import { TwoDimRecordOverflowAlert } from "./extenders/twoDimRecordOverflowAlert";
import { Line } from "./line/line";
import { CanvasValueLabels } from "../../engine/features/valueLabels/valueLabels";
import { LinearGradientDef } from "../../engine/block/defs/LinearGradientDef";
import { CanvasDotChart } from "./dot/dotChart";
import { FilterEventManager } from "../filterManager/filterEventManager";


export class TwoDimensionalManager implements ChartContentManager {
    private canvasValueLabels?: CanvasValueLabels;
    private linearGradientDef?: LinearGradientDef;
    private dotChart: CanvasDotChart;

    public render(engine: Engine, model: Model<TwoDimensionalOptionsModel>): void {
        const options = model.options;

        const scales = Scale.getScalesWithSecondary(options.scale.key,
            options.scale.value,
            options.scale.valueSecondary,
            options.chartSettings.bar);
        engine.block.scales = scales;

        engine.block.svg.render(model.blockCanvas.size);

        Axis.render(engine.block, scales, options.scale, options.axis, model.blockCanvas.size);

        GridLine.render(engine.block, options.additionalElements.gridLine, options.axis, model.blockCanvas.size, model.chartBlock.margin, scales);

        this.dotChart = new CanvasDotChart({
            elementAccessors: {
                getBlock: () => engine.block,
            },
            canvas: {
                keyAxisOrient: options.axis.key.orient,
            },
            dataOptions: {
                keyFieldName: options.data.keyField.name
            },
            bandOptions: {
                settings: options.chartSettings.bar
            }
        });

        this.renderCharts(engine.block,
            options.charts,
            scales,
            engine.data,
            options.data,
            model.chartBlock.margin,
            options.axis.key.orient,
            options.chartSettings,
            model.blockCanvas.size);

        Axis.raiseKeyAxis(engine.block, options.axis.key);

        engine.block.filterEventManager.registerEventFor2D(scales.key, model.chartBlock.margin, model.blockCanvas.size, options);
        engine.block.filterEventManager.event2DUpdate(options);

        Title.render(engine.block,
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.get().render(engine.block, engine.data, options, model);

        Tooltip.render(engine.block, model, engine.data, model.otherComponents.tooltipBlock, scales);

        if (model.dataSettings.scope.hidedRecordsAmount !== 0)
            TwoDimRecordOverflowAlert.render(engine.block, {
                hidedRecordsAmount: model.dataSettings.scope.hidedRecordsAmount,
                chartOrientation: options.orient
            });

        engine.block.getSvg()
            .on('click', (e: MouseEvent) => {
                if (e.target === engine.block.getSvg().node())
                    this.clearSelection(engine.block.filterEventManager, model);
            });

        this.canvasValueLabels = new CanvasValueLabels({
            elementAccessors: {
                getBlock: () => engine.block,
            },
            data: {
                keyFieldName: options.data.keyField.name
            },
            canvas: {
                keyAxisOrient: options.axis.key.orient,
                valueLabels: options.valueLabels,
                style: options.valueLabels.style
            }
        });
        this.canvasValueLabels.render(scales, options.charts, engine.data, options.data);

        if (options.defs) {
            this.linearGradientDef = new LinearGradientDef();
            this.linearGradientDef.render(engine.block.svg.ensureDefsRendered(), options.defs.gradients);
        }
    }

    public updateData(block: Block, model: Model<TwoDimensionalOptionsModel>, data: MdtChartsDataSource) {
        block.transitionManager.interruptTransitions();
        block.filterEventManager.updateData(data[model.options.data.dataSource]);
        Title.updateData(block, model.options.title);
        TipBox.clearEvents(block);
        Tooltip.hide(block);

        const options = <TwoDimensionalOptionsModel>model.options;

        ElementHighlighter.remove2DChartsFullHighlighting(block, options.charts);

        const scales = Scale.getScalesWithSecondary(options.scale.key,
            options.scale.value,
            options.scale.valueSecondary,
            options.chartSettings.bar);

        const keyDomainEquality = Helper.checkDomainsEquality(block.scales.key.domain(), scales.key.domain());
        block.scales = scales;
        Axis.update(block, scales, options.scale, options.axis, model.blockCanvas.size, keyDomainEquality);

        GridLine.update(block,
            options.additionalElements.gridLine,
            options.axis,
            model.blockCanvas.size,
            model.chartBlock.margin,
            scales);

        const promises = this.updateCharts(block,
            options.charts,
            scales,
            data,
            model.options.data,
            model.chartBlock.margin,
            options.axis.key.orient,
            model.blockCanvas.size,
            options.chartSettings);

        Promise.all(promises)
            .then(() => {
                block.filterEventManager.event2DUpdate(options);
                block.filterEventManager.registerEventFor2D(scales.key, model.chartBlock.margin, model.blockCanvas.size, options);
                Tooltip.render(block, model, data, model.otherComponents.tooltipBlock, scales);
            });

        TwoDimRecordOverflowAlert.update(block, {
            hidedRecordsAmount: model.dataSettings.scope.hidedRecordsAmount,
            chartOrientation: options.orient
        });

        if (this.canvasValueLabels)
            this.canvasValueLabels.update(scales, options.charts, data, model.options.data);
    }

    public updateColors(block: Block, model: Model<TwoDimensionalOptionsModel>): void {
        Legend.get().updateColors(block, model.options);
        this.linearGradientDef?.updateColors(block.svg.ensureDefsRendered(), model.options.defs.gradients);

        model.options.charts.forEach(chart => {
            if (chart.type === 'bar')
                Bar.get().updateColors(block, chart);
            else if (chart.type === 'line')
                Line.get({ staticSettings: model.options.chartSettings.lineLike }).updateColors(block, chart);
            else if (chart.type === 'area')
                Area.get({ staticSettings: model.options.chartSettings.lineLike }).updateColors(block, chart);
        });
    }

    public clearSelection(filterEventManager: FilterEventManager, model: Model<TwoDimensionalOptionsModel>): void {
        filterEventManager.clearKeysFor2D(model.options);
    }

    private renderCharts(block: Block, charts: TwoDimensionalChartModel[], scales: ScalesWithSecondary, data: MdtChartsDataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, chartSettings: TwoDimChartElementsSettings, blockSize: Size) {
        block.svg.renderChartClipPath(margin, blockSize);
        block.svg.renderBarHatchPattern();
        block.svg.renderChartsBlock();
        charts.forEach((chart: TwoDimensionalChartModel) => {
            const chartScales: Scales = { key: scales.key, value: chart.data.valueGroup === "secondary" ? scales.valueSecondary : scales.value };

            if (chart.type === 'bar')
                Bar.get().render(block,
                    chartScales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize,
                    chartSettings.bar,
                    BarHelper.getBarsInGroupAmount(charts),
                    charts.findIndex(ch => ch.type === 'bar'));
            else if (chart.type === 'line')
                Line.get({ staticSettings: chartSettings.lineLike }).render(block,
                    chartScales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart);
            else if (chart.type === 'area')
                Area.get({ staticSettings: chartSettings.lineLike }).render(block,
                    chartScales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient, chart);
            else if (chart.type === 'dot')
                this.dotChart.render(chartScales, chart, data[dataOptions.dataSource], margin);
        });
        EmbeddedLabels.raiseGroups(block);
    }

    private updateCharts(block: Block, charts: TwoDimensionalChartModel[], scales: ScalesWithSecondary, data: MdtChartsDataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, blockSize: Size, chartSettings: TwoDimChartElementsSettings): Promise<any>[] {
        block.svg.updateChartClipPath(margin, blockSize);
        let promises: Promise<any>[] = [];
        charts.forEach((chart: TwoDimensionalChartModel) => {
            const chartScales: Scales = { key: scales.key, value: chart.data.valueGroup === "secondary" ? scales.valueSecondary : scales.value };

            let proms: Promise<any>[];
            if (chart.type === 'bar') {
                proms = Bar.get().update(block,
                    data[dataOptions.dataSource],
                    chartScales,
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize,
                    BarHelper.getBarsInGroupAmount(charts),
                    dataOptions.keyField,
                    charts.findIndex(ch => ch.type === 'bar'),
                    chartSettings.bar);
            } else if (chart.type === 'line') {
                proms = Line.get({ staticSettings: chartSettings.lineLike }).update(block,
                    chartScales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    keyAxisOrient,
                    chart);
            }
            else if (chart.type === 'area') {
                proms = Area.get({ staticSettings: chartSettings.lineLike }).update(block,
                    chartScales,
                    data[dataOptions.dataSource],
                    dataOptions.keyField,
                    margin,
                    chart,
                    keyAxisOrient);
            }
            else if (chart.type === 'dot') {
                proms = this.dotChart.update(chartScales, data[dataOptions.dataSource], margin);
            }
            promises.push(...proms);
        });
        return promises;
    }
}