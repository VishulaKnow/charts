import { MdtChartsDataSource } from "../../config/config";
import { CardsOptionsModel, Model } from "../../model/model";
import { Block } from "../block/block";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import engine from "../engine";
import { CardChart } from "./card/card";

export class CardsManager implements ChartContentManager {
    render(engine: engine, model: Model<CardsOptionsModel>): void {
        engine.block.html.render();

        const cardChart = new CardChart();
        cardChart.render(engine.block, model.options);
    }

    updateData(block: Block, model: Model<CardsOptionsModel>, newData: MdtChartsDataSource): void {
        //TODO: implement
    }

    updateColors(block: Block, model: Model<CardsOptionsModel>): void {
        //TODO: implement
    }
}