import { TooltipOptions } from "../../designer/designerConfig";

export class TooltipModel {
    public static getTooltipModel(options: TooltipOptions): TooltipOptions {
        return {
            position: options?.position || 'followCursor'
        }
    }
}