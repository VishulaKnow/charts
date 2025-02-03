import { Size } from "../../config/config";
import { BlockMargin } from "../../model/model";
import { BlockHelper } from "../../engine/block/blockHelper";

describe("ClipPathAttributesTest", () => {
	let size: Size = {
		height: 500,
		width: 1000
	};
	let margin: BlockMargin = {
		bottom: 20,
		left: 20,
		right: 20,
		top: 20
	};

	test("should return CLipPathAttributes defined object", () => {
		expect(BlockHelper.getClipPathAttributes(size, margin)).toEqual({
			x: 11,
			y: 11,
			width: 978,
			height: 478
		});
	});
});
