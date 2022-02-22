import { MdtChartsDataSource } from "../../config/config";
import { CardsOptionsModel, Model } from "../../model/model";
import { Block } from "../block/block";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import { Engine } from "../engine";
import { CardChart } from "./card/card";

export class CardsManager implements ChartContentManager {
    render(engine: Engine, model: Model<CardsOptionsModel>): void {
        engine.block.html.render();

        const cardChart = new CardChart();
        cardChart.render(engine.block, model.options, engine.data, { cardSize: model.blockCanvas.size });
    }

    updateData(block: Block, model: Model<CardsOptionsModel>, newData: MdtChartsDataSource): void {
        const cardChart = new CardChart();
        cardChart.updateData(block, model.options, newData);
    }

    updateColors(block: Block, model: Model<CardsOptionsModel>): void {
        //TODO: implement
    }
}