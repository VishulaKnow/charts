import { ModelInstance } from "./modelInstance";
import { MdtChartsDataRow, Title } from "../../config/config";
import { ModelHelper } from "../helpers/modelHelper";

export class TitleConfigReader {
    static create(config: Title, modelInstance: ModelInstance) {
        return new TitleConfigReader(
            config,
            () => modelInstance.dataModel.repository.getRawRows(),
            () => ModelHelper.getFontSizeCssValue('--chart-title-font-size', 16)
        );
    }

    constructor(
        private readonly config: Title,
        private readonly dataGetter: () => MdtChartsDataRow[],
        private readonly defaultCssUnitReader: () => number
    ) {}

    getTextContent(): string {
        return this.getResolvedTitle();
    }

    getFontSize(): number {
        return typeof this.config === 'object'
            ? this.config.fontSize
            : this.defaultCssUnitReader();
    }

    private getResolvedTitle(): string {
        switch (typeof this.config) {
            case 'string':
                return this.config;
            case "function":
                return this.config({ data: this.dataGetter() })
            case "object":
                return typeof this.config.text === 'function'
                    ? this.config.text({ data: this.dataGetter() })
                    : this.config.text;
            default:
                return '';
        }
    }
}