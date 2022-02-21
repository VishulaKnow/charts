import { MdtChartsDataSource } from "../../config/config";
import { Model, IntervalOptionsModel, IntervalChartModel, OptionsModelData, BlockMargin, Orient, TwoDimChartElementsSettings } from "../../model/model";
import { Block } from "../block/block";
import { Axis } from "../features/axis/axis";
import { GridLine } from "../features/gridLine/gridLine";
import { Legend } from "../features/legend/legend";
import { Scale, Scales } from "../features/scale/scale";
import { Title } from "../features/title/title";
import { Gantt } from "./gantt";

export class IntervalManager {
    public static render(block: Block, model: Model, data: MdtChartsDataSource): void {
        const options = <IntervalOptionsModel>model.options;

        block.svg.render(model.blockCanvas.size);

        const scales = Scale.getScales(options.scale.key,
            options.scale.value,
            options.chartSettings.bar);

        Axis.render(block, scales, options.scale, options.axis, model.blockCanvas.size);

        GridLine.render(block, options.additionalElements.gridLine.flag, options.axis, model.blockCanvas.size, model.chartBlock.margin, scales);

        this.renderCharts(block,
            options.charts,
            scales,
            data,
            options.data,
            model.chartBlock.margin,
            options.axis.key.orient,
            options.chartSettings);

        Title.render(block,
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.render(block, data, options, model);
    }

    private static renderCharts(block: Block, charts: IntervalChartModel[], scales: Scales, data: MdtChartsDataSource, dataOptions: OptionsModelData, margin: BlockMargin, keyAxisOrient: Orient, chartSettings: TwoDimChartElementsSettings): void {
        block.svg.renderChartsBlock();
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