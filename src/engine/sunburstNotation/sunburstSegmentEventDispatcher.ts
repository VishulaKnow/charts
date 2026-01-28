import { Selection } from "d3-selection";
import { LegendItemModel, SunburstLevelSegment } from "../../model/model";
import { EventEmitter } from "../../model/helpers/eventEmitter";
import { DonutOverDetails } from "../features/tolltip/tooltip";
import { PieArcDatum } from "d3-shape";
import { LegendItemSelection } from "../features/legend/legendDomHelper";

export class SunburstSegmentEventDispatcher {
	private readonly eventEmitter = new EventEmitter<{
		segmentMousemove: {
			e: CustomEvent<DonutOverDetails> | MouseEvent;
			segment: SunburstLevelSegment;
		};
		segmentMouseover: {
			e: MouseEvent;
			segment: SunburstLevelSegment;
		};
		segmentMouseleave: {
			e: MouseEvent;
			segment: SunburstLevelSegment;
		};
		segmentClick: {
			multiModeKeyPressed: boolean;
			segment: SunburstLevelSegment;
		};
		legendItemMousemove: {
			e: MouseEvent;
			legendItem: LegendItemModel;
		};
		legendItemMouseover: {
			e: MouseEvent;
			legendItem: LegendItemModel;
		};
		legendItemMouseleave: {
			e: MouseEvent;
			legendItem: LegendItemModel;
		};
		legendItemClick: {
			multiModeKeyPressed: boolean;
			legendItem: LegendItemModel;
		};
	}>();
	readonly on = this.eventEmitter.getSubscribeController().subscribe;

	private clearListenersInSelection: (() => void) | undefined;

	bind(
		segmentSelection: Selection<SVGGElement, PieArcDatum<SunburstLevelSegment>, SVGGElement, unknown>,
		legendItemSelection?: LegendItemSelection
	) {
		segmentSelection.on(
			"mousemove",
			(e: CustomEvent<DonutOverDetails> | MouseEvent, segmentDatum: PieArcDatum<SunburstLevelSegment>) => {
				this.eventEmitter.emit("segmentMousemove", { e, segment: segmentDatum.data });
			}
		);
		segmentSelection.on("mouseover", (e: MouseEvent, segmentDatum: PieArcDatum<SunburstLevelSegment>) => {
			this.eventEmitter.emit("segmentMouseover", { e, segment: segmentDatum.data });
		});
		segmentSelection.on("mouseleave", (e: MouseEvent, segmentDatum: PieArcDatum<SunburstLevelSegment>) => {
			this.eventEmitter.emit("segmentMouseleave", { e, segment: segmentDatum.data });
		});
		segmentSelection.on("click", (e: MouseEvent, segmentDatum: PieArcDatum<SunburstLevelSegment>) => {
			this.eventEmitter.emit("segmentClick", {
				multiModeKeyPressed: e.ctrlKey || e.metaKey,
				segment: segmentDatum.data
			});
		});

		if (legendItemSelection) {
			legendItemSelection.on("mousemove", (e: MouseEvent, legendItem: LegendItemModel) => {
				this.eventEmitter.emit("legendItemMousemove", { e, legendItem });
			});
			legendItemSelection.on("mouseover", (e: MouseEvent, legendItem: LegendItemModel) => {
				this.eventEmitter.emit("legendItemMouseover", { e, legendItem });
			});
			legendItemSelection.on("mouseleave", (e: MouseEvent, legendItem: LegendItemModel) => {
				this.eventEmitter.emit("legendItemMouseleave", { e, legendItem });
			});
			legendItemSelection.on("click", (e: MouseEvent, legendItem: LegendItemModel) => {
				this.eventEmitter.emit("legendItemClick", { multiModeKeyPressed: e.ctrlKey || e.metaKey, legendItem });
			});
		}

		this.clearListenersInSelection = () => {
			segmentSelection.on("mousemove", null);
			segmentSelection.on("mouseover", null);
			segmentSelection.on("mouseleave", null);
			segmentSelection.on("click", null);

			if (legendItemSelection) {
				legendItemSelection.on("mousemove", null);
				legendItemSelection.on("mouseover", null);
				legendItemSelection.on("mouseleave", null);
				legendItemSelection.on("click", null);
			}
		};
	}

	clearEventListeners() {
		this.clearListenersInSelection?.();
		this.clearListenersInSelection = undefined;
	}
}
