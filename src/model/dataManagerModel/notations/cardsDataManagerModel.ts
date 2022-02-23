import { MdtChartsCardsOptions, MdtChartsDataSource } from "../../../config/config";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { DataManagerModel } from "../dataManagerModel";

export class CardsDataManagerModel {
    initDataScope(modelInstance: ModelInstance) {
        modelInstance.dataModel.initScope({
            allowableKeys: [],
            hidedRecordsAmount: 0
        });
    }
}