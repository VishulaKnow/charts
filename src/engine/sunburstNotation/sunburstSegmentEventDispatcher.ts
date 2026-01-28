import { Selection } from "d3-selection";
import { SunburstLevelSegment } from "../../model/model";
import { EventEmitter } from "../../model/helpers/eventEmitter";
import { DonutOverDetails } from "../features/tolltip/tooltip";
import { PieArcDatum } from "d3-shape";

export class SunburstSegmentEventDispatcher {
	private readonly eventEmitter = new EventEmitter<{
		mousemove: {
			e: CustomEvent<DonutOverDetails> | MouseEvent;
			segment: SunburstLevelSegment;
		};
		mouseover: {
			e: MouseEvent;
			segment: SunburstLevelSegment;
		};
		mouseleave: {
			e: MouseEvent;
			segment: SunburstLevelSegment;
		};
		click: {
			e: MouseEvent;
			segment: SunburstLevelSegment;
		};
	}>();
	readonly on = this.eventEmitter.getSubscribeController().subscribe;

	private clearListenersInSelection: (() => void) | undefined;

	bind(segmentSelection: Selection<SVGGElement, PieArcDatum<SunburstLevelSegment>, SVGGElement, unknown>) {
		segmentSelection.on(
			"mousemove",
			(e: CustomEvent<DonutOverDetails> | MouseEvent, segmentDatum: PieArcDatum<SunburstLevelSegment>) => {
				this.eventEmitter.emit("mousemove", { e, segment: segmentDatum.data });
			}
		);

		segmentSelection.on("mouseover", (e: MouseEvent, segmentDatum: PieArcDatum<SunburstLevelSegment>) => {
			this.eventEmitter.emit("mouseover", { e, segment: segmentDatum.data });
		});

		segmentSelection.on("mouseleave", (e: MouseEvent, segmentDatum: PieArcDatum<SunburstLevelSegment>) => {
			this.eventEmitter.emit("mouseleave", { e, segment: segmentDatum.data });
		});

		segmentSelection.on("click", (e: MouseEvent, segmentDatum: PieArcDatum<SunburstLevelSegment>) => {
			this.eventEmitter.emit("click", { e, segment: segmentDatum.data });
		});

		this.clearListenersInSelection = () => {
			segmentSelection.on("mousemove", null);
			segmentSelection.on("mouseover", null);
			segmentSelection.on("mouseleave", null);
			segmentSelection.on("click", null);
		};
	}

	clearEventListeners() {
		this.clearListenersInSelection?.();
		this.clearListenersInSelection = undefined;
	}
}
