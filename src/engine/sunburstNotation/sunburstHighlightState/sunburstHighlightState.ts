import { MdtChartsDataRow } from "../../../config/config";
import { EventEmitter } from "../../../model/helpers/eventEmitter";
import { SunburstLevel, SunburstLevelSegment } from "../../../model/model";
import { FilterCallback } from "../../filterManager/filterEventManager";

export class SunburstHighlightState {
	private readonly eventEmitter = new EventEmitter<{
		highlightedSegmentsChanged: {
			highlightedSegments: SunburstLevelSegment[];
		};
		selectedSegmentsChanged: {
			selectedSegments: SunburstLevelSegment[];
			firePublicEvent?: boolean;
		};
	}>();
	readonly on = this.eventEmitter.getSubscribeController().subscribe;

	private levels: SunburstLevel[] | undefined = undefined;
	private selectedSegments: SunburstLevelSegment[] = [];

	constructor(private publicSelectEventCallback: FilterCallback) {
		this.on("selectedSegmentsChanged", ({ selectedSegments, firePublicEvent }) => {
			if (firePublicEvent !== false) {
				const dataRows: MdtChartsDataRow[] = [];
				selectedSegments.forEach((segment) => {
					if (segment.levelIndex === this.levels.length - 1) dataRows.push(...segment.attachedDataRows);
				});
				this.publicSelectEventCallback(dataRows);
			}
		});
	}

	setLevels(levels: SunburstLevel[]): void {
		const prevLevelsValue = this.levels;
		this.levels = levels;

		if (!prevLevelsValue) return;

		const newSegments: (SunburstLevelSegment | undefined)[] = this.selectedSegments.map((segment, index) => {
			const level = levels[segment.levelIndex];
			const sameSegmentWithPossibleNewData = level.segments.find(
				(s) => s.key === segment.key && s.levelIndex === segment.levelIndex
			);
			return sameSegmentWithPossibleNewData;
		});

		const changedNonDeletedSegments = newSegments.filter(
			(segment) => segment !== undefined
		) as SunburstLevelSegment[];
		this.selectedSegments = changedNonDeletedSegments;

		const firePublicEvent = changedNonDeletedSegments.length !== newSegments.length;

		this.eventEmitter.emit("selectedSegmentsChanged", {
			selectedSegments: this.selectedSegments,
			firePublicEvent
		});
		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: this.selectedSegments
		});
	}

	setHoverHighlightedSegment(segment: SunburstLevelSegment): void {
		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: [...this.selectedSegments, segment]
		});
	}

	setHoverSegmentLegendItem(segment: SunburstLevelSegment): void {
		const highlightSegments: SunburstLevelSegment[] = [segment];

		const childSegments = this.getAllChildSegments(segment);
		highlightSegments.push(...childSegments);

		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: [...this.selectedSegments, ...highlightSegments]
		});
	}

	clearHoverHighlightedSegment(): void {
		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: this.selectedSegments
		});
	}

	changeSegmentSelection(segment: SunburstLevelSegment, multiMode: boolean): void {
		const childSegments = this.getAllChildSegments(segment);
		const segmentWithChildren = [segment, ...childSegments];

		if (multiMode) {
			const index = this.selectedSegments.findIndex(
				(s) => s.key === segment.key && s.levelIndex === segment.levelIndex
			);
			if (index !== -1) {
				this.selectedSegments.splice(index, 1);
				childSegments.forEach((childSegment) => {
					const index = this.selectedSegments.findIndex(
						(s) => s.key === childSegment.key && s.levelIndex === childSegment.levelIndex
					);
					if (index !== -1) this.selectedSegments.splice(index, 1);
				});
			} else {
				segmentWithChildren.forEach((segment) => {
					if (
						!this.selectedSegments.some((s) => s.key === segment.key && s.levelIndex === segment.levelIndex)
					) {
						this.selectedSegments.push(segment);
					}
				});
			}
		} else {
			if (
				this.selectedSegments.length > 0 &&
				this.selectedSegments.length === segmentWithChildren.length &&
				this.selectedSegments.every((s) => segmentWithChildren.includes(s))
			) {
				this.selectedSegments = [];
			} else {
				this.selectedSegments = segmentWithChildren;
			}
		}

		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: this.selectedSegments
		});
		this.eventEmitter.emit("selectedSegmentsChanged", {
			selectedSegments: this.selectedSegments
		});
	}

	clearSelection(firePublicEvent?: boolean): void {
		this.selectedSegments = [];
		this.eventEmitter.emit("selectedSegmentsChanged", {
			selectedSegments: this.selectedSegments,
			firePublicEvent: firePublicEvent
		});
		this.eventEmitter.emit("highlightedSegmentsChanged", {
			highlightedSegments: this.selectedSegments
		});
	}

	private getAllChildSegments(segment: SunburstLevelSegment): SunburstLevelSegment[] {
		const childSegments: SunburstLevelSegment[] = [];

		let currentParentKeys = [segment.key];
		for (let i = segment.levelIndex + 1; i < this.levels.length; i++) {
			const newParentKeys: (string | number)[] = [];
			this.levels[i].segments.forEach((segment) => {
				if (currentParentKeys.includes(segment.parentLevelKey)) {
					childSegments.push(segment);
					newParentKeys.push(segment.key);
				}
			});
			currentParentKeys = newParentKeys;
		}

		return childSegments;
	}
}
