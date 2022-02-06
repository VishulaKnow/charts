import { Model } from "../../model/model";
import Engine from "../engine";
import { Block } from "../block/block";
import { MdtChartsDataSource } from "../../config/config";
import { getChartContentManager } from "./contentManagerFactory";

export class ContentManager {
    public static render(model: Model, engine: Engine): void {
        const manager = getChartContentManager(model);
        manager.render(engine, model);
    }

    public static updateData(block: Block, model: Model, newData: MdtChartsDataSource): void {
        const manager = getChartContentManager(model);
        manager.updateData(block, model, newData);
    }

    public static updateColors(engine: Engine, model: Model): void {
        const manager = getChartContentManager(model);
        manager.updateColors(engine.block, model);
    }
}