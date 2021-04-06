import { TooltipSettings } from "../../designer/designerConfig";

export class TooltipModel {
    public static getTooltipModel(options: TooltipSettings): TooltipSettings {
        return {
            position: options?.position || 'followCursor'
        }
    }
}