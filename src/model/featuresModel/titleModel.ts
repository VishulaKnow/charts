import { TitleBlockModel } from "../model";
import { TitleConfigReader } from "../modelInstance/titleConfigReader";



export class TitleModel {
    public static getTitleModel(titleConfig: TitleConfigReader): TitleBlockModel {
        const defaultPads = titleConfig.getFontSize();
        const pad = titleConfig.getTextContent() ? defaultPads : 0;
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