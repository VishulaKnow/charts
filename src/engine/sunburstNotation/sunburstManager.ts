import { MdtChartsDataSource } from "../../main";
import { Model, SunburstOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import { Engine } from "../engine";
import { Aggregator } from "../features/aggregator/aggregator";
import { Legend } from "../features/legend/legend";
import { Title } from "../features/title/title";
import { Tooltip } from "../features/tolltip/tooltip";
import { FilterEventManager, ChartClearSelectionOptions } from "../filterManager/filterEventManager";
import { Sunburst } from "./sunburst";

export class SunburstManager implements ChartContentManager {
	private sunburst = new Sunburst();

	render(engine: Engine, model: Model<SunburstOptionsModel>) {
		engine.block.svg.render(model.blockCanvas.size);

		Title.render(engine.block, model.options.title, model.otherComponents.titleBlock, model.blockCanvas.size);

		Aggregator.render(
			engine.block,
			model.options.slices[0].sizes.innerRadius,
			model.options.slices[0].sizes.translate,
			model.options.slices[0].sizes.thickness,
			model.options.aggregator
		);

		Legend.get().render(engine.block, model.options, model);

		this.sunburst.render(engine.block, model.options);

		Tooltip.render(engine.block, model);
	}

	updateData(block: Block, model: Model<SunburstOptionsModel>, newData: MdtChartsDataSource): void {
		block.transitionManager.interruptTransitions();
		block.removeMouseEvents();

		Title.updateData(block, model.options.title);

		Tooltip.hide(block);

		Aggregator.update(
			block,
			model.options.aggregator,
			model.options.slices[0].sizes.innerRadius,
			model.options.slices[0].sizes.translate
		);

		Legend.get().update(block, model);
	}

	updateColors(block: Block, model: Model): void {
		throw new Error("Method not implemented.");
	}

	clearSelection(filterEventManager: FilterEventManager, model: Model, options?: ChartClearSelectionOptions): void {
		throw new Error("Method not implemented.");
	}
}
