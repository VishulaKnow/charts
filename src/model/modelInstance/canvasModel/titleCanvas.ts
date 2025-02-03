import { BlockMargin, TitleBlockModel } from "../../model";

type TitleBlockCanvas = TitleBlockModel;

export class TitleCanvasModel {
    private model: TitleBlockCanvas;

    init(model: TitleBlockCanvas) {
        this.model = model;
    }

    getModel() {
        return this.model;
    }

    getAllNeededSpace() {
        return this.model.pad + this.model.size + this.model.margin.top + this.model.margin.bottom;
    }
}
