import { MdtChartsDataRow, MdtChartsDonutAggregator } from "../../../../config/config";
import { DonutAggregatorContent } from "../../../model";

export const AGGREGATOR_DEFAULT_TITLE = "Сумма";

export interface AggregatorServiceDataOptions {
    rows: MdtChartsDataRow[];
    valueFieldName: string;
}

export class DonutAggregatorService {
    getContent(aggregatorOptions: MdtChartsDonutAggregator, dataOptions: AggregatorServiceDataOptions): DonutAggregatorContent {
        if (!aggregatorOptions?.content || !dataOptions.rows) return this.generateDefaultContent(dataOptions);

        const content = aggregatorOptions.content({ data: dataOptions.rows });

        if (this.doesValueExist(content.value) && content.title) return content;

        if (!content.title && this.doesValueExist(content.value))
            return {
                value: content.value,
                title: AGGREGATOR_DEFAULT_TITLE
            }

        return this.generateDefaultContent(dataOptions);
    }

    private doesValueExist(content: number | string) {
        return content != null;
    }

    private generateDefaultContent(dataOptions: AggregatorServiceDataOptions): DonutAggregatorContent {
        return {
            title: AGGREGATOR_DEFAULT_TITLE,
            value: dataOptions.rows ? dataOptions.rows.reduce((acc, row) => acc + row[dataOptions.valueFieldName], 0) : 0
        }
    }
}