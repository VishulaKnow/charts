import { PolarChart, MdtChartsPolarOptions, MdtChartsDataRow } from "../../../config/config";
import { ChartStyleConfig, DesignerConfig, DonutOptionsCanvas } from "../../../designer/designerConfig";
import { ChartStyleModelService } from "../../chartStyleModel/chartStyleModel";
import { PolarOptionsModel, PolarChartModel, DonutChartSettings, LegendCoordinate } from "../../model";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { DonutModel } from "./donut/donutModel";
import { TitleConfigReader } from "../../modelInstance/titleConfigReader";
import { createRecordOverflowModel } from "../../featuresModel/recordOverflowModel/recordOverflowModel";
import { POLAR_LEGEND_MARKER } from "./modelConstants/polarLegendMarker";
import { TwoDimTooltipContentGenerator } from "../../featuresModel/tooltipModel/tooltipContentModel";
import { PolarInitialRowsProvider } from "../../featuresModel/tooltipModel/contentByNotations/polarInitialRowsProvider";

export const MIN_DONUT_BLOCK_SIZE = 120;

export class PolarModel {
	private static donutModel = new DonutModel();

	public static getOptions(
		options: MdtChartsPolarOptions,
		designerConfig: DesignerConfig,
		modelInstance: ModelInstance
	): PolarOptionsModel {
		const titleConfig = TitleConfigReader.create(options.title, modelInstance);

		const chart = this.getChartsModel(
			options.chart,
			modelInstance.dataModel.repository.getScopedRows().length,
			designerConfig.chartStyle
		);

		return {
			type: options.type,
			selectable: !!options.selectable,
			title: {
				textContent: titleConfig.getTextContent(),
				fontSize: titleConfig.getFontSize()
			},
			data: { ...options.data },
			charts: [chart],
			legend: modelInstance.canvasModel.legendCanvas.getModel(),
			tooltip: {
				getContent: (keyFieldValue) => {
					const generator = new TwoDimTooltipContentGenerator({
						datasource: modelInstance.dataModel.repository.getRawRows(),
						keyFieldName: options.data.keyField.name,
						publicOptions: options.tooltip,
						initialRowsProvider: new PolarInitialRowsProvider({
							datasource: modelInstance.dataModel.repository.getRawRows(),
							valueField: options.chart.data.valueField,
							keyFieldName: options.data.keyField.name,
							chartColors: chart.style.elementColors
						}),
						valueGlobalFormatter: designerConfig.dataFormat.formatters
					});

					return generator.generateContent(keyFieldValue);
				}
			},
			chartCanvas: this.getDonutSettings(
				designerConfig.canvas.chartOptions.donut,
				options.chart,
				modelInstance.dataModel.repository.getRawRows()
			),
			defs: { gradients: [] },
			recordOverflowAlert: createRecordOverflowModel(
				modelInstance.dataModel.getScope().hidedRecordsAmount,
				{
					one: "категория",
					twoToFour: "категории",
					tenToTwenty: "категорий",
					other: "категорий"
				},
				{ positionAttrs: { bottom: "0", right: "0" } },
				options.recordOverflowAlert
			)
		};
	}

	//TODO: type for returned value
	public static getLegendPositionByBlockSize(canvasModel: CanvasModel): "bottom" | "right" {
		const widthCoefficientWhenLegendShouldInBottom = 1.5;
		const avgLegendWidth = 100;
		const blockWidth = canvasModel.getBlockSize().width;
		const blockHeight = canvasModel.getBlockSize().height;

		return canvasModel.getChartBlockWidth() < MIN_DONUT_BLOCK_SIZE + avgLegendWidth &&
			blockWidth * widthCoefficientWhenLegendShouldInBottom < blockHeight
			? "bottom"
			: "right";
	}

	public static doesChartBlockHasEnoughWidthForContainsLegend(
		chartBlockWidth: number,
		legendWidth: number,
		legendCoordinate: LegendCoordinate
	) {
		const rightLegendMargin = legendCoordinate.right.margin;
		return chartBlockWidth - legendWidth - rightLegendMargin.left - rightLegendMargin.right >= MIN_DONUT_BLOCK_SIZE;
	}

	public static doesChartBlockHasEnoughHeightForContainsLegend(
		chartBlockHeight: number,
		legendCoordinate: LegendCoordinate
	) {
		const minHeightForLegend = 30;
		const bottomLegendMargin = legendCoordinate.bottom.margin;
		const heightForLegend =
			chartBlockHeight - bottomLegendMargin.bottom - bottomLegendMargin.top - MIN_DONUT_BLOCK_SIZE;
		return heightForLegend >= minHeightForLegend;
	}

	private static getDonutSettings(
		settings: DonutOptionsCanvas,
		chartOptions: PolarChart,
		dataRows: MdtChartsDataRow[]
	): DonutChartSettings {
		return this.donutModel.getSettings(settings, chartOptions, dataRows);
	}

	private static getChartsModel(
		chart: PolarChart,
		dataLength: number,
		chartStyleConfig: ChartStyleConfig
	): PolarChartModel {
		return {
			type: chart.type,
			data: { ...chart.data },
			cssClasses: ChartStyleModelService.getCssClasses(0),
			style: ChartStyleModelService.getChartStyle(dataLength, chartStyleConfig),
			legend: POLAR_LEGEND_MARKER
		};
	}
}
