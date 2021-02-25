import { TitleBlockModel } from "./model";

export class TitleModel {
    public static getTitleModel(): TitleBlockModel {
        return {
            margin: {
                bottom: 0,
                left: 20,
                right: 20,
                top: 20
            },
            size: 20,
            pad: 0
        }
    }
}