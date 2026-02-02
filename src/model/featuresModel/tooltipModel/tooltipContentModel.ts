import { MdtChartsDataRow, TooltipTypedRowContent, TooltipOptions } from "../../../config/config";
import { Formatter } from "../../../main";
import { TooltipContent, TooltipContentRow, TooltipContentWithRows, TooltipMarkerModel, ValueField } from "../../model";
import {
	BAR_CHART_BORDER_RADIUS_DEFAULT,
	getBorderRadiusValues,
	getWidthOfLegendMarkerByType,
	LINE_CHART_DEFAULT_WIDTH
} from "../../notations/twoDimensional/styles";
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

export const TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME = "tooltip-head";

export class TwoDimTooltipContentGenerator {
	constructor(private readonly options: TooltipContentGeneratorOptions) {}

	generateContent(keyFieldValue: string): TooltipContent {
		const currentDataRow = this.options.datasource.find((r) => r[this.options.keyFieldName] === keyFieldValue)!;

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

		const filterPredicate = this.options.publicOptions?.rows?.filterPredicate;
		if (filterPredicate) initialRows = initialRows.filter((row) => filterPredicate(row));

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

			const tooltipAggregatorItem = tooltipPublicRowToModel(aggregatorContent);

			if (this.options.publicOptions.aggregator.position === "underValues")
				contentRows = contentRows.concat(tooltipAggregatorItem);
			else contentRows = tooltipAggregatorItem.concat(contentRows);
		}

		const headerRow: TooltipContentRow = {
			textContent: {
				caption: keyFieldValue
			},
			wrapper: {
				cssClassName: TOOLTIP_HEAD_WRAPPER_CSS_CLASSNAME
			}
		};
		contentRows.unshift(headerRow);

		return {
			type: "rows",
			rows: contentRows
		};
	}
}

export function tooltipPublicRowToModel(publicRows: TooltipTypedRowContent[]): TooltipContentRow[] {
	return publicRows.map<TooltipContentRow>((content) => {
		const caption = content.type === "plainText" ? content.textContent : content.caption;
		const value = content.type === "plainText" ? undefined : content.value;

		let marker: TooltipMarkerModel | undefined = undefined;
		if (content.marker) {
			if (content.marker.shape === "circle") marker = { markerShape: "circle", color: content.marker.color };
			else if (content.marker.shape === "bar")
				marker = {
					markerShape: "bar",
					barViewOptions: {
						width: getWidthOfLegendMarkerByType("bar"),
						hatch: { on: false },
						borderRadius: getBorderRadiusValues(BAR_CHART_BORDER_RADIUS_DEFAULT)
					},
					color: content.marker.color
				};
			else if (content.marker.shape === "line")
				marker = {
					markerShape: "line",
					lineViewOptions: {
						length: getWidthOfLegendMarkerByType("line"),
						dashedStyles: { on: false, dashSize: 0, gapSize: 0 },
						strokeWidth: LINE_CHART_DEFAULT_WIDTH
					},
					color: content.marker.color
				};
		}

		return {
			marker,
			textContent: {
				caption,
				value
			},
			wrapper: content.wrapperElOptions ? { cssClassName: content.wrapperElOptions.cssClassName } : undefined
		};
	});
}
