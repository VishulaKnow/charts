import { MdtChartsConfig, MdtChartsDataSource } from "../../config/config";
import { CanvasModel } from "./canvasModel/canvasModel";
import { DataModelInstance } from "./dataModel/dataModel";

export class ModelInstance {
    static create(config: MdtChartsConfig, data: MdtChartsDataSource) {
        const modelInstance = new ModelInstance();
        this.initInitialParams(modelInstance, config, data);
        return modelInstance;
    }

    private static initInitialParams(modelInstance: ModelInstance, config: MdtChartsConfig, data: MdtChartsDataSource) {
        modelInstance.canvasModel.initBlockSize(config.canvas.size);

        modelInstance.dataModel.repository.initSourceName(config.options.data.dataSource);
        modelInstance.dataModel.repository.initRawFullSource(data);
    }

    canvasModel: CanvasModel;
    dataModel: DataModelInstance;

    constructor() {
        this.canvasModel = new CanvasModel();
        this.dataModel = new DataModelInstance();
    }
}