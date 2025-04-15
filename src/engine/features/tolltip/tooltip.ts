import { select, Selection, pointer, BaseType } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import {
	BlockMargin,
	Model,
	OptionsModelData,
	Orient,
	PolarChartModel,
	PolarOptionsModel,
	ScaleKeyModel,
	TwoDimensionalChartModel,
	TwoDimensionalOptionsModel
} from "../../../model/model";
import { Block } from "../../block/block";
import { TooltipDomHelper } from "./tooltipDomHelper";
import { Donut } from "../../polarNotation/donut/donut";
import { ChartOrientation, MdtChartsDataRow, MdtChartsDataSource, Size, TooltipOptions } from "../../../config/config";
import { Scales } from "../scale/scale";
import { TooltipComponentsManager } from "./tooltipComponentsManager";
import { ElementHighlighter } from "../../elementHighlighter/elementHighlighter";
import { DonutHelper } from "../../polarNotation/donut/DonutHelper";
import { TipBox } from "../tipBox/tipBox";
import { TipBoxHelper } from "../tipBox/tipBoxHelper";
import { Helper } from "../../helpers/helper";
import { TooltipHelper } from "./tooltipHelper";
import { TooltipSettings } from "../../../designer/designerConfig";
import { DomSelectionHelper } from "../../helpers/domHelper";
import { NewTooltip } from "./newTooltip/newTooltip";
import { MarkDot } from "../../../engine/features/markDots/markDot";

interface DonutOverDetails {
	pointer: [number, number];
	ignoreTranslate?: boolean;
}

interface TipBoxOverDetails {
	pointer: [number, number];
	keyValue: string;
}

interface TooltipTranslate {
	x: number;
	y: number;
}

interface LineTooltipParams {
	scales: Scales;
	margin: BlockMargin;
	blockSize: Size;
	chartOrientation: ChartOrientation;
	keyAxisOrient: Orient;
	dataOptions: OptionsModelData;
	scaleKeyModel: ScaleKeyModel;
	tooltipSettings: TooltipSettings;
	tooltipOptions: TooltipOptions;
}

interface LineTooltip2DParams extends LineTooltipParams {
	type: "2d";
	charts: TwoDimensionalChartModel[];
}

export class Tooltip {
	public static readonly tooltipBlockClass = NewTooltip.tooltipBlockClass;
	public static readonly tooltipLineClass = "mdt-charts-tooltip-line";
	public static readonly tooltipWrapperClass = "mdt-charts-tooltip-wrapper";
	public static readonly tooltipContentClass = "mdt-charts-tooltip-content";
	public static readonly tooltipArrowClass = "mdt-charts-tooltip-arrow";

	public static render(
		block: Block,
		model: Model<TwoDimensionalOptionsModel | PolarOptionsModel>,
		data: MdtChartsDataSource,
		tooltipOptions: TooltipSettings,
		scales?: Scales
	): void {
		TooltipComponentsManager.renderTooltipWrapper(block);
		const withTooltipIndex = model.options.charts.findIndex(
			(chart: TwoDimensionalChartModel | PolarChartModel) => chart.tooltip.show
		);
		if (withTooltipIndex !== -1) {
			if (model.options.type === "2d") {
				this.renderTooltipFor2DCharts(
					block,
					data,
					model.blockCanvas.size,
					model.chartBlock.margin,
					scales,
					model.options,
					tooltipOptions
				);
			} else if (model.options.type === "polar") {
				this.renderTooltipForPolar(
					block,
					model.options,
					data,
					model.blockCanvas.size,
					model.chartBlock.margin,
					DonutHelper.getThickness(
						model.options.chartCanvas,
						model.blockCanvas.size,
						model.chartBlock.margin
					),
					model.otherComponents.tooltipBlock
				);
			}
		}
	}

	public static hide(block: Block): void {
		TooltipComponentsManager.hideComponent(block.getWrapper().select(`.${this.tooltipBlockClass}`));
		TooltipComponentsManager.hideComponent(block.getSvg().select(`.${this.tooltipLineClass}`));
	}

	private static renderTooltipFor2DCharts(
		block: Block,
		data: MdtChartsDataSource,
		blockSize: Size,
		margin: BlockMargin,
		scales: Scales,
		options: TwoDimensionalOptionsModel,
		tooltipOptions: TooltipSettings
	): void {
		if (scales.key.domain().length === 0) return;

		const tooltipParams: LineTooltip2DParams = {
			type: "2d",
			scales,
			margin,
			blockSize,
			charts: options.charts,
			chartOrientation: options.orient,
			keyAxisOrient: options.axis.key.orient,
			dataOptions: options.data,
			scaleKeyModel: options.scale.key,
			tooltipSettings: tooltipOptions,
			tooltipOptions: options.tooltip
		};

		this.renderLineTooltip(block, data, tooltipParams);
	}

	private static renderTooltipForPolar(
		block: Block,
		options: PolarOptionsModel,
		data: MdtChartsDataSource,
		blockSize: Size,
		margin: BlockMargin,
		chartThickness: number,
		tooltipOptions: TooltipSettings
	): void {
		const attrTransform = block.getSvg().select(`.${Donut.donutBlockClass}`).attr("transform");
		const translateNums = Helper.getTranslateNumbers(attrTransform);
		const arcItems = Donut.getAllArcGroups(block);
		this.renderTooltipForDonut(
			block,
			arcItems,
			data,
			options.data,
			options.charts[0],
			blockSize,
			margin,
			chartThickness,
			tooltipOptions,
			options.tooltip,
			{ x: translateNums[0], y: translateNums[1] }
		);
	}

	private static renderLineTooltip(block: Block, data: MdtChartsDataSource, args: LineTooltip2DParams): void {
		const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block);
		const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);
		const tooltipLine = TooltipComponentsManager.renderTooltipLine(block);
		const tipBox = TipBox.renderOrGet(block, args.margin, args.blockSize);

		let currentKey: string = null;
		tipBox.on("mousemove", function (e: CustomEvent<TipBoxOverDetails>) {
			const keyValue =
				e.detail.keyValue ||
				TipBoxHelper.getKeyValueByPointer(
					pointer(e, this),
					args.chartOrientation,
					args.margin,
					args.blockSize,
					args.scales.key,
					args.scaleKeyModel.type
				);

			if (args.tooltipSettings.position === "followCursor") {
				const tooltipCoordinate = TooltipHelper.getTooltipCursorCoordinate(
					e.detail.pointer || pointer(e, this),
					block.getSvg().node().getBoundingClientRect(),
					tooltipBlock.getEl().node().getBoundingClientRect()
				);
				TooltipComponentsManager.setLineTooltipCoordinate(
					tooltipBlock,
					tooltipCoordinate,
					args.chartOrientation,
					0
				);
			}

			if (!currentKey || currentKey !== keyValue) {
				TooltipComponentsManager.showComponent(tooltipBlock.getEl());
				if (args.type === "2d")
					TooltipDomHelper.fillForMulti2DCharts(
						tooltipContent,
						args.charts.filter((ch) => ch.tooltip.show),
						data,
						args.dataOptions,
						keyValue,
						args.tooltipOptions
					);

				if (args.tooltipSettings.position === "fixed") {
					const tooltipCoordinate = TooltipHelper.getTooltipFixedCoordinate(
						args.scales.key,
						args.margin,
						keyValue,
						block.getSvg().node().getBoundingClientRect(),
						tooltipContent.node().getBoundingClientRect(),
						args.keyAxisOrient,
						window.innerWidth,
						window.innerHeight
					);
					TooltipComponentsManager.setLineTooltipCoordinate(
						tooltipBlock,
						tooltipCoordinate,
						args.chartOrientation,
						block.transitionManager.durations.tooltipSlide
					);
				}

				const tooltipLineAttributes = TooltipHelper.getTooltipLineAttributes(
					args.scales.key,
					args.margin,
					keyValue,
					args.chartOrientation,
					args.blockSize
				);
				TooltipComponentsManager.setTooltipLineAttributes(
					tooltipLine,
					tooltipLineAttributes,
					block.transitionManager.durations.tooltipSlide
				);
				TooltipComponentsManager.showComponent(tooltipLine);

				if (args.type === "2d") {
					args.charts.forEach((chart) => {
						const elements = DomSelectionHelper.get2DChartElements(block, chart);
						if (!block.filterEventManager.isSelected(currentKey)) {
							const oldElements = DomSelectionHelper.getChartElementsByKeys(
								elements,
								chart.isSegmented,
								args.dataOptions.keyField.name,
								[currentKey]
							);
							if (chart.type !== "bar")
								MarkDot.tryMakeMarkDotVisible(oldElements, chart.markersOptions, false);
							ElementHighlighter.toggle2DElements(
								oldElements,
								false,
								chart,
								block.transitionManager.durations.markerHover
							);
							if (block.filterEventManager.getSelectedKeys().length > 0) {
								ElementHighlighter.toggleActivityStyle(oldElements, false);
							}
						}

						const selectedElements = DomSelectionHelper.getChartElementsByKeys(
							elements,
							chart.isSegmented,
							args.dataOptions.keyField.name,
							[keyValue]
						);
						if (chart.type !== "bar")
							MarkDot.tryMakeMarkDotVisible(selectedElements, chart.markersOptions, true);
						ElementHighlighter.toggleActivityStyle(selectedElements, true);
						if (
							block.filterEventManager.getSelectedKeys().length === 0 ||
							block.filterEventManager.isSelected(keyValue)
						) {
							ElementHighlighter.toggle2DElements(
								selectedElements,
								true,
								chart,
								block.transitionManager.durations.markerHover
							);
						}
					});
				}
				currentKey = keyValue;
			}
		});

		tipBox.on("mouseleave", function () {
			TooltipComponentsManager.hideComponent(tooltipBlock.getEl());
			TooltipComponentsManager.hideComponent(tooltipLine);
			if (args.type === "2d")
				ElementHighlighter.removeUnselected2DHighlight(
					block,
					args.dataOptions.keyField.name,
					args.charts,
					block.transitionManager.durations.markerHover
				);
			currentKey = null;
		});
	}

	private static renderTooltipForDonut(
		block: Block,
		elements: Selection<SVGGElement, PieArcDatum<MdtChartsDataRow>, SVGGElement, unknown>,
		data: MdtChartsDataSource,
		dataOptions: OptionsModelData,
		chart: PolarChartModel,
		blockSize: Size,
		margin: BlockMargin,
		donutThickness: number,
		tooltipSettings: TooltipSettings,
		tooltipOptions: TooltipOptions,
		translate: TooltipTranslate
	): void {
		const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block);
		const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);
		let tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>;
		if (tooltipSettings.position === "fixed")
			tooltipArrow = TooltipComponentsManager.renderTooltipArrow(tooltipBlock.getEl());

		if (tooltipSettings.position === "followCursor") {
			elements.on("mousemove", function (e: CustomEvent<DonutOverDetails>) {
				const pointerCoordinate = !pointer(e, block.getSvg().node())[0]
					? e.detail.pointer
					: pointer(e, block.getSvg().node());
				const tooltipCoordinate = TooltipHelper.getTooltipCursorCoordinate(
					pointerCoordinate,
					block.getSvg().node().getBoundingClientRect(),
					tooltipBlock.getEl().node().getBoundingClientRect()
				);
				tooltipBlock.setCoordinate(tooltipCoordinate);
			});
		}

		elements.on("mouseover", function (e, dataRow: PieArcDatum<MdtChartsDataRow>) {
			TooltipComponentsManager.showComponent(tooltipBlock.getEl());
			TooltipDomHelper.fillForPolarChart(
				tooltipContent,
				chart,
				data,
				dataOptions,
				dataRow.data[dataOptions.keyField.name],
				select(this).select("path").style("fill"),
				tooltipOptions
			);

			if (tooltipSettings.position === "fixed") {
				const coordinatePointer = TooltipDomHelper.getRecalcedCoordinateByArrow(
					DonutHelper.getArcCentroid(blockSize, margin, dataRow, donutThickness),
					tooltipBlock.getEl(),
					blockSize,
					tooltipArrow,
					translate.x,
					translate.y
				);
				coordinatePointer[0] = coordinatePointer[0] + translate.x;
				coordinatePointer[1] = coordinatePointer[1] + translate.y;
				const tooltipCoordinate = TooltipHelper.getCoordinateByPointer(coordinatePointer);
				tooltipBlock.setCoordinate(tooltipCoordinate);
			}

			ElementHighlighter.toggleActivityStyle(select(this), true);
			const clones = Donut.getAllArcClones(block).filter(
				(d: PieArcDatum<MdtChartsDataRow>) =>
					d.data[dataOptions.keyField.name] === dataRow.data[dataOptions.keyField.name]
			);
			if (
				clones.nodes().length === 0 &&
				(block.filterEventManager.getSelectedKeys().length === 0 ||
					block.filterEventManager.isSelected(dataRow.data[dataOptions.keyField.name]))
			) {
				ElementHighlighter.renderArcCloneAndHighlight(block, margin, select(this), blockSize, donutThickness);
			}
		});

		elements.on("mouseleave", function (e, dataRow: PieArcDatum<MdtChartsDataRow>) {
			TooltipComponentsManager.hideComponent(tooltipBlock.getEl());
			if (!block.filterEventManager.isSelected(dataRow.data[dataOptions.keyField.name])) {
				ElementHighlighter.removeCloneForElem(block, dataOptions.keyField.name, select(this));
				ElementHighlighter.removeShadowClone(
					block,
					dataOptions.keyField.name,
					select(this),
					margin,
					blockSize,
					donutThickness
				);
				ElementHighlighter.toggleDonutHighlightState(
					select(this),
					margin,
					blockSize,
					donutThickness,
					block.transitionManager.durations.higlightedScale,
					false
				);
				if (block.filterEventManager.getSelectedKeys().length > 0) {
					ElementHighlighter.toggleActivityStyle(select(this), false);
				}
			}
		});
	}
}
