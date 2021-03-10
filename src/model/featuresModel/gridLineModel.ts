import { GridLineOptions } from "../model";

export class GridLineModel {
    public static getGridLineOptions(configOptions: GridLineOptions, designerOptions: GridLineOptions): GridLineOptions {
        let gridKey: boolean = false;
        let gridValue: boolean = false;

        if (designerOptions.flag.value)
            gridValue = configOptions.flag.value;
        if (designerOptions.flag.key)
            gridKey = configOptions.flag.key;

        return {
            flag: {
                value: gridValue,
                key: gridKey
            }
        }
    }
}