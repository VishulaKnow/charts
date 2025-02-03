import { ResizedElement } from "../../engine/helpers/fontResizer/fontResizer";
import { resizeFont } from "../../engine/helpers/fontResizer/fontResizerService";

describe("resizeFont", () => {
	const getMocks = () => {
		const elMock = new ResizedElement(null);

		elMock.getWidth = jest.fn();
		elMock.getSizeStyleInNum = jest.fn();
		elMock.setStyle = jest.fn();

		const wrapperEl = new ResizedElement(null);

		wrapperEl.getWidth = jest.fn();
		wrapperEl.getSizeStyleInNum = jest.fn();
		wrapperEl.setStyle = jest.fn();

		return { elMock, wrapperEl };
	};

	test("should exit without changes if element width is less than parent", () => {
		const { elMock, wrapperEl } = getMocks();

		(elMock.getWidth as jest.Mock).mockReturnValueOnce(20);
		(wrapperEl.getWidth as jest.Mock).mockReturnValueOnce(30);

		resizeFont(elMock, { elWrapper: wrapperEl, unit: "px", smallestFontSize: 1 });

		expect(elMock.getSizeStyleInNum).not.toHaveBeenCalled();
	});

	test("should decrease font size until element width is more than parent width", () => {
		const { elMock, wrapperEl } = getMocks();

		(elMock.getWidth as jest.Mock).mockReturnValueOnce(40);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(40);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(35);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(30);

		(elMock.getSizeStyleInNum as jest.Mock).mockReturnValueOnce(12);

		(wrapperEl.getWidth as jest.Mock).mockReturnValue(30);

		resizeFont(elMock, { elWrapper: wrapperEl, unit: "px", step: 2, smallestFontSize: 5 });

		const setStyleMock = elMock.setStyle as jest.Mock;

		expect(setStyleMock.mock.calls.length).toBe(2);
		expect(setStyleMock.mock.calls[0][0]).toBe("font-size");
		expect(setStyleMock.mock.calls[0][1]).toBe("10px");
		expect(setStyleMock.mock.calls[1][1]).toBe("8px");
	});

	test("should decrease font size until elements font size is more than minimal", () => {
		const { elMock, wrapperEl } = getMocks();

		(elMock.getWidth as jest.Mock).mockReturnValueOnce(40);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(40);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(38);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(36);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(34);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(32);
		(elMock.getWidth as jest.Mock).mockReturnValueOnce(30);

		(elMock.getSizeStyleInNum as jest.Mock).mockReturnValueOnce(12);

		(wrapperEl.getWidth as jest.Mock).mockReturnValue(30);

		resizeFont(elMock, { elWrapper: wrapperEl, unit: "px", step: 2, smallestFontSize: 6 });

		const setStyleMock = elMock.setStyle as jest.Mock;

		expect(setStyleMock.mock.calls.length).toBe(3);
		expect(setStyleMock.mock.calls[0][1]).toBe("10px");
		expect(setStyleMock.mock.calls[1][1]).toBe("8px");
		expect(setStyleMock.mock.calls[2][1]).toBe("6px");
	});
});
