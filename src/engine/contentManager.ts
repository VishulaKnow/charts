import { DataSource, Model } from "../model/model";
import { TwoDimensionalManager } from "./twoDimensionalNotation/twoDimensionalManager";
import { PolarManager } from "./polarNotation/polarManager";
import { IntervalManager } from "./intervalNotation/intervalManager";
import { Engine } from "../main";
import { Block } from "./block/block";

export class ContentManager {
    public static render(model: Model, data: DataSource, engine: Engine): void {
        if (model.options.type === '2d')
            TwoDimensionalManager.render2D(engine, model);
        else if (model.options.type === 'polar')
            PolarManager.renderPolar(engine, model);
        else if (model.options.type === 'interval')
            IntervalManager.renderInterval(engine.block, model, data);
    }

    public static updateData(block: Block, model: Model, newData: DataSource): void {
        if (model.options.type === '2d') {
            TwoDimensionalManager.updateDataFor2D(block, model, newData);
        } else if (model.options.type === 'polar') {
            PolarManager.updateDataForPolar(block, model, newData);
        }
    }
}