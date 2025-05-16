import { MdtChartsDataRow, TooltipOptions } from "../../../config/config";
import { Formatter } from "../../../main";
import { TooltipContent, TooltipContentRow, TooltipContentWithRows, TwoDimensionalChartModel } from "../../model";

export interface TooltipContentGeneratorOptions {
	datasource: MdtChartsDataRow[];
	chartsInfo: Pick<TwoDimensionalChartModel, "data" | "style" | "legend">[];
	publicOptions: TooltipOptions;
	keyFieldName: string;
	valueGlobalFormatter: Formatter;
}

export class TwoDimTooltipContentGenerator {
	private readonly headWrapperCssClassName: string = "tooltip-head";

	constructor(private readonly options: TooltipContentGeneratorOptions) {}

	generateContent(keyFieldValue: string): TooltipContent {
		const currentDataRow = this.options.datasource.find((r) => r[this.options.keyFieldName] === keyFieldValue);

		if (this.options.publicOptions.html)
			return {
				type: "html",
				htmlContent: this.options.publicOptions.html(currentDataRow)
			};

		return this.createRows(keyFieldValue, currentDataRow);
	}

	private createRows(keyFieldValue: string, currentDataRow: MdtChartsDataRow): TooltipContentWithRows {
		let contentRows: TooltipContentRow[] = [];

		this.options.chartsInfo.forEach((chart) => {
			chart.data.valueFields.forEach((valueField, valueFieldIndex) => {
				const formattedValueByDefault = this.options.valueGlobalFormatter(currentDataRow[valueField.name], {
					type: valueField.format
				});

				const formattedValue = this.options.publicOptions?.formatValue
					? this.options.publicOptions.formatValue({
							rawValue: currentDataRow[valueField.name],
							autoFormattedValue: formattedValueByDefault
					  })
					: formattedValueByDefault;

				contentRows.push({
					marker: {
						color: chart.style.elementColors[valueFieldIndex % chart.style.elementColors.length],
						markerShape: chart.legend.markerShape,
						barViewOptions: chart.legend.barViewOptions,
						lineViewOptions: chart.legend.lineViewOptions
					},
					textContent: {
						caption: valueField.title,
						value: formattedValue
					}
				});
			});
		});

		if (this.options.publicOptions?.aggregator) {
			const contentResult = this.options.publicOptions.aggregator.content({ row: currentDataRow });
			const aggregatorContent = Array.isArray(contentResult) ? contentResult : [contentResult];

			const tooltipAggregatorItem = aggregatorContent.map<TooltipContentRow>((content) => {
				const caption = content.type === "plainText" ? content.textContent : content.caption;
				const value = content.type === "plainText" ? undefined : content.value;

				return {
					textContent: {
						caption,
						value
					}
				};
			});

			if (this.options.publicOptions.aggregator.position === "underValues")
				contentRows = contentRows.concat(tooltipAggregatorItem);
			else contentRows = tooltipAggregatorItem.concat(contentRows);
		}

		const headerRow: TooltipContentRow = {
			textContent: {
				caption: keyFieldValue
			},
			wrapper: {
				cssClassName: this.headWrapperCssClassName
			}
		};
		contentRows.unshift(headerRow);

		return {
			type: "rows",
			rows: contentRows
		};
	}
}
