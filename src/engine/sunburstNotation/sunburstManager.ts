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
import { SunburstSegmentEventDispatcher } from "./sunburstSegmentEventDispatcher";

export class SunburstManager implements ChartContentManager {
	private sunburst: Sunburst | undefined = undefined;
	private readonly sunburstSegmentEventDispatcher = new SunburstSegmentEventDispatcher();

	render(engine: Engine, model: Model<SunburstOptionsModel>) {
		engine.block.svg.render(model.blockCanvas.size);

		Title.render(engine.block, model.options.title, model.otherComponents.titleBlock, model.blockCanvas.size);

		Aggregator.render(
			engine.block,
			model.options.levels[0].sizes.innerRadius,
			model.options.levels[0].sizes.translate,
			model.options.levels[0].sizes.thickness,
			model.options.aggregator
		);

		Legend.get().render(engine.block, model.options, model);

		this.sunburst = new Sunburst(engine.block);
		const allSegmentsSelection = this.sunburst.render(model.options.levels);
		this.sunburstSegmentEventDispatcher.bind(allSegmentsSelection);

		Tooltip.renderTooltipForSunburst(engine.block, this.sunburstSegmentEventDispatcher);
	}

	updateData(block: Block, model: Model<SunburstOptionsModel>, newData: MdtChartsDataSource): void {
		if (!this.sunburst) throw new Error("Sunburst not initialized");

		block.transitionManager.interruptTransitions();
		this.sunburstSegmentEventDispatcher.clearEventListeners();
		Tooltip.hide(block);

		Title.updateData(block, model.options.title);

		this.sunburst.update(model.options.levels).then((allSegmentsSelection) => {
			this.sunburstSegmentEventDispatcher.bind(allSegmentsSelection);
		});

		Aggregator.update(
			block,
			model.options.aggregator,
			model.options.levels[0].sizes.innerRadius,
			model.options.levels[0].sizes.translate
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
