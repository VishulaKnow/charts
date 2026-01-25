import { MdtChartsDataSource } from "../../main";
import { Model, SunburstOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import { Engine } from "../engine";
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

		Legend.get().render(engine.block, model.options, model);

		this.sunburst.render(engine.block, model.options);

		Tooltip.render(engine.block, model);
	}

	updateData(block: Block, model: Model, newData: MdtChartsDataSource): void {
		throw new Error("Method not implemented.");
	}

	updateColors(block: Block, model: Model): void {
		throw new Error("Method not implemented.");
	}

	clearSelection(filterEventManager: FilterEventManager, model: Model, options?: ChartClearSelectionOptions): void {
		throw new Error("Method not implemented.");
	}
}
