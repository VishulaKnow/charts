import { TooltipSettings } from "../../../designer/designerConfig";

export class TooltipCanvasModel {
	public static getCanvasModel(options: TooltipSettings): TooltipSettings {
		return {
			position: options?.position || "followCursor"
		};
	}
}
