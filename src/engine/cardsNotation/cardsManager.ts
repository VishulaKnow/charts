import { MdtChartsDataSource } from "../../config/config";
import { CardsOptionsModel, Model } from "../../model/model";
import { Block } from "../block/block";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import { Engine } from "../engine";
import { CardChart } from "./card/card";

export class CardsManager implements ChartContentManager {
    private chart: CardChart;

    render(engine: Engine, model: Model<CardsOptionsModel>): void {
        engine.block.html.render();
        this.chart = new CardChart();

        this.chart.render(engine.block, model.options, engine.data, { cardSize: model.blockCanvas.size });
    }

    updateData(block: Block, model: Model<CardsOptionsModel>, newData: MdtChartsDataSource): void {
        this.chart.updateData(model.options, newData);
    }

    updateColors(block: Block, model: Model<CardsOptionsModel>): void {
        //TODO: implement
    }
}