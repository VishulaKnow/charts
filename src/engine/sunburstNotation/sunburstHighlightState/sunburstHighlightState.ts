import { EventEmitter } from "../../../model/helpers/eventEmitter";
import { SunburstLevel, SunburstLevelSegment } from "../../../model/model";

export class SunburstHighlightState {
	private readonly eventEmitter = new EventEmitter<{
		highlightedSegmentsChanged: {
			highlightedSegments: SunburstLevelSegment[];
		};
	}>();
	readonly on = this.eventEmitter.getSubscribeController().subscribe;

	private levels: SunburstLevel[] | undefined = undefined;
	private selectedSegments: SunburstLevelSegment[] = [];
	private hoverHighlightedSegment: SunburstLevelSegment | undefined = undefined;

	setLevels(levels: SunburstLevel[]): void {
		this.levels = levels;
		//TODO: check if selected segments are still in the new levels
	}

	setHoverHighlightedSegment(segment: SunburstLevelSegment): void {
		if (!this.levels) return;

		this.hoverHighlightedSegment = segment;
		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: [...this.selectedSegments, segment]
		});
	}

	clearHoverHighlightedSegment(): void {
		this.hoverHighlightedSegment = undefined;
		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: this.selectedSegments
		});
	}
}
