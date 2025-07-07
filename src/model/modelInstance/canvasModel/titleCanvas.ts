import { TitleBlockModel } from "../../model";
import { TitleConfigReader } from "../titleConfigReader";

type TitleBlockCanvas = TitleBlockModel;

export class TitleCanvasModel {
	private inited = false;
	private model: TitleBlockCanvas;

	init(titleConfig: TitleConfigReader) {
		const defaultPads = titleConfig.getFontSize();
		const pad = titleConfig.getTextContent() ? defaultPads : 0;
		this.model = {
			margin: {
				bottom: 5,
				left: 0,
				right: 0,
				top: 0
			},
			size: pad,
			pad: 0
		};
		this.inited = true;
	}

	getModel() {
		if (!this.inited) throw new Error("TitleCanvasModel is not initialized");
		return this.model;
	}

	getAllNeededSpace() {
		if (!this.inited) throw new Error("TitleCanvasModel is not initialized");
		return this.model.pad + this.model.size + this.model.margin.top + this.model.margin.bottom;
	}
}
