import { MdtChartsCardsOptions, MdtChartsDataSource } from "../../../config/config";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { DataManagerModel } from "../dataManagerModel";

export class CardsDataManagerModel {
    initDataScope(modelInstance: ModelInstance, data: MdtChartsDataSource, configOptions: MdtChartsCardsOptions) {
        const firstKey = DataManagerModel.getDataValuesByKeyField(data, configOptions.data.dataSource, configOptions.data.keyField.name)[0];
        modelInstance.dataModel.initScope({
            allowableKeys: [firstKey],
            hidedRecordsAmount: 0
        });
    }
}