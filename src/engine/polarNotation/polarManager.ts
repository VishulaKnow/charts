import { DonutChartSettings, Model, DonutChartModel, PolarOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { Engine } from "../engine";
import { Legend } from "../features/legend/legend";
import { Title } from "../features/title/title";
import { ElementHighlighter } from "../elementHighlighter/elementHighlighter";
import { Tooltip } from "../features/tolltip/tooltip";
import { Donut } from "./donut/donut";
import { MdtChartsDataSource } from "../../config/config";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import { ChartClearSelectionOptions, FilterEventManager } from "../filterManager/filterEventManager";
import { RecordOverflowAlertCore } from "../features/recordOverflowAlert/recordOverflowAlertCore";

export class PolarManager implements ChartContentManager {
	public render(engine: Engine, model: Model<PolarOptionsModel>) {
		const options = model.options;

		engine.block.svg.render(model.blockCanvas.size);

		this.renderCharts(engine.block, options.charts, engine.data, options.data.dataSource, options.chartCanvas);

		Title.render(engine.block, options.title, model.otherComponents.titleBlock, model.blockCanvas.size);

		Legend.get().render(engine.block, engine.data, options, model);
		Tooltip.render(engine.block, model, model.otherComponents.tooltipBlock);

		engine.block.filterEventManager.setListenerPolar(model.chartBlock.margin, model.blockCanvas.size, options);

		if (model.dataSettings.scope.hidedRecordsAmount !== 0)
			RecordOverflowAlertCore.render(engine.block, options.recordOverflowAlert);

		engine.block.getSvg().on("click", (e: MouseEvent) => {
			if (e.target === engine.block.getSvg().node()) this.clearSelection(engine.block.filterEventManager, model);
		});
	}

	public updateData(block: Block, model: Model<PolarOptionsModel>, data: MdtChartsDataSource): void {
		block.transitionManager.interruptTransitions();
		block.removeMouseEvents();
		block.filterEventManager.updateData(data[model.options.data.dataSource]);
		Title.updateData(block, model.options.title);
		ElementHighlighter.removeDonutArcClones(block);

		ElementHighlighter.removeFilter(Donut.getAllArcGroups(block));
		ElementHighlighter.toggleActivityStyle(Donut.getAllArcGroups(block), true);
		Tooltip.hide(block);

		const options = <PolarOptionsModel>model.options;

		Donut.update(
			block,
			data[options.data.dataSource],
			options.charts[0],
			options.chartCanvas,
			options.data.keyField.name
		).then(() => {
			Tooltip.render(block, model, model.otherComponents.tooltipBlock);
			block.filterEventManager.setListenerPolar(model.chartBlock.margin, model.blockCanvas.size, options);
		});

		Legend.get().update(block, data, model);

		RecordOverflowAlertCore.update(block, options.recordOverflowAlert);
	}

	public updateColors(block: Block, model: Model<PolarOptionsModel>): void {
		Legend.get().updateColors(block, model.options);
		Donut.updateColors(block, (<PolarOptionsModel>model.options).charts[0]);
	}

	public clearSelection(
		filterEventManager: FilterEventManager,
		model: Model<PolarOptionsModel>,
		options?: ChartClearSelectionOptions
	): void {
		filterEventManager.clearKeysForPolar(model.chartBlock.margin, model.blockCanvas.size, model.options, options);
	}

	private renderCharts(
		block: Block,
		charts: DonutChartModel[],
		data: MdtChartsDataSource,
		dataSource: string,
		donutSettings: DonutChartSettings
	) {
		charts.forEach((chart: DonutChartModel) => {
			Donut.render(block, data[dataSource], chart, donutSettings);
		});
	}
}
