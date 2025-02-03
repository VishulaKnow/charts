import { ILegendModel, LegendPosition } from "../../model";

export class LegendCanvasModelInstance {
	private position: LegendPosition;

	getModel(): ILegendModel {
		return {
			position: this.position
		};
	}

	getPosition() {
		return this.position;
	}

	setPosition(position: LegendPosition) {
		this.position = position;
	}
}
