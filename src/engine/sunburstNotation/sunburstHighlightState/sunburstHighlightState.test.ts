import { SunburstLevel, SunburstLevelSegment } from "../../../model/model";
import { SunburstHighlightState } from "./sunburstHighlightState";

const levels: SunburstLevel[] = [
	{
		segments: [
			{
				color: "red",
				key: "Moscow",
				value: 100,
				levelIndex: 0,
				tooltip: {
					content: { type: "rows", rows: [] }
				},
				parentLevelKey: undefined
			},
			{
				color: "green",
				key: "Center west",
				value: 100,
				levelIndex: 0,
				tooltip: {
					content: { type: "rows", rows: [] }
				},
				parentLevelKey: undefined
			}
		],
		sizes: {
			innerRadius: 0,
			outerRadius: 0,
			thickness: 0,
			translate: { x: 0, y: 0 }
		}
	},
	{
		segments: [
			{
				color: "red",
				key: "BMW",
				value: 50,
				levelIndex: 1,
				tooltip: {
					content: { type: "rows", rows: [] }
				},
				parentLevelKey: "Moscow"
			},
			{
				color: "red",
				key: "MERCEDES",
				value: 50,
				levelIndex: 1,
				tooltip: {
					content: { type: "rows", rows: [] }
				},
				parentLevelKey: "Moscow"
			},

			{
				color: "green",
				key: "VOLKSWAGEN",
				value: 50,
				levelIndex: 1,
				tooltip: {
					content: { type: "rows", rows: [] }
				},
				parentLevelKey: "Center west"
			},
			{
				color: "green",
				key: "DODGE",
				value: 50,
				levelIndex: 1,
				tooltip: {
					content: { type: "rows", rows: [] }
				},
				parentLevelKey: "Center west"
			}
		],
		sizes: {
			innerRadius: 0,
			outerRadius: 0,
			thickness: 0,
			translate: { x: 0, y: 0 }
		}
	}
];

describe("SunburstHighlightState", () => {
	it("should set highlighted segments", () => {
		const sunburstHighlightState = new SunburstHighlightState();
		sunburstHighlightState.setLevels(levels);

		let result: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			result = highlightedSegments;
		});

		sunburstHighlightState.setHoverHighlightedSegment(levels[0].segments[0]);

		expect(result).toEqual([levels[0].segments[0]]);
	});

	it("should set highlighted segment with its children when hovering segment legend item", () => {
		const sunburstHighlightState = new SunburstHighlightState();
		sunburstHighlightState.setLevels(levels);

		let result: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			result = highlightedSegments;
		});

		sunburstHighlightState.setHoverSegmentLegendItem(levels[0].segments[0]);

		expect(result).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
	});
});
