import {
	ChartOrientation,
	MdtChartsTwoDimensionalChart,
	TwoDimensionalChartType,
	MdtChartsTwoDimensionalOptions
} from "../../config/config";
import { ChartOptionsCanvas, DesignerConfig } from "../../designer/designerConfig";
import { ChartStyleModelService } from "../chartStyleModel/chartStyleModel";
import { TwoDimensionalChartStyleModel } from "../chartStyleModel/twoDimensionalChartStyleModel";
import { AxisModel } from "../featuresModel/axis/axisModel";
import { ScaleAxisRecalcer, ScaleValueCalculatedInfo } from "../featuresModel/scaleModel/scaleAxisRecalcer";
import { ScaleModel } from "../featuresModel/scaleModel/scaleModel";
import {
	TwoDimensionalOptionsModel,
	TwoDimensionalChartModel,
	EmbeddedLabelTypeModel,
	AdditionalElementsOptions,
	TwoDimChartElementsSettings,
	Orient,
	TwoDimGroupingItemModel,
	ScaleKeyModel
} from "../model";
import { TwoDimConfigReader } from "../modelInstance/configReader/twoDimConfigReader/twoDimConfigReader";
import { ModelInstance } from "../modelInstance/modelInstance";
import {
	calculateBarIndexes,
	getAreaViewOptions,
	getBarsAmount,
	getBarViewOptions,
	getLegendMarkerOptions,
	LINE_CHART_DEFAULT_WIDTH,
	parseDashStyles,
	parseShape
} from "./twoDimensional/styles";
import { DataRepositoryModel } from "../modelInstance/dataModel/dataRepository";
import {
	calculateValueLabelAlignment,
	handleValueBeforeScale,
	ValueLabelCoordinateCalculator
} from "../../model/featuresModel/valueLabelsModel/valueLabelsModel";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";
import { TwoDimensionalModelHelper } from "../helpers/twoDimensionalModelHelper";
import { TitleConfigReader } from "../modelInstance/titleConfigReader";
import { createRecordOverflowModel } from "../featuresModel/recordOverflowModel/recordOverflowModel";
import { TwoDimTooltipContentGenerator } from "../featuresModel/tooltipModel/tooltipContentModel";
import { TwoDimInitialRowsProvider } from "../featuresModel/tooltipModel/contentByNotations/twoDimInitialRowsProvider";
import { GroupingLabelsCoordinateHandler } from "../featuresModel/grouping/groupingLabels/groupingLabelsCoordinateHandlers";
import { GroupingLabelsCoordinateScaler } from "../featuresModel/grouping/groupingLabels/groupingLabelsScaler";
import { GroupingStaticCoordinateCalculator } from "../featuresModel/grouping/groupingLabels/staticCoordinateCalculator";
import { GroupingEdgeLinesGenerator } from "../featuresModel/grouping/groupingEdgeLines/groupingEdgeLinesGenerator";
import { GroupingSplitLinesGenerator } from "../featuresModel/grouping/groupingSplitLines/groupingSplitLines";
import { GroupingDataAmountCalculator } from "../featuresModel/grouping/groupingDataAmountCalculator/groupingDataAmountCalculator";
import { ScaleCanvasSizesCalculator } from "../featuresModel/scaleModel/sizaCalculators/scaleCanvasSizesCalculator";
import { KeyTotalSpaceCalculator } from "../featuresModel/scaleModel/sizaCalculators/keyTotalSpaceCalculator";
import { createBandLikeChartSettingsStore } from "../featuresModel/bandLikeCharts/bandLikeChartSettings";

export class TwoDimensionalModel {
	public static getOptions(
		configReader: TwoDimConfigReader,
		designerConfig: DesignerConfig,
		modelInstance: ModelInstance
	): TwoDimensionalOptionsModel {
		const options = configReader.options;
		const canvasModel = modelInstance.canvasModel;

		const scaleModel = new ScaleModel(options, canvasModel, designerConfig.canvas.chartOptions.bar);
		const scaleMarginRecalcer = new ScaleAxisRecalcer(() =>
			scaleModel.getScaleLinear(modelInstance.dataModel.repository.getScopedRows(), configReader)
		);
		scaleMarginRecalcer.recalculateMargin(canvasModel, options.orientation, options.axis.key);
		const scaleValueInfo = scaleMarginRecalcer.getScaleValue();

		let secondaryScaleValueInfo: ScaleValueCalculatedInfo | undefined;
		if (configReader.containsSecondaryAxis()) {
			const secondaryScaleMarginRecalcer = new ScaleAxisRecalcer(() =>
				scaleModel.getScaleSecondaryLinear(modelInstance.dataModel.repository.getScopedRows(), configReader)
			);
			secondaryScaleMarginRecalcer.recalculateMargin(canvasModel, options.orientation, options.axis.key);
			secondaryScaleValueInfo = secondaryScaleMarginRecalcer.getScaleValue();
		}

		const keyAxis = AxisModel.getKeyAxis(
			options,
			modelInstance.dataModel.repository.getScopedFullSource(),
			designerConfig.canvas.axisLabel,
			canvasModel,
			designerConfig.elementsOptions.tooltip,
			() => scaleValueInfo.scaleFn(0)
		);

		const keyScale = scaleModel.getScaleKey(modelInstance.dataModel.getAllowableKeys());

		const charts = this.getChartsModel(
			options.charts,
			configReader,
			options.orientation,
			designerConfig,
			modelInstance.dataModel.repository,
			keyAxis.orient,
			canvasModel,
			options.data.keyField.name,
			modelInstance,
			keyScale
		);

		const titleConfig = TitleConfigReader.create(options.title, modelInstance);
		const isHorizontal = options.orientation === "horizontal";

		const groupingStaticCoordinateCalculator = new GroupingStaticCoordinateCalculator({
			canvasModel,
			otherComponentSizes: {
				titleTotalNeededSpace: canvasModel.titleCanvas.getAllNeededSpace(),
				legendTotalNeededSpace: canvasModel.legendCanvas.getAllNeededSpace()
			},
			groupingItemSizes: configReader.grouping.getSlicesSizesByOrients(
				modelInstance.dataModel.repository.getScopedRows()
			)
		});

		const groupingEdgeLinesGenerator = new GroupingEdgeLinesGenerator({
			canvasModel,
			orients: configReader.grouping.getUsingOrients(),
			staticCoordinateCalculator: groupingStaticCoordinateCalculator,
			lineWidth: configReader.grouping.getLineWidth()
		});

		const scaleSizesCalculator = new ScaleCanvasSizesCalculator({ keyScale });
		const keyTotalSpaceCalculator = new KeyTotalSpaceCalculator({ scaleSizesCalculator });

		return {
			legend: canvasModel.legendCanvas.getModel(),
			canvasEvents: {
				drawCompleted: () => {
					options.events?.drawComplete?.({
						canvas: {
							plotAreaMargin: canvasModel.getMargin(),
							keyItems: keyTotalSpaceCalculator.calculate()
						}
					});
				}
			},
			title: {
				textContent: titleConfig.getTextContent(),
				fontSize: titleConfig.getFontSize()
			},
			grouping: {
				enabled: configReader.grouping.isEnabled(),
				edgeLines: groupingEdgeLinesGenerator.generate(),
				items: configReader.grouping
					.getPreparedOptions(modelInstance.dataModel.repository.getScopedRows())
					.map<TwoDimGroupingItemModel>((prepared) => {
						const groupingDataAmountCalculator = new GroupingDataAmountCalculator({
							dataRows: modelInstance.dataModel.repository.getScopedRows(),
							field: prepared.field
						});
						const scaler = new GroupingLabelsCoordinateScaler({
							dataAmountCalculator: groupingDataAmountCalculator,
							sizesCalculator: scaleSizesCalculator
						});
						const coordinateHandler = new GroupingLabelsCoordinateHandler({
							canvasModel,
							orient: prepared.orient,
							sideIndex: prepared.sideIndex,
							staticCoordinateCalculator: groupingStaticCoordinateCalculator
						});
						const splitLinesGenerator = new GroupingSplitLinesGenerator({
							canvasModel,
							orient: prepared.orient,
							sideIndex: prepared.sideIndex,
							staticCoordinateCalculator: groupingStaticCoordinateCalculator,
							dataAmountCalculator: groupingDataAmountCalculator,
							sizesCalculator: scaleSizesCalculator
						});

						return {
							labels: {
								domain: prepared.domain,
								textAnchor: prepared.textAnchor,
								dominantBaseline: prepared.dominantBaseline,
								coordinate: {
									handleX: (groupKey) => coordinateHandler.handleX(scaler.scaleForKey(groupKey)),
									handleY: (groupKey) => coordinateHandler.handleY(scaler.scaleForKey(groupKey))
								}
							},
							splitLines: splitLinesGenerator.generate()
						};
					})
			},
			selectable: !!options.selectable,
			orient: options.orientation,
			scale: {
				key: keyScale,
				value: scaleValueInfo.scale,
				...(configReader.containsSecondaryAxis() && { valueSecondary: secondaryScaleValueInfo!.scale })
			},
			axis: {
				key: keyAxis,
				value: AxisModel.getMainValueAxis(
					configReader.calculateDefaultAxisLabelFormatter(),
					options.orientation,
					options.axis.value.position,
					options.axis.value,
					designerConfig.canvas.axisLabel,
					canvasModel,
					scaleValueInfo.scale
				),
				...(configReader.containsSecondaryAxis() && {
					valueSecondary: AxisModel.getSecondaryValueAxis(
						configReader.calculateDefaultAxisLabelFormatter(),
						options.orientation,
						options.axis.value.position,
						options.axis.valueSecondary!,
						designerConfig.canvas.axisLabel,
						canvasModel,
						secondaryScaleValueInfo!.scale
					)
				})
			},
			type: options.type,
			data: { ...options.data },
			charts,
			additionalElements: this.getAdditionalElements(options),
			tooltip: {
				getContent: (keyFieldValue) => {
					const generator = new TwoDimTooltipContentGenerator({
						datasource: modelInstance.dataModel.repository.getRawRows(),
						keyFieldName: options.data.keyField.name,
						publicOptions: options.tooltip,
						initialRowsProvider: new TwoDimInitialRowsProvider({ chartsInfo: charts }),
						valueGlobalFormatter: designerConfig.dataFormat.formatters
					});
					return generator.generateContent(keyFieldValue);
				}
			},
			chartSettings: this.getChartsSettings(designerConfig.canvas.chartOptions, options.orientation),
			valueLabels: TwoDimensionalModelHelper.getValueLabels(
				options.valueLabels,
				canvasModel,
				options.orientation,
				configReader.getValueLabelsStyleModel()
			),
			defs: {
				gradients: TwoDimensionalModelHelper.getGradientDefs(
					charts,
					keyAxis.orient,
					options.orientation,
					modelInstance.version.getVersionNumber()
				)
			},
			recordOverflowAlert: createRecordOverflowModel(
				modelInstance.dataModel.getScope().hidedRecordsAmount,
				{
					one: isHorizontal ? "строка" : "столбец",
					twoToFour: isHorizontal ? "строки" : "столбца",
					tenToTwenty: isHorizontal ? "строк" : "столбцов",
					other: isHorizontal ? "строк" : "столбцов"
				},
				{ positionAttrs: { top: "0", right: "0" } },
				options.recordOverflowAlert
			)
		};
	}

	public static getChartsEmbeddedLabelsFlag(
		charts: MdtChartsTwoDimensionalChart[],
		chartOrientation: ChartOrientation
	): boolean {
		// Если НЕ найден хотя бы один чарт, который сегментированный или хотя бы один НЕ бар чарт, то лейблы можно прятать
		return (
			charts.findIndex((chart) => chart.isSegmented || chart.type !== "bar") === -1 &&
			chartOrientation === "horizontal" &&
			charts.length === this.findChartsWithEmbeddedKeyLabels(charts).length
		);
	}

	/**
	 * Сортирует список чартов в порядке: area - bar - line.
	 * Используется для того, чтобы при рендере графики с наибольшей площадью (area) не перекрывали графики с меньшей площадью (bar, line).
	 * @param charts Чарты из конфига
	 */
	public static sortCharts(charts: MdtChartsTwoDimensionalChart[]): void {
		const chartOrder: TwoDimensionalChartType[] = ["area", "bar", "line", "dot"];
		charts.sort((chart1, chart2) => chartOrder.indexOf(chart1.type) - chartOrder.indexOf(chart2.type));
	}

	public static getChartsSettings(
		chartOptions: ChartOptionsCanvas,
		chartOrientation: ChartOrientation
	): TwoDimChartElementsSettings {
		return {
			bar: { ...chartOptions.bar },
			lineLike: { shape: parseShape(chartOrientation, chartOptions.line?.shape) }
		};
	}

	private static getChartsModel(
		charts: MdtChartsTwoDimensionalChart[],
		configReader: TwoDimConfigReader,
		chartOrientation: ChartOrientation,
		designerConfig: DesignerConfig,
		dataModelRep: DataRepositoryModel,
		keyAxisOrient: Orient,
		canvasModel: CanvasModel,
		keyFieldName: string,
		modelInstance: ModelInstance,
		keyScale: ScaleKeyModel
	): TwoDimensionalChartModel[] {
		const styleModel = new TwoDimensionalChartStyleModel(charts, designerConfig.chartStyle);
		const chartsModel: TwoDimensionalChartModel[] = [];
		charts.forEach((chart, index) => {
			const style = styleModel.getChartStyle(chart, index);

			const bandSettingsStore = createBandLikeChartSettingsStore(
				chart.type,
				designerConfig.canvas.chartOptions.bar,
				getBarsAmount(charts),
				keyScale
			);

			const globalBarsIndicesMap = calculateBarIndexes(charts, chart, index);

			const valueLabelsCoordinateCalculator = new ValueLabelCoordinateCalculator(
				chart.valueLabels?.position,
				keyAxisOrient,
				canvasModel.getMargin(),
				chart.isSegmented,
				(value, fieldIndex) => {
					if (bandSettingsStore)
						return (
							value +
							bandSettingsStore.getBandItemPad(globalBarsIndicesMap[fieldIndex]) +
							bandSettingsStore.getBandSubItemSize() / 2
						);
					const keyScalePadToMiddle = keyScale.type === "band" ? keyScale.sizes.bandSize / 2 : 0;
					return value + keyScalePadToMiddle;
				}
			);
			const valueLabelsAlignment = calculateValueLabelAlignment(
				keyAxisOrient,
				chart.valueLabels?.position?.mode,
				chart.valueLabels?.rotation
			);

			chartsModel.push({
				type: chart.type,
				isSegmented: chart.isSegmented,
				data: { ...chart.data },
				cssClasses: ChartStyleModelService.getCssClasses(index),
				style,
				embeddedLabels: this.getEmbeddedLabelType(chart, chartOrientation),
				markersOptions: {
					shouldForceShow: ({ row, valueFieldName }) => {
						return TwoDimensionalModelHelper.forceMarkerShow(
							chart,
							dataModelRep.getRawRows(),
							valueFieldName,
							row,
							keyFieldName
						);
					},
					shouldForceHide: ({ row, valueFieldName }) => {
						const value = (row as any)[valueFieldName];
						return value == null || Number.isNaN(value);
					},
					styles: {
						highlighted: {
							size: {
								radius: designerConfig.canvas.markers?.highlighted?.radius ?? 4,
								borderSize: "3.5px"
							}
						},
						normal: {
							size: {
								radius: designerConfig.canvas.markers?.normal?.radius ?? 3,
								borderSize: `${designerConfig.canvas.markers?.normal?.borderSize ?? 2}px`
							}
						}
					}
				},
				lineLikeViewOptions: {
					dashedStyles: parseDashStyles(chart.lineStyles?.dash),
					strokeWidth: chart.lineStyles?.width ?? LINE_CHART_DEFAULT_WIDTH,
					renderForKey: (dataRow, valueFieldName) =>
						dataRow[valueFieldName] !== null && dataRow[valueFieldName] !== undefined
				},
				bandLikeViewOptions: {
					settingsStore: bandSettingsStore
				},
				barViewOptions: getBarViewOptions(chart, keyAxisOrient, globalBarsIndicesMap),
				legend: getLegendMarkerOptions(chart),
				index,
				valueLabels: {
					enabled: chart.valueLabels?.on ?? false,
					showLabel: ({ row, valueFieldName }) => {
						const value = (row as any)[valueFieldName];
						return value != null && !Number.isNaN(value);
					},
					handleX: (scaledValue, fieldIndex) =>
						valueLabelsCoordinateCalculator.getValueLabelX(scaledValue, fieldIndex),
					handleY: (scaledValue, fieldIndex) =>
						valueLabelsCoordinateCalculator.getValueLabelY(scaledValue, fieldIndex),
					handleValueBeforeScale: (dataRow, datumField) => {
						return handleValueBeforeScale(
							dataRow,
							datumField,
							chart.isSegmented,
							chart.valueLabels?.position?.mode
						);
					},
					textAnchor: valueLabelsAlignment.textAnchor,
					dominantBaseline: valueLabelsAlignment.dominantBaseline,
					rotation: chart.valueLabels?.rotation,
					handleElement: chart.valueLabels?.handleElement,
					forFields: chart.valueLabels?.renderForFields ?? chart.data.valueFields.map((field) => field.name),
					setContent: ({ dataRow, fieldName }) => {
						if (chart.valueLabels?.setContent) {
							const content = chart.valueLabels.setContent({
								dataRow,
								field: chart.data.valueFields.find((field) => field.name === fieldName)!
							});
							return { rows: content.textContent.toString().split("\n") };
						}
						return { rows: [configReader.getValueLabelFormatterForChart(index)(dataRow[fieldName])] };
					}
				},
				areaViewOptions: getAreaViewOptions(chart, index, style, modelInstance.version.getVersionNumber()),
				dotViewOptions: {
					shape: {
						type: "line",
						handleStartCoordinate: (v) => v - 2,
						handleEndCoordinate: (v) => v + 2,
						width: chart.dotLikeStyles?.shape?.width ?? LINE_CHART_DEFAULT_WIDTH
					}
				}
			});
		});

		return chartsModel;
	}

	private static findChartsWithEmbeddedKeyLabels(
		charts: MdtChartsTwoDimensionalChart[]
	): MdtChartsTwoDimensionalChart[] {
		const chartsWithEmbeddedLabels: MdtChartsTwoDimensionalChart[] = [];

		charts.forEach((chart) => {
			if (chart.type === "bar" && chart.embeddedLabels === "key") chartsWithEmbeddedLabels.push(chart);
		});

		return chartsWithEmbeddedLabels;
	}

	private static getEmbeddedLabelType(
		currentChart: MdtChartsTwoDimensionalChart,
		chartOrientation: ChartOrientation
	): EmbeddedLabelTypeModel {
		if (chartOrientation === "horizontal" && currentChart.type === "bar") return currentChart.embeddedLabels;
		return "none";
	}

	private static getAdditionalElements(options: MdtChartsTwoDimensionalOptions): AdditionalElementsOptions {
		const { flag, styles } = options.additionalElements.gridLine;

		return {
			gridLine: {
				flag,
				styles: {
					dash: { on: styles?.dash?.on ?? false }
				}
			}
		};
	}
}
