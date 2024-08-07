import { ChartNotation, MdtChartsDataSource } from "../../config/config";
import { Model } from "../../model/model";
import { Block } from "../block/block";
import { Engine } from "../engine";
import { PolarManager } from "../polarNotation/polarManager";
import { TwoDimensionalManager } from "../twoDimensionalNotation/twoDimensionalManager";

export interface ChartContentManager {
    render(engine: Engine, model: Model): void;
    updateData(block: Block, model: Model, newData: MdtChartsDataSource): void;
    updateColors(block: Block, model: Model): void;
}

interface Managers {
    [type: string]: {
        new(): ChartContentManager
    }
}

export class ContentManagerFactory {
    private managers: Managers = {
        "2d": TwoDimensionalManager,
        "polar": PolarManager
    };

    getManager(type: ChartNotation): ChartContentManager {
        const managerClass = this.managers[type];
        return new managerClass();
    }
}

export function getChartContentManager(model: Model): ChartContentManager {
    const factory = new ContentManagerFactory();
    return factory.getManager(model.options.type);
}