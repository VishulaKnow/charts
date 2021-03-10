import { GridLineModel } from "../../model/featuresModel/gridLineModel";
import { GridLineOptions } from "../../model/model";

test('Designer config has bigger priority than userConfig', () => {
    const configOptions: GridLineOptions = {
        flag: {
            key: true,
            value: true
        }
    }
    const configDesigner: GridLineOptions = {
        flag: {
            key: false,
            value: false
        }
    }

    expect(GridLineModel.getGridLineOptions(configOptions, configDesigner)).toEqual(configDesigner);

    configDesigner.flag.key = true;
    expect(GridLineModel.getGridLineOptions(configOptions, configDesigner)).toEqual(configDesigner);

    configDesigner.flag.value = true;
    expect(GridLineModel.getGridLineOptions(configOptions, configDesigner)).toEqual(configDesigner);
});