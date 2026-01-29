import { SunburstLevel, SunburstLevelSegment } from "../../../model/model";
import { SunburstHighlightState } from "./sunburstHighlightState";

let levels: SunburstLevel[] = [];

const publicSelectEventCallback = jest.fn();

describe("SunburstHighlightState", () => {
	beforeEach(() => {
		publicSelectEventCallback.mockClear();
		levels = [
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
						parentLevelKey: undefined,
						attachedDataRows: [
							{
								territory: "Moscow",
								brand: "BMW",
								value: 50
							},
							{
								territory: "Moscow",
								brand: "MERCEDES",
								value: 50
							}
						]
					},
					{
						color: "green",
						key: "Center west",
						value: 100,
						levelIndex: 0,
						tooltip: {
							content: { type: "rows", rows: [] }
						},
						parentLevelKey: undefined,
						attachedDataRows: [
							{
								territory: "Center west",
								brand: "VOLKSWAGEN",
								value: 50
							},
							{
								territory: "Center west",
								brand: "DODGE",
								value: 50
							}
						]
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
						parentLevelKey: "Moscow",
						attachedDataRows: [
							{
								territory: "Moscow",
								brand: "BMW",
								value: 50
							}
						]
					},
					{
						color: "red",
						key: "MERCEDES",
						value: 50,
						levelIndex: 1,
						tooltip: {
							content: { type: "rows", rows: [] }
						},
						parentLevelKey: "Moscow",
						attachedDataRows: [
							{
								territory: "Moscow",
								brand: "MERCEDES",
								value: 50
							}
						]
					},

					{
						color: "green",
						key: "VOLKSWAGEN",
						value: 50,
						levelIndex: 1,
						tooltip: {
							content: { type: "rows", rows: [] }
						},
						parentLevelKey: "Center west",
						attachedDataRows: [
							{
								territory: "Center west",
								brand: "VOLKSWAGEN",
								value: 50
							}
						]
					},
					{
						color: "green",
						key: "DODGE",
						value: 50,
						levelIndex: 1,
						tooltip: {
							content: { type: "rows", rows: [] }
						},
						parentLevelKey: "Center west",
						attachedDataRows: [
							{
								territory: "Center west",
								brand: "DODGE",
								value: 50
							}
						]
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
	});

	it("should set highlighted segments", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let result: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			result = highlightedSegments;
		});

		sunburstHighlightState.setHoverHighlightedSegment(levels[0].segments[0]);

		expect(result).toEqual([levels[0].segments[0]]);
	});

	it("should set highlighted segment with its children when hovering segment legend item", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let result: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			result = highlightedSegments;
		});

		sunburstHighlightState.setHoverSegmentLegendItem({
			marker: { markerShape: "circle" },
			markerColor: "red",
			textContent: "Moscow"
		});

		expect(result).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
	});

	it("should set segment selection in non-multi mode", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultHighlighted: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			resultHighlighted = highlightedSegments;
		});

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);

		expect(resultHighlighted).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
		expect(resultSelected).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
	});

	it("should reset existing segment in non-multi mode", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultHighlighted: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			resultHighlighted = highlightedSegments;
		});

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);
		sunburstHighlightState.changeSegmentSelection(levels[0].segments[1], false);

		expect(resultHighlighted).toEqual([levels[0].segments[1], levels[1].segments[2], levels[1].segments[3]]);
		expect(resultSelected).toEqual([levels[0].segments[1], levels[1].segments[2], levels[1].segments[3]]);
	});

	it("should drop existing segment selection in non-multi mode", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultHighlighted: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			resultHighlighted = highlightedSegments;
		});

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);
		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);

		expect(resultHighlighted).toEqual([]);
		expect(resultSelected).toEqual([]);
	});

	it("should set one segment if multiple segments are selected and target segment is included in the selection", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultHighlighted: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			resultHighlighted = highlightedSegments;
		});

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], true);
		sunburstHighlightState.changeSegmentSelection(levels[0].segments[1], true);
		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);

		expect(resultHighlighted).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
		expect(resultSelected).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
	});

	it("should add new segments to the selection in multi mode", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultHighlighted: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			resultHighlighted = highlightedSegments;
		});

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], true);
		expect(resultHighlighted).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
		expect(resultSelected).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[1], true);
		expect(resultHighlighted).toEqual([
			levels[0].segments[0],
			levels[1].segments[0],
			levels[1].segments[1],
			levels[0].segments[1],
			levels[1].segments[2],
			levels[1].segments[3]
		]);
		expect(resultSelected).toEqual([
			levels[0].segments[0],
			levels[1].segments[0],
			levels[1].segments[1],
			levels[0].segments[1],
			levels[1].segments[2],
			levels[1].segments[3]
		]);
	});

	it("should remove segment from selection if it is deselected in multi mode", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultHighlighted: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			resultHighlighted = highlightedSegments;
		});

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], true);
		sunburstHighlightState.changeSegmentSelection(levels[0].segments[1], true);
		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], true);

		expect(resultHighlighted).toEqual([levels[0].segments[1], levels[1].segments[2], levels[1].segments[3]]);
		expect(resultSelected).toEqual([levels[0].segments[1], levels[1].segments[2], levels[1].segments[3]]);
	});

	it("should highlight all segment children if some but not all children are selected and parent segment has been selected now", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultHighlighted: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			resultHighlighted = highlightedSegments;
		});

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[1].segments[0], false);
		expect(resultHighlighted).toEqual([levels[1].segments[0]]);
		expect(resultSelected).toEqual([levels[1].segments[0]]);

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);
		expect(resultHighlighted).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
		expect(resultSelected).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
	});

	it("should highlight all segment children if some but not all children are selected and parent segment has been selected now", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultHighlighted: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("highlightedSegmentsChanged", ({ highlightedSegments }) => {
			resultHighlighted = highlightedSegments;
		});

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[1].segments[0], true);
		expect(resultHighlighted).toEqual([levels[1].segments[0]]);
		expect(resultSelected).toEqual([levels[1].segments[0]]);

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], true);
		expect(resultHighlighted).toEqual([levels[1].segments[0], levels[0].segments[0], levels[1].segments[1]]);
		expect(resultSelected).toEqual([levels[1].segments[0], levels[0].segments[0], levels[1].segments[1]]);
	});

	it("should fire public event when selected segments change", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);
		expect(publicSelectEventCallback).toHaveBeenCalledTimes(1);

		sunburstHighlightState.clearSelection();
		expect(publicSelectEventCallback).toHaveBeenCalledTimes(2);

		sunburstHighlightState.clearSelection(false);
		expect(publicSelectEventCallback).toHaveBeenCalledTimes(2);
	});

	it("should fire public event when selected segments change", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);
		expect(publicSelectEventCallback).toHaveBeenCalledWith([
			{
				territory: "Moscow",
				brand: "BMW",
				value: 50
			},
			{
				territory: "Moscow",
				brand: "MERCEDES",
				value: 50
			}
		]);
	});

	it("should remove outdated segments from selection and fire public event when levels change", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);
		expect(publicSelectEventCallback).toHaveBeenCalledTimes(1);
		expect(resultSelected).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);

		const newLevels: SunburstLevel[] = JSON.parse(JSON.stringify(levels));
		newLevels[1].segments.splice(0, 1);
		newLevels[0].segments[0].attachedDataRows.splice(0, 1);

		sunburstHighlightState.setLevels(newLevels);
		expect(publicSelectEventCallback).toHaveBeenCalledTimes(2);
		expect(publicSelectEventCallback.mock.calls[1][0]).toEqual([
			{
				territory: "Moscow",
				brand: "MERCEDES",
				value: 50
			}
		]);
		expect(resultSelected).toEqual([newLevels[0].segments[0], levels[1].segments[1]]);
		expect(resultSelected[0].attachedDataRows).toEqual([
			{
				territory: "Moscow",
				brand: "MERCEDES",
				value: 50
			}
		]);
	});

	it("should update segments that shouldn't be deleted when levels change", () => {
		const sunburstHighlightState = new SunburstHighlightState(publicSelectEventCallback);
		sunburstHighlightState.setLevels(levels);

		let resultSelected: SunburstLevelSegment[] = [];
		sunburstHighlightState.on("selectedSegmentsChanged", ({ selectedSegments }) => {
			resultSelected = selectedSegments;
		});

		sunburstHighlightState.changeSegmentSelection(levels[0].segments[0], false);
		expect(publicSelectEventCallback).toHaveBeenCalledTimes(1);
		expect(resultSelected).toEqual([levels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);

		const newLevels: SunburstLevel[] = JSON.parse(JSON.stringify(levels));
		newLevels[1].segments.push({
			color: "red",
			key: "AUDI",
			value: 50,
			levelIndex: 1,
			parentLevelKey: "Moscow",
			attachedDataRows: [
				{
					territory: "Moscow",
					brand: "AUDI",
					value: 50
				}
			],
			tooltip: {
				content: { type: "rows", rows: [] }
			}
		});
		newLevels[0].segments[0].attachedDataRows.push({
			territory: "Moscow",
			brand: "AUDI",
			value: 50
		});

		sunburstHighlightState.setLevels(newLevels);
		expect(publicSelectEventCallback).toHaveBeenCalledTimes(1);
		expect(resultSelected).toEqual([newLevels[0].segments[0], levels[1].segments[0], levels[1].segments[1]]);
		expect(resultSelected[0].attachedDataRows).toEqual([
			{
				territory: "Moscow",
				brand: "BMW",
				value: 50
			},
			{
				territory: "Moscow",
				brand: "MERCEDES",
				value: 50
			},
			{
				territory: "Moscow",
				brand: "AUDI",
				value: 50
			}
		]);
	});
});
