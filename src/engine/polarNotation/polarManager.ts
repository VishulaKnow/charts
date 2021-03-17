import { BlockMargin, DataSource, DonutChartSettings, Model, PolarChartModel, PolarOptionsModel, Size } from "../../model/model";
import { Block } from "../block/block";
import Engine from "../engine";
import { Legend } from "../features/legend/legend";
import { RecordOverflowAlert } from "../features/recordOverflowAlert/recordOverflowAlert";
import { Title } from "../features/title/title";
import { ElementHighlighter } from "../elementHighlighter";
import { Tooltip } from "../features/tolltip/tooltip";
import { Aggregator } from "./aggregator";
import { Donut } from "./donut/donut";
import { Scale } from "../features/scale/scale";

export class PolarManager {
    public static render(engine: Engine, model: Model) {
        const options = <PolarOptionsModel>model.options;

        engine.block.renderSvg(model.blockCanvas.size);

        // const scales = Scale.getScales(options.scale.scaleKey,
        //     options.scale.scaleValue,
        //     model.chartSettings.bar);
        // engine.block.scales = scales;

        this.renderCharts(engine.block,
            options.charts,
            engine.data,
            options.data.dataSource,
            model.chartBlock.margin,
            model.blockCanvas.size,
            model.chartSettings.donut);

        engine.block.filterEventManager.registerEvents(model, options, null, model.chartBlock.margin, model.blockCanvas.size);

        Title.render(engine.block,
            options.title,
            model.otherComponents.titleBlock,
            model.blockCanvas.size);

        Legend.render(engine.block, engine.data, options, model.otherComponents.legendBlock, model.blockCanvas.size);

        Tooltip.render(engine.block, model, engine.data);

        if (model.dataSettings.scope.hidedRecordsAmount !== 0 && model.options.legend.position !== 'off')
            RecordOverflowAlert.render(engine.block, model.dataSettings.scope.hidedRecordsAmount, model.options.legend.position);
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

    public static updateData(block: Block, model: Model, data: DataSource): void {
        block.transitionManager.interruptTransitions();
        block.removeEventListeners();

        ElementHighlighter.removeElementsFilter(Donut.getAllArcGroups(block));
        Tooltip.hide(block);

        const options = <PolarOptionsModel>model.options;

        Donut.updateValues(block, data[options.data.dataSource], model.chartBlock.margin, options.charts[0], model.blockCanvas.size, model.chartSettings.donut, options.data.keyField.name)
            .then(() => Tooltip.render(block, model, data));

        Aggregator.update(block, data[options.data.dataSource], options.charts[0].data.valueField);

        Legend.update(block, data, model.options);

        if (model.options.legend.position !== 'off')
            RecordOverflowAlert.update(block, model.dataSettings.scope.hidedRecordsAmount, model.options.legend.position);
    }
}