import { Model } from "../../model/model";
import { Engine } from "../engine";
import { Block } from "../block/block";
import { MdtChartsDataSource } from "../../config/config";
import { ChartContentManager, getChartContentManager } from "./contentManagerFactory";
import { ChartClearSelectionOptions } from "../filterManager/filterEventManager";

export class ContentManager {
	private manager: ChartContentManager;

	constructor(model: Model) {
		this.manager = getChartContentManager(model);
	}

	public render(model: Model, engine: Engine): void {
		this.manager.render(engine, model);
	}

	public updateData(block: Block, model: Model, newData: MdtChartsDataSource): void {
		this.manager.updateData(block, model, newData);
	}

	public updateColors(engine: Engine, model: Model): void {
		this.manager.updateColors(engine.block, model);
	}

	public clearSelection(engine: Engine, model: Model, options?: ChartClearSelectionOptions): void {
		this.manager.clearSelection(engine.block.filterEventManager, model, options);
	}
}
