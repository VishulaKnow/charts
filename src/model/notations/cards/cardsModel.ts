import { MdtChartsCardsOptions } from "../../../config/config";
import { CardsOptionsModel } from "../../model";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { CardsModelService } from "./cardsModelService";

export class CardsModel {
    private service = new CardsModelService();

    getOptions(options: MdtChartsCardsOptions, modelInstance: ModelInstance): CardsOptionsModel {
        return {
            type: "card",
            title: options.title,
            description: options.description,
            data: options.data,
            tooltip: options.tooltip,
            icon: options.icon,
            color: this.service.getCardColor(options, modelInstance),
            value: {
                ...options.value
            },
            change: this.service.getCardsChangeModel(options, modelInstance)
        }
    }
}

export const CardsModelInstance = new CardsModel();