import { MdtChartsConfig } from "../../main";
import { CanvasModel } from "./canvasModel/canvasModel";
import { DataModelInstance } from "./dataModel";

export class ModelInstance {
    static create(config: MdtChartsConfig) {
        const modelInstance = new ModelInstance();
        this.initInitialParams(modelInstance, config);
        return modelInstance;
    }

    private static initInitialParams(modelInstance: ModelInstance, config: MdtChartsConfig) {
        modelInstance.canvasModel.initBlockSize(config.canvas.size);
        modelInstance.dataModel.initMaxRecordsAmount(config.options.data.maxRecordsAmount);
    }

    canvasModel: CanvasModel;
    dataModel: DataModelInstance;

    constructor() {
        this.canvasModel = new CanvasModel();
        this.dataModel = new DataModelInstance();
    }
}