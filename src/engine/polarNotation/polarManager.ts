import { BlockMargin, DonutChartSettings, Model, PolarChartModel, PolarOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import Engine from "../engine";
import { Legend } from "../features/legend/legend";
import { RecordOverflowAlert } from "../features/recordOverflowAlert/recordOverflowAlert";
import { Title } from "../features/title/title";
import { ElementHighlighter } from "../elementHighlighter/elementHighlighter";
import { Tooltip } from "../features/tolltip/tooltip";
import { Aggregator } from "../features/aggregator/aggregator";
import { Donut } from "./donut/donut";
import { DataSource, PolarOptions, Size } from "../../config/config";

export class PolarManager {
    public static render(engine: Engine, model: Model) {
        const options = <PolarOptionsModel>model.options;

        engine.block.renderSvg(model.blockCanvas.size);

        this.renderCharts(engine.block,
            options.charts,
            engine.data,
            options.data.dataSource,
            model.chartBlock.margin,
            model.blockCanvas.size,
            model.chartSettings.donut);

        Title.render(engine.block,
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.render(engine.block, engine.data, options, model); ``
        Tooltip.render(engine.block, model, engine.data, model.otherComponents.tooltipBlock);

        engine.block.filterEventManager.setListenerPolar(model.chartBlock.margin, model.blockCanvas.size, options, model.chartSettings.donut);

        if (model.dataSettings.scope.hidedRecordsAmount !== 0 && model.options.legend.position !== 'off')
            RecordOverflowAlert.render(engine.block, model.dataSettings.scope.hidedRecordsAmount, model.options.legend.position);
    }

    public static update(block: Block, model: Model, data: DataSource): void {
        block.transitionManager.interruptTransitions();
        block.removeMouseEvents();
        block.filterEventManager.updateData(data[model.options.data.dataSource]);
        ElementHighlighter.removeDonutArcClones(block);

        ElementHighlighter.removeFilter(Donut.getAllArcGroups(block));
        ElementHighlighter.toggleActivityStyle(Donut.getAllArcGroups(block), true);
        Tooltip.hide(block);

        const options = <PolarOptionsModel>model.options;

        Donut.update(block, data[options.data.dataSource], model.chartBlock.margin, options.charts[0], model.blockCanvas.size, model.chartSettings.donut, options.data.keyField.name)
            .then(() => {
                Tooltip.render(block, model, data, model.otherComponents.tooltipBlock);
                block.filterEventManager.setListenerPolar(model.chartBlock.margin, model.blockCanvas.size, options, model.chartSettings.donut);
            });

        Aggregator.update(block, data[options.data.dataSource], options.charts[0].data.valueField, model.chartSettings.donut.aggregatorPad);

        Legend.update(block, data, model.options);

        if (model.options.legend.position !== 'off')
            RecordOverflowAlert.update(block, model.dataSettings.scope.hidedRecordsAmount, model.options.legend.position);
    }

    public static updateColors(block: Block, model: Model): void {
        Legend.updateColors(block, model.options);
        Donut.updateColors(block, (<PolarOptionsModel>model.options).charts[0]);
    }

    private static renderCharts(block: Block, charts: PolarChartModel[], data: DataSource, dataSource: string, margin: BlockMargin, blockSize: Size, donutSettings: DonutChartSettings) {
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
}