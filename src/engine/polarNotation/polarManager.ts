import { Model, PolarOptionsModel } from "../../model/model";
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

		Title.render(engine.block, options.title, model.otherComponents.titleBlock, model.blockCanvas.size);

		Donut.render(engine.block, engine.data[options.data.dataSource], options.charts[0], options.chartCanvas);

		Legend.get().render(engine.block, options, model);

		Tooltip.render(engine.block, model);

		engine.block.filterEventManager.setListenerPolar(options);

		if (model.dataSettings.scope.hiddenRecordsAmount !== 0)
			RecordOverflowAlertCore.render(engine.block, options.recordOverflowAlert);
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
			Tooltip.render(block, model);
			block.filterEventManager.setListenerPolar(options);
		});

		Legend.get().update(block, model);

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
		filterEventManager.clearKeysForPolar(model.options, options);
	}
}
