import { ILegendModel, LegendPosition } from "../../model";

export class LegendCanvasModelInstance {
	private position: LegendPosition;
	private size: number;
	private pad: number;

	private sizeAndPadInited = false;

	getModel(): ILegendModel {
		return {
			position: this.position
		};
	}

	initSizeAndPad(size: number, pad: number) {
		this.size = size;
		this.pad = pad;
		this.sizeAndPadInited = true;
	}

	getPosition() {
		return this.position;
	}

	setPosition(position: LegendPosition) {
		this.position = position;
	}

	getAllNeededSpace() {
		if (!this.sizeAndPadInited) return 0;
		return this.size + this.pad;
	}
}
