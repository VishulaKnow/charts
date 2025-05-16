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
		const rows: TooltipContentRow[] = [
			{
				textContent: {
					caption: keyFieldValue
				},
				wrapper: {
					cssClassName: this.headWrapperCssClassName
				}
			}
		];

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

				rows.push({
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

		return {
			type: "rows",
			rows
		};
	}
}
