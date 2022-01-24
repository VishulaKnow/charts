import { TitleBlockModel } from "../model";

export class TitleModel {
    public static getTitleModel(titleText: string): TitleBlockModel {
        const defaultPads = 20;
        const pad = titleText ? defaultPads : 0;
        return {
            margin: {
                bottom: 10,
                left: 0,
                right: 0,
                top: 0
            },
            size: pad,
            pad: 0
        }
    }
}