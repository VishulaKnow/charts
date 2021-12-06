import { MdtChartsConfig } from "../../main";
import { CanvasModel } from "./canvasModel/canvasModel";

export class ModelInstance {
    static create(config: MdtChartsConfig) {
        const modelInstance = new ModelInstance();
        modelInstance.canvasModel.initBlockSize(config.canvas.size);
        return modelInstance;
    }

    canvasModel: CanvasModel;

    constructor() {
        this.canvasModel = new CanvasModel();
    }
}