import { TitleBlockModel } from "../model";

export class TitleModel {
    public static getTitleModel(titleText: string): TitleBlockModel {
        const defaultPads = 20;
        const pad = titleText ? defaultPads : 0;
        return {
            margin: {
                bottom: 0,
                left: pad,
                right: pad,
                top: pad
            },
            size: pad,
            pad: 0
        }
    }
}