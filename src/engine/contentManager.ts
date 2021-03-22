import { DataSource, Model } from "../model/model";
import { TwoDimensionalManager } from "./twoDimensionalNotation/twoDimensionalManager";
import { PolarManager } from "./polarNotation/polarManager";
import { IntervalManager } from "./intervalNotation/intervalManager";
import Engine from "./engine";
import { Block } from "./block/block";

export class ContentManager {
    public static render(model: Model, data: DataSource, engine: Engine): void {
        if (model.options.type === '2d')
            TwoDimensionalManager.render(engine, model);
        else if (model.options.type === 'polar')
            PolarManager.render(engine, model);
        else if (model.options.type === 'interval')
            IntervalManager.render(engine.block, model, data);
    }

    public static updateData(block: Block, model: Model, newData: DataSource): void {
        if (model.options.type === '2d') {
            TwoDimensionalManager.updateData(block, model, newData);
        } else if (model.options.type === 'polar') {
            PolarManager.updateData(block, model, newData);
        }
    }
}