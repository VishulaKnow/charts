import { MdtChartsDataSource } from "../../main";
import { Model, SunburstOptionsModel } from "../../model/model";
import { Block } from "../block/block";
import { ChartContentManager } from "../contentManager/contentManagerFactory";
import { Engine } from "../engine";
import { Aggregator } from "../features/aggregator/aggregator";
import { Legend } from "../features/legend/legend";
import { Title } from "../features/title/title";
import { Tooltip } from "../features/tolltip/tooltip";
import { FilterEventManager, ChartClearSelectionOptions, FilterCallback } from "../filterManager/filterEventManager";
import { Sunburst } from "./sunburst";
import { SunburstHighlightState } from "./sunburstHighlightState/sunburstHighlightState";
import { SunburstSegmentEventDispatcher } from "./sunburstSegmentEventDispatcher";

export class SunburstManager implements ChartContentManager {
	private sunburst: Sunburst | undefined = undefined;
	private readonly sunburstSegmentEventDispatcher = new SunburstSegmentEventDispatcher();
	private readonly sunburstHighlightState: SunburstHighlightState;

	constructor(private callback: FilterCallback) {
		this.sunburstHighlightState = new SunburstHighlightState(this.callback);
	}

	render(engine: Engine, model: Model<SunburstOptionsModel>) {
		engine.block.svg.render(model.blockCanvas.size);

		Title.render(engine.block, model.options.title, model.otherComponents.titleBlock, model.blockCanvas.size);

		Aggregator.render(
			engine.block,
			model.options.levels[0].sizes.innerRadius,
			model.options.levels[0].sizes.translate,
			model.options.levels[0].sizes.thickness,
			model.options.aggregator
		);

		const legendItemsSelection = Legend.get().render(engine.block, model.options, model);

		this.sunburst = new Sunburst(engine.block);
		const allSegmentsSelection = this.sunburst.render(model.options.levels);
		this.sunburstSegmentEventDispatcher.bind(allSegmentsSelection, legendItemsSelection);

		Tooltip.renderTooltipForSunburst(engine.block, this.sunburstSegmentEventDispatcher);

		this.sunburstHighlightState.setLevels(model.options.levels);

		this.sunburstSegmentEventDispatcher.on("segmentMouseover", ({ segment }) => {
			this.sunburstHighlightState.setHoverHighlightedSegment(segment);
		});
		this.sunburstSegmentEventDispatcher.on("segmentMouseleave", ({ segment }) => {
			this.sunburstHighlightState.clearHoverHighlightedSegment();
		});
		this.sunburstSegmentEventDispatcher.on("segmentClick", ({ multiModeKeyPressed, segment }) => {
			this.sunburstHighlightState.changeSegmentSelection(segment, multiModeKeyPressed);
		});

		this.sunburstSegmentEventDispatcher.on("legendItemMouseover", ({ legendItem }) => {
			this.sunburstHighlightState.setHoverSegmentLegendItem(legendItem);
		});
		this.sunburstSegmentEventDispatcher.on("legendItemMouseleave", ({ legendItem }) => {
			this.sunburstHighlightState.clearHoverHighlightedSegment();
		});
		this.sunburstSegmentEventDispatcher.on("legendItemClick", ({ multiModeKeyPressed, legendItem }) => {
			this.sunburstHighlightState.changeLegendItemSelection(legendItem, multiModeKeyPressed);
		});

		this.sunburst.setHighlightedSegmentsHandle(this.sunburstHighlightState);
	}

	updateData(block: Block, model: Model<SunburstOptionsModel>, newData: MdtChartsDataSource): void {
		if (!this.sunburst) throw new Error("Sunburst not initialized");

		block.transitionManager.interruptTransitions();
		this.sunburstSegmentEventDispatcher.clearEventListeners();
		Tooltip.hide(block);

		Title.updateData(block, model.options.title);

		const legendItemsSelection = Legend.get().update(block, model);

		this.sunburst.update(model.options.levels).then((allSegmentsSelection) => {
			this.sunburstSegmentEventDispatcher.bind(allSegmentsSelection, legendItemsSelection);
			this.sunburstHighlightState.setLevels(model.options.levels);
		});

		Aggregator.update(
			block,
			model.options.aggregator,
			model.options.levels[0].sizes.innerRadius,
			model.options.levels[0].sizes.translate
		);
	}

	updateColors(block: Block, model: Model<SunburstOptionsModel>): void {
		if (!this.sunburst) throw new Error("Sunburst not initialized");

		this.sunburst.updateColors(model.options.levels);
		Legend.get().updateColors(block, model.options);
	}

	clearSelection(filterEventManager: FilterEventManager, model: Model, options?: ChartClearSelectionOptions): void {
		this.sunburstHighlightState.clearSelection(options?.firePublicEvent);
	}
}
