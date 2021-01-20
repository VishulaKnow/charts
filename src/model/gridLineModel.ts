import { IntervalOptions, TwoDimensionalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { GridLineOptions } from "./model";

export class GridLineModel
{
    public static getGridLineOptions(options: TwoDimensionalOptions | IntervalOptions, designerConfig: DesignerConfig): GridLineOptions {
        let gridKey: boolean = false;
        let gridValue: boolean = false;
        if(designerConfig.additionalElements.gridLine.flag.value)
            gridValue = options.additionalElements.gridLine.flag.value;
        if(designerConfig.additionalElements.gridLine.flag.key)
            gridKey = options.additionalElements.gridLine.flag.key;
        return {
            flag: {
                value: gridValue,
                key: gridKey
            }
        }
    }
}