import { MdtChartsDataRow, MdtChartsDonutAggregator } from "../../../../config/config";
import { DonutAggregatorContent } from "../../../model";

export const AGGREGATOR_DEFAULT_TITLE = "Сумма";

export interface AggregatorServiceDataOptions {
    rows: MdtChartsDataRow[];
    valueFieldName: string;
}

export class DonutAggregatorService {
    getContent(
        aggregatorOptions: MdtChartsDonutAggregator,
        dataOptions: AggregatorServiceDataOptions
    ): DonutAggregatorContent {
        if (!aggregatorOptions?.content || !dataOptions.rows) return this.generateDefaultContent(dataOptions);

        const content = aggregatorOptions.content({ data: dataOptions.rows });

        if (!content || (!this.doesValueExist(content.value) && !content.title))
            return this.generateDefaultContent(dataOptions);

        if (this.doesValueExist(content.value) && content.title) {
            return {
                title: content.title,
                value: content.value
            };
        }

        if (!content.title && this.doesValueExist(content.value))
            return {
                value: content.value,
                title: AGGREGATOR_DEFAULT_TITLE
            };

        if (!this.doesValueExist(content.value) && content.title) {
            return {
                value: this.getDefaultValue(dataOptions),
                title: content.title
            };
        }
    }

    private doesValueExist(content: number | string) {
        return content != null;
    }

    private generateDefaultContent(dataOptions: AggregatorServiceDataOptions): DonutAggregatorContent {
        return {
            title: AGGREGATOR_DEFAULT_TITLE,
            value: dataOptions.rows ? this.getDefaultValue(dataOptions) : 0
        };
    }

    private getDefaultValue(dataOptions: AggregatorServiceDataOptions) {
        const totalSumOfValues = dataOptions.rows.reduce((acc, row) => acc + row[dataOptions.valueFieldName], 0);
        return totalSumOfValues;
    }
}
