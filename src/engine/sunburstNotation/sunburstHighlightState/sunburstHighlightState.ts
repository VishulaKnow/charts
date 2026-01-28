import { EventEmitter } from "../../../model/helpers/eventEmitter";
import { SunburstLevel, SunburstLevelSegment } from "../../../model/model";

export class SunburstHighlightState {
	private readonly eventEmitter = new EventEmitter<{
		highlightedSegmentsChanged: {
			highlightedSegments: SunburstLevelSegment[];
		};
		selectedSegmentsChanged: {
			selectedSegments: SunburstLevelSegment[];
		};
	}>();
	readonly on = this.eventEmitter.getSubscribeController().subscribe;

	private levels: SunburstLevel[] | undefined = undefined;
	private selectedSegments: SunburstLevelSegment[] = [];

	setLevels(levels: SunburstLevel[]): void {
		this.levels = levels;
		//TODO: check if selected segments are still in the new levels
	}

	setHoverHighlightedSegment(segment: SunburstLevelSegment): void {
		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: [...this.selectedSegments, segment]
		});
	}

	setHoverSegmentLegendItem(segment: SunburstLevelSegment): void {
		const highlightSegments: SunburstLevelSegment[] = [segment];

		let currentParentKeys = [segment.key];
		for (let i = segment.levelIndex + 1; i < this.levels.length; i++) {
			const newParentKeys: (string | number)[] = [];
			this.levels[i].segments.forEach((segment) => {
				if (currentParentKeys.includes(segment.parentLevelKey)) {
					highlightSegments.push(segment);
					newParentKeys.push(segment.key);
				}
			});
			currentParentKeys = newParentKeys;
		}

		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: [...this.selectedSegments, ...highlightSegments]
		});
	}

	clearHoverHighlightedSegment(): void {
		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: this.selectedSegments
		});
	}
}
