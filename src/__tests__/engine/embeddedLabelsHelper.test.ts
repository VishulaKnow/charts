import {
	BarAttrs,
	EmbeddedLabelsHelper,
	LabelAttrs,
	LABEL_BAR_PADDING
} from "../../engine/features/embeddedLabels/embeddedLabelsHelper";
import { BlockMargin } from "../../model/model";
import { Size } from "../../config/config";

describe("test postion and space", () => {
	const margin: BlockMargin = {
		bottom: 20,
		top: 20,
		left: 20,
		right: 20
	};
	const blockSize: Size = {
		height: 400,
		width: 500
	};

	describe("inside bar space", () => {
		test("should return space inside bar", () => {
			const barSize = 300;
			const result = EmbeddedLabelsHelper.getSpaceSizeForType("inside", barSize, margin, blockSize);
			expect(result).toBe(barSize - LABEL_BAR_PADDING * 2);
		});

		test("should return space inside bar", () => {
			const barSize = 100;
			const result = EmbeddedLabelsHelper.getSpaceSizeForType("inside", barSize, margin, blockSize);
			expect(result).toBe(barSize - LABEL_BAR_PADDING * 2);
		});
	});

	describe("outside bar space", () => {
		test("should return space outside bar", () => {
			const barSize = 300;
			const result = EmbeddedLabelsHelper.getSpaceSizeForType("outside", barSize, margin, blockSize);
			expect(result).toBe(blockSize.width - margin.left - margin.right - barSize - LABEL_BAR_PADDING);
		});
	});

	describe("label position test", () => {
		const barAttrs: BarAttrs = {
			width: 100,
			height: 50,
			x: null,
			y: null
		};

		test("should return outside position because barSize < labelWidth", () => {
			const result = EmbeddedLabelsHelper.getLabelPosition(barAttrs, 200, margin, blockSize, false);
			expect(result).toEqual("outside");
		});

		test("should return inside position because barSize > labelWidth", () => {
			const result = EmbeddedLabelsHelper.getLabelPosition(barAttrs, 50, margin, blockSize, false);
			expect(result).toEqual("inside");
		});

		test("should return outside position because space in bar less than outside bar space, but labelwidth more than both spaces", () => {
			const result = EmbeddedLabelsHelper.getLabelPosition(barAttrs, 500, margin, blockSize, false);
			expect(result).toEqual("outside");
		});

		test("should return inside position because space in bar more than outside bar space, but labelwidth more than both spaces", () => {
			barAttrs.width = 300;
			const result = EmbeddedLabelsHelper.getLabelPosition(barAttrs, 500, margin, blockSize, false);
			expect(result).toEqual("inside");
		});

		test("should return inside position because bar height is big enough to serve label inside", () => {
			barAttrs.height = 12;
			const result = EmbeddedLabelsHelper.getLabelPosition(barAttrs, 500, margin, blockSize, false);
			expect(result).toEqual("inside");
		});
	});
});

describe("test label coordinates", () => {
	let barAttrs: BarAttrs;
	let expected: LabelAttrs;

	describe("test coordinates with left key axis orient", () => {
		beforeEach(() => {
			barAttrs = {
				x: 20,
				y: 40,
				width: 100,
				height: 20
			};
			expected = {
				x: 26,
				y: 51,
				textAnchor: "start"
			};
		});

		test("inside bar with start anchor", () => {
			const result = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, "key", "inside", "left", 10);
			expect(result).toEqual(expected);
		});

		test("inside bar with end anchor", () => {
			const result = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, "value", "inside", "left", 20);
			expected.textAnchor = "end";
			expected.x = 94;
			expect(result).toEqual(expected);
		});

		test("outside bar with end anchor", () => {
			const result = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, "key", "outside", "left", 10);
			expected.x = 126;
			expect(result).toEqual(expected);
		});

		test("outside bar with end anchor", () => {
			const result = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, "value", "outside", "left", 10);
			expected.x = 126;
			expect(result).toEqual(expected);
		});
	});
});
