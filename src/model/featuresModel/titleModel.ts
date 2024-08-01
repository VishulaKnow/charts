import { TitleBlockModel } from "../model";
import { MdtChartsDataRow } from "src/config/config";
import { Title } from "src/engine/features/title/title";


export const getResolvedTitle = (title: Title, dataRows: MdtChartsDataRow[]) => {
    return typeof title === 'function'
      ? title({ data: dataRows })
      : title
}

export class TitleModel {
    public static getTitleModel(titleText: string): TitleBlockModel {
        const defaultPads = 20;
        const pad = titleText ? defaultPads : 0;
        return {
            margin: {
                bottom: 5,
                left: 0,
                right: 0,
                top: 0
            },
            size: pad,
            pad: 0
        }
    }
}