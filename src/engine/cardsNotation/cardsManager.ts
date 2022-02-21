import { MdtChartsDataSource } from "../../config/config";
import { CardsOptionsModel, Model } from "../../model/model";
import { Block } from "../block/block";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import engine from "../engine";

export class CardsManager implements ChartContentManager {
    render(engine: engine, model: Model<CardsOptionsModel>): void {

    }

    updateData(block: Block, model: Model<CardsOptionsModel>, newData: MdtChartsDataSource): void {
        //TODO: implement
    }

    updateColors(block: Block, model: Model<CardsOptionsModel>): void {
        //TODO: implement
    }
}