import { MdtChartsDataRow, TooltipOptions } from "../../../config/config";
import { Formatter } from "../../../main";
import { TooltipContent, TooltipContentRow, TooltipContentWithRows, TooltipMarkerModel, ValueField } from "../../model";
import { TooltipContentInitialRowsProvider } from "./contentByNotations/tooltipContentInitialRowsProvider";

export interface TooltipContentGeneratorOptions {
	datasource: MdtChartsDataRow[];
	initialRowsProvider: TooltipContentInitialRowsProvider;
	publicOptions?: TooltipOptions;
	keyFieldName: string;
	valueGlobalFormatter: Formatter;
}

interface TooltipInitialRow {
	marker?: TooltipMarkerModel;
	textContent: {
		caption: string;
		value: number;
	};
	valueField: ValueField;
}

export class TwoDimTooltipContentGenerator {
	private readonly headWrapperCssClassName: string = "tooltip-head";

	constructor(private readonly options: TooltipContentGeneratorOptions) {}

	generateContent(keyFieldValue: string): TooltipContent {
		const currentDataRow = this.options.datasource.find((r) => r[this.options.keyFieldName] === keyFieldValue);

		if (this.options.publicOptions?.html)
			return {
				type: "html",
				htmlContent: this.options.publicOptions.html(currentDataRow)
			};

		return this.createRows(keyFieldValue, currentDataRow);
	}

	private createRows(keyFieldValue: string, currentDataRow: MdtChartsDataRow): TooltipContentWithRows {
		let contentRows: TooltipContentRow[] = [];

		let initialRows = this.options.initialRowsProvider
			.getInitialRows({ keyFieldValue, currentDataRow })
			.map<TooltipInitialRow>((initialRow) => {
				return {
					marker: initialRow.marker,
					textContent: {
						caption: initialRow.valueField.title,
						value: currentDataRow[initialRow.valueField.name]
					},
					valueField: initialRow.valueField
				};
			});

		initialRows = this.options.publicOptions?.rows?.filterPredicate
			? initialRows.filter((row) => this.options.publicOptions.rows.filterPredicate(row))
			: initialRows;

		if (this.options.publicOptions?.rows?.sortCompareFn)
			initialRows.sort(this.options.publicOptions.rows.sortCompareFn);

		initialRows.forEach((initialRow) => {
			const formattedValueByDefault = this.options.valueGlobalFormatter(initialRow.textContent.value, {
				type: initialRow.valueField.format
			});

			const formattedValue = this.options.publicOptions?.formatValue
				? this.options.publicOptions.formatValue({
						rawValue: currentDataRow[initialRow.valueField.name],
						autoFormattedValue: formattedValueByDefault
				  })
				: formattedValueByDefault;

			contentRows.push({
				marker: initialRow.marker,
				textContent: {
					caption: initialRow.textContent.caption,
					value: formattedValue
				}
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
