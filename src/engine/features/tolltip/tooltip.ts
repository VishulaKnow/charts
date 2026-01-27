import { select, Selection, pointer, BaseType } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import {
	BlockMargin,
	Model,
	OptionsModelData,
	PolarOptionsModel,
	ScaleKeyModel,
	TooltipBasicModel,
	TwoDimensionalChartModel,
	TwoDimensionalOptionsModel,
	DonutChartSizesModel,
	SunburstLevelSegment,
	SunburstOptionsModel
} from "../../../model/model";
import { Block } from "../../block/block";
import { TooltipDomHelper } from "./tooltipDomHelper";
import { Donut } from "../../polarNotation/donut/donut";
import { ChartOrientation, MdtChartsDataRow, Size } from "../../../config/config";
import { Scales } from "../scale/scale";
import { TooltipComponentsManager } from "./tooltipComponentsManager";
import { ElementHighlighter } from "../../elementHighlighter/elementHighlighter";
import { TipBox } from "../tipBox/tipBox";
import { TipBoxHelper } from "../tipBox/tipBoxHelper";
import { TooltipHelper } from "./tooltipHelper";
import { DomSelectionHelper } from "../../helpers/domSelectionHelper";
import { NewTooltip } from "./newTooltip/newTooltip";
import { MarkDot } from "../../../engine/features/markDots/markDot";
import { Sunburst } from "../../sunburstNotation/sunburst";

interface DonutOverDetails {
	pointer: [number, number];
	ignoreTranslate?: boolean;
}

interface TipBoxOverDetails {
	pointer: [number, number];
	keyValue: string;
}

interface LineTooltipParams {
	scales: Scales;
	margin: BlockMargin;
	blockSize: Size;
	chartOrientation: ChartOrientation;
	dataOptions: OptionsModelData;
	scaleKeyModel: ScaleKeyModel;
	tooltipOptions: TooltipBasicModel;
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
		model: Model<TwoDimensionalOptionsModel | PolarOptionsModel | SunburstOptionsModel>,
		scales?: Scales
	): void {
		TooltipComponentsManager.renderTooltipWrapper(block);

		if (model.options.type === "2d") {
			this.renderTooltipFor2DCharts(
				block,
				model.blockCanvas.size,
				model.chartBlock.margin,
				scales,
				model.options
			);
		} else if (model.options.type === "polar") {
			this.renderTooltipForDonut(block, model.options.data, model.options.charts[0].sizes, model.options.tooltip);
		} else if (model.options.type === "sunburst") {
			this.renderTooltipForSunburst(block);
		}
	}

	public static hide(block: Block): void {
		TooltipComponentsManager.hideComponent(block.getWrapper().select(`.${this.tooltipBlockClass}`));
		TooltipComponentsManager.hideComponent(block.getSvg().select(`.${this.tooltipLineClass}`));
	}

	private static renderTooltipFor2DCharts(
		block: Block,
		blockSize: Size,
		margin: BlockMargin,
		scales: Scales,
		options: TwoDimensionalOptionsModel
	): void {
		if (scales.key.domain().length === 0) return;

		const tooltipParams: LineTooltip2DParams = {
			type: "2d",
			scales,
			margin,
			blockSize,
			charts: options.charts,
			chartOrientation: options.orient,
			dataOptions: options.data,
			scaleKeyModel: options.scale.key,
			tooltipOptions: options.tooltip
		};

		this.renderLineTooltip(block, tooltipParams);
	}

	private static renderLineTooltip(block: Block, args: LineTooltip2DParams): void {
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

			if (!currentKey || currentKey !== keyValue) {
				TooltipComponentsManager.showComponent(tooltipBlock.getEl());
				if (args.type === "2d")
					TooltipDomHelper.fillContent(tooltipContent, args.tooltipOptions.getContent(keyValue));

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
								MarkDot.handleMarkDotVisibility(oldElements, chart.markersOptions, false);
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
							MarkDot.handleMarkDotVisibility(selectedElements, chart.markersOptions, true);
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
		dataOptions: OptionsModelData,
		chartSizes: DonutChartSizesModel,
		tooltipOptions: TooltipBasicModel
	): void {
		const elements = Donut.getAllArcGroups(block);
		const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block);
		const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);

		this.attachTooltipMoveOnElements(elements, block, tooltipBlock, {
			mouseover: function (e, dataRow) {
				TooltipDomHelper.fillContent(
					tooltipContent,
					tooltipOptions.getContent(dataRow.data[dataOptions.keyField.name])
				);

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
					ElementHighlighter.renderArcCloneAndHighlight(block, select(this), chartSizes);
				}
			},
			mouseleave: function (e, dataRow) {
				if (!block.filterEventManager.isSelected(dataRow.data[dataOptions.keyField.name])) {
					ElementHighlighter.removeCloneForElem(block, dataOptions.keyField.name, select(this));
					ElementHighlighter.removeShadowClone(block, dataOptions.keyField.name, select(this), chartSizes);
					ElementHighlighter.toggleDonutHighlightState(
						select(this),
						chartSizes,
						block.transitionManager.durations.higlightedScale,
						false
					);
					if (block.filterEventManager.getSelectedKeys().length > 0) {
						ElementHighlighter.toggleActivityStyle(select(this), false);
					}
				}
			}
		});
	}

	private static renderTooltipForSunburst(block: Block) {
		const elements = Sunburst.getAllArcGroups(block);

		const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block);
		const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);

		this.attachTooltipMoveOnElements(elements, block, tooltipBlock, {
			mouseover: (e, segment) => {
				TooltipDomHelper.fillContent(tooltipContent, segment.data.tooltip.content);
			}
		});
	}

	private static attachTooltipMoveOnElements<D>(
		elements: Selection<Element, D, BaseType, unknown>,
		block: Block,
		tooltipBlock: NewTooltip,
		additionalEventsLogic?: {
			mouseleave?: (e: MouseEvent, elData: D) => void;
			mouseover?: (e: MouseEvent, elData: D) => void;
		}
	) {
		elements.on("mousemove", function (e: CustomEvent<DonutOverDetails> | MouseEvent) {
			const pointerCoordinate = e instanceof CustomEvent ? e.detail.pointer : pointer(e, block.getSvg().node());
			const tooltipCoordinate = TooltipHelper.getTooltipCursorCoordinate(
				pointerCoordinate,
				block.getSvg().node().getBoundingClientRect(),
				tooltipBlock.getEl().node().getBoundingClientRect()
			);
			tooltipBlock.setCoordinate(tooltipCoordinate);
		});

		elements.on("mouseover", function (e, elData: D) {
			TooltipComponentsManager.showComponent(tooltipBlock.getEl());
			additionalEventsLogic?.mouseover?.call(this, e, elData);
		});

		elements.on("mouseleave", function (e, elData) {
			TooltipComponentsManager.hideComponent(tooltipBlock.getEl());
			additionalEventsLogic?.mouseleave?.call(this, e, elData);
		});
	}
}
