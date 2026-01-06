import {
	MdtChartsConfig,
	MdtChartsTwoDimensionalChart,
	MdtChartsTwoDimensionalOptions,
	MdtChartsPolarOptions,
	MdtChartsDataSource,
	MdtChartsDataRow,
	DataOptions,
	TwoDimensionalChartType,
	MdtChartsSunburstOptions
} from "../../config/config";
import { BarOptionsCanvas, DesignerConfig, LegendBlockCanvas } from "../../designer/designerConfig";
import { AxisModel } from "../featuresModel/axis/axisModel";
import { LegendCanvasModel, LegendItemContentOptions } from "../featuresModel/legendModel/legendCanvasModel";
import { DataScope, LegendBlockModel } from "../model";
import { ModelHelper } from "../helpers/modelHelper";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { DataModelInstance } from "../modelInstance/dataModel/dataModel";
import { ModelInstance } from "../modelInstance/modelInstance";
import { MIN_DONUT_BLOCK_SIZE, PolarModel } from "../notations/polar/polarModel";
import { DataManagerModelService } from "./dataManagerModelService";
import { LegendPolarMarginCalculator } from "../featuresModel/legendModel/polarMarginCalculator";
import { styledElementValues } from "../modelBuilder";

export interface DataLegendParams {
	amount: number;
	size: {
		width: number;
		height: number;
	};
}

export class DataManagerModel {
	private static service = new DataManagerModelService();
	private static polarMarginCalculator = new LegendPolarMarginCalculator();

	public static initDataScope(
		config: MdtChartsConfig,
		data: MdtChartsDataSource,
		designerConfig: DesignerConfig,
		legendBlock: LegendBlockModel,
		modelInstance: ModelInstance
	): void {
		if (config.options.type === "2d") {
			this.initDataScopeFor2D(config.options, modelInstance, data, designerConfig);
		} else if (config.options.type === "polar") {
			this.initDataScopeForPolar(
				config.options,
				modelInstance,
				data,
				legendBlock,
				designerConfig.canvas.legendBlock
			);
		}
		this.initScopedData(data, modelInstance, config);
	}

	private static initScopedData(data: MdtChartsDataSource, modelInstance: ModelInstance, config: MdtChartsConfig) {
		modelInstance.dataModel.repository.initScopedFullSource({
			[config.options.data.dataSource]: modelInstance.dataModel
				.getScope()
				.getScopedRecords(data[config.options.data.dataSource])
		});
	}

	public static getDataValuesByKeyField(
		data: MdtChartsDataSource,
		dataSourceName: string,
		keyFieldName: string
	): string[] {
		return data[dataSourceName].map((dataRow) => dataRow[keyFieldName]);
	}

	private static initDataScopeFor2D(
		configOptions: MdtChartsTwoDimensionalOptions,
		modelInstance: ModelInstance,
		data: MdtChartsDataSource,
		designerConfig: DesignerConfig
	): void {
		modelInstance.dataModel.initMaxRecordsAmount(configOptions.data.maxRecordsAmount);

		const axisLength = AxisModel.getAxisLength(configOptions.orientation, modelInstance.canvasModel);
		const uniqueKeys = ModelHelper.getUniqueValues(
			data[configOptions.data.dataSource].map((d) => d[configOptions.data.keyField.name])
		);
		const dataLength = uniqueKeys.length;

		const limit = this.getDataLimitByItemSize(
			this.getElementsInGroupAmount(configOptions),
			dataLength,
			axisLength,
			designerConfig.canvas.chartOptions.bar
		);
		const allowableKeys = uniqueKeys.slice(0, limit);
		const hidedRecordsAmount = dataLength - allowableKeys.length;

		const limitParams = this.service.limitAllowableKeys(
			allowableKeys,
			hidedRecordsAmount,
			modelInstance.dataModel.getMaxRecordsAmount()
		);

		modelInstance.dataModel.initScope({
			hiddenRecordsAmount: limitParams.hiddenRecordsAmount,
			allowableKeys: limitParams.allowableKeys,
			getScopedRecords: (originalRecords: MdtChartsDataRow[]) => {
				return originalRecords.filter(
					(d) =>
						limitParams.allowableKeys.findIndex((key) => key === d[configOptions.data.keyField.name]) !== -1
				);
			}
		});
	}

	private static initDataScopeForPolar(
		configOptions: MdtChartsPolarOptions,
		modelInstance: ModelInstance,
		data: MdtChartsDataSource,
		legendBlock: LegendBlockModel,
		legendCanvas: LegendBlockCanvas
	): void {
		modelInstance.dataModel.initMaxRecordsAmount(configOptions.data.maxRecordsAmount);

		const canvasModel = modelInstance.canvasModel;
		const keyFieldName = configOptions.data.keyField.name;
		const keys = data[configOptions.data.dataSource].map<string>((dataRow) => dataRow[keyFieldName]);

		if (!configOptions.legend.show) {
			canvasModel.legendCanvas.setPosition("off");
			const limitParams = this.service.getMaximumPossibleAmount(
				keys,
				modelInstance.dataModel.getMaxRecordsAmount()
			);
			modelInstance.dataModel.initScope({
				allowableKeys: limitParams.allowableKeys,
				hiddenRecordsAmount: limitParams.hiddenRecordsAmount,
				getScopedRecords: (originalRecords: MdtChartsDataRow[]) => {
					return originalRecords.filter(
						(d) =>
							limitParams.allowableKeys.findIndex(
								(key) => key === d[configOptions.data.keyField.name]
							) !== -1
					);
				}
			});
			return;
		}

		let position = PolarModel.getLegendPositionByBlockSize(modelInstance.canvasModel);
		let { amount: maxItemsNumber, size } = this.getLegendDataParams(
			position,
			keys,
			legendCanvas,
			canvasModel,
			legendBlock
		);

		if (
			position === "right" &&
			!PolarModel.doesChartBlockHasEnoughWidthForContainsLegend(
				canvasModel.getChartBlockWidth(),
				size.width,
				legendBlock.coordinate
			)
		) {
			const doesFreeSpaceExist = PolarModel.doesChartBlockHasEnoughHeightForContainsLegend(
				canvasModel.getChartBlockHeight(),
				legendBlock.coordinate
			);
			if (doesFreeSpaceExist) {
				const newParams = this.getLegendDataParams("bottom", keys, legendCanvas, canvasModel, legendBlock);
				position = "bottom";
				maxItemsNumber = newParams.amount;
				size = newParams.size;
			}
		}

		//TODO: global refactor of method

		const allowableKeys = keys.slice(0, maxItemsNumber);
		const hidedRecordsAmount = keys.length - maxItemsNumber;

		canvasModel.legendCanvas.setPosition(position);
		this.polarMarginCalculator.updateMargin(
			position,
			canvasModel,
			legendBlock,
			position === "bottom" ? size.height : size.width
		);

		const limitParams = this.service.limitAllowableKeys(
			allowableKeys,
			hidedRecordsAmount,
			modelInstance.dataModel.getMaxRecordsAmount()
		);
		modelInstance.dataModel.initScope({
			allowableKeys: limitParams.allowableKeys,
			hiddenRecordsAmount: limitParams.hiddenRecordsAmount,
			getScopedRecords: (originalRecords: MdtChartsDataRow[]) => {
				return originalRecords.filter(
					(d) =>
						limitParams.allowableKeys.findIndex((key) => key === d[configOptions.data.keyField.name]) !== -1
				);
			}
		});
	}

	//TODO: position type
	private static getLegendDataParams(
		position: "bottom" | "right",
		keys: string[],
		legendCanvas: LegendBlockCanvas,
		canvasModel: CanvasModel,
		legendBlock: LegendBlockModel
	) {
		const legendItemContentOptions: LegendItemContentOptions[] = keys.map((k) => ({
			text: k,
			markerSize: styledElementValues.defaultLegendMarkerSizes,
			wrapperSize: { marginRightPx: styledElementValues.legend.inlineDynamicItemWrapperMarginRightPx }
		}));
		if (position === "right") {
			return LegendCanvasModel.findElementsAmountByLegendSize(
				legendItemContentOptions,
				position,
				this.polarMarginCalculator.getMaxLegendWidth(legendCanvas, canvasModel.getBlockSize().width),
				canvasModel.getChartBlockHeight() - legendBlock.coordinate.right.margin.bottom
			);
		} else {
			return LegendCanvasModel.findElementsAmountByLegendSize(
				legendItemContentOptions,
				position,
				canvasModel.getChartBlockWidth() -
					legendBlock.coordinate.bottom.margin.left -
					legendBlock.coordinate.bottom.margin.right,
				canvasModel.getChartBlockHeight() -
					legendBlock.coordinate.bottom.margin.bottom -
					legendBlock.coordinate.bottom.margin.top -
					MIN_DONUT_BLOCK_SIZE
			);
		}
	}

	/**
	 * Выводит количество элементов (преимущественно баров) в одной группе. Группа - один ключ
	 * @param configOptions
	 * @param chartsLength
	 */
	private static getElementsInGroupAmount(configOptions: MdtChartsTwoDimensionalOptions): number {
		const bars = this.getBarLikeChartsInGroupAmount(configOptions.charts, "bar");
		const dots = configOptions.charts.some((chart) => chart.type === "dot") ? 1 : 0;
		return Math.max(bars, dots);
	}

	private static getBarLikeChartsInGroupAmount(
		charts: MdtChartsTwoDimensionalChart[],
		type: TwoDimensionalChartType
	): number {
		let barsAmount = 0;
		charts.forEach((chart) => {
			if (chart.type === type && chart.isSegmented)
				barsAmount += 1; // в сегментированном баре все valueFields находятся внутри одного бара, поэтому бар всегда один.
			else if (chart.type === type) barsAmount += chart.data.valueFields.length;
		});
		return barsAmount;
	}

	private static getDataLimitByItemSize(
		elementsInGroupAmount: number,
		dataLength: number,
		axisLength: number,
		barOptions: BarOptionsCanvas
	): number {
		let sumSize =
			dataLength *
			(elementsInGroupAmount * barOptions.minBarWidth +
				(elementsInGroupAmount - 1) * barOptions.barDistance +
				barOptions.groupMinDistance);
		while (dataLength !== 0 && axisLength < sumSize) {
			dataLength--;
			// find whole space for bars in group + distance between bars + group distance
			sumSize =
				dataLength *
				(elementsInGroupAmount * barOptions.minBarWidth +
					(elementsInGroupAmount - 1) * barOptions.barDistance +
					barOptions.groupMinDistance);
		}

		return dataLength;
	}
}
