import { BlockMargin, DataSource, DonutChartSettings, Model, PolarChartModel, PolarOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import Engine from "../engine";
import { Legend } from "../features/legend/legend";
import { RecordOverflowAlert } from "../features/recordOverflowAlert/recordOverflowAlert";
import { Title } from "../features/title/title";
import { ElementHighlighter } from "../elementHighlighter/elementHighlighter";
import { Tooltip } from "../features/tolltip/tooltip";
import { Aggregator } from "./aggregator";
import { Donut } from "./donut/donut";
import { Size } from "../../config/config";

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

        Legend.render(engine.block, engine.data, options, model);

        Tooltip.render(engine.block, model, engine.data);

        engine.block.filterEventManager.setListenerPolar(model.chartBlock.margin, model.blockCanvas.size, options, model.chartSettings.donut);

        if (model.dataSettings.scope.hidedRecordsAmount !== 0 && model.options.legend.position !== 'off')
            RecordOverflowAlert.render(engine.block, model.dataSettings.scope.hidedRecordsAmount, model.options.legend.position);
    }

    public static updateData(block: Block, model: Model, data: DataSource): void {
        block.transitionManager.interruptTransitions();
        block.removeMouseEvents();
        block.filterEventManager.updateData(data[model.options.data.dataSource]);
        ElementHighlighter.removeDonutArcClones(block);

        ElementHighlighter.removeFilter(Donut.getAllArcGroups(block));
        Tooltip.hide(block);

        const options = <PolarOptionsModel>model.options;

        Donut.updateValues(block, data[options.data.dataSource], model.chartBlock.margin, options.charts[0], model.blockCanvas.size, model.chartSettings.donut, options.data.keyField.name)
            .then(() => {
                Tooltip.render(block, model, data);
                block.filterEventManager.setListenerPolar(model.chartBlock.margin, model.blockCanvas.size, options, model.chartSettings.donut);
            });

        Aggregator.update(block, data[options.data.dataSource], options.charts[0].data.valueField, model.chartSettings.donut.aggregatorPad);

        Legend.update(block, data, model.options);

        if (model.options.legend.position !== 'off')
            RecordOverflowAlert.update(block, model.dataSettings.scope.hidedRecordsAmount, model.options.legend.position);
    }

    private static renderCharts(block: Block, charts: PolarChartModel[], data: DataSource, dataSource: string, margin: BlockMargin, blockSize: Size, donutSettings: DonutChartSettings) {
        //TODO: подумать над заменой charts у polar с массива на один объект
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