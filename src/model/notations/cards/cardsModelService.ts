import { MdtChartsCardsOptions } from "../../../config/config";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { CardsChangeService } from "./cardsChangeService";

export class CardsModelService {
    private changeService = new CardsChangeService();

    getCardsChangeModel(options: MdtChartsCardsOptions, modelInstance: ModelInstance) {
        const data = modelInstance.dataModel.repository.getFirstRow();
        return this.changeService.getChangeModel(data, options.change);
    }
}