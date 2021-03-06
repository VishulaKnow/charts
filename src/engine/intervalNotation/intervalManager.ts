import { Model, IntervalOptionsModel, IntervalChartModel, OptionsModelData, BlockMargin, Orient, ChartElementsSettings, DataSource } from "../../model/model";
import { Block } from "../block/block";
import { Axis } from "../features/axis/axis";
import { GridLine } from "../features/gridLine/gridLine";
import { Legend } from "../features/legend/legend";
import { RecordOverflowAlert } from "../features/recordOverflowAlert/recordOverflowAlert";
import { Scale, Scales } from "../features/scale/scale";
import { Title } from "../features/title/title";
import { Tooltip } from "../features/tolltip/tooltip";
import { Gantt } from "./gantt";

export class IntervalManager {
    public static render(block: Block, model: Model, data: DataSource): void {
        const options = <IntervalOptionsModel>model.options;

        block.renderSvg(model.blockCanvas.size);

        const scales = Scale.getScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar);

        Axis.render(block, scales, options.scale, options.axis, model.chartBlock.margin, model.blockCanvas.size);

        GridLine.render(block, options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin, options.scale.scaleKey);

        this.renderCharts(block,
            options.charts,
            scales,
            data,
            options.data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.chartSettings);

        Title.render(block,
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.render(block, data, options, model.otherComponents.legendBlock, model.blockCanvas.size);

        Tooltip.render(block, model, data);

        if (model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount, 'top', options.orient);
    }

    private static renderCharts(block: Block, charts: IntervalChartModel[], scales: Scales, data: DataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, chartSettings: ChartElementsSettings): void {
        block.renderChartsBlock();
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
}