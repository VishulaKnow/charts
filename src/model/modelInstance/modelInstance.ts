import { DataOptions, MdtChartsConfig, MdtChartsDataSource } from "../../config/config";
import { DesignerConfig } from "../../designer/designerConfig";
import { CanvasModel } from "./canvasModel/canvasModel";
import { getConfigReader } from "./configReader";
import { DataModelInstance } from "./dataModel/dataModel";

export class ModelInstance {
    static create(config: MdtChartsConfig, data: MdtChartsDataSource, designerConfig: DesignerConfig) {
        const modelInstance = new ModelInstance();
        this.initInitialParams(modelInstance, config, data, designerConfig);
        return modelInstance;
    }

    private static initInitialParams(modelInstance: ModelInstance, config: MdtChartsConfig, data: MdtChartsDataSource, designerConfig: DesignerConfig) {
        const configReader = getConfigReader(config, designerConfig);

        modelInstance.canvasModel.initBlockSize(config.canvas.size);

        modelInstance.dataModel.repository.initOptions(config.options.data as DataOptions, configReader.getValueFields());
        modelInstance.dataModel.repository.initRawFullSource(data);
    }

    canvasModel: CanvasModel;
    dataModel: DataModelInstance;

    constructor() {
        this.canvasModel = new CanvasModel();
        this.dataModel = new DataModelInstance();
    }
}