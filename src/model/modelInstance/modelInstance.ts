import { CanvasModel } from "./canvasModel";

export class ModelInstance {
    public canvasModel: CanvasModel;

    constructor() {
        this.canvasModel = new CanvasModel();
    }
}