import { ResizedElement, ResizingOptions } from "./fontResizer";

interface ResizerServiceOptions extends Omit<ResizingOptions, "elWrapper"> {
	elWrapper: ResizedElement;
}

export function resizeFont(el: ResizedElement, options: ResizerServiceOptions) {
	const wrapper = options.elWrapper;

	if (el.getWidth() <= wrapper.getWidth()) return;

	let fontSize = el.getSizeStyleInNum("font-size");
	const { smallestFontSize: minSize, step, unit } = options;
	const wrapperWidth = wrapper.getWidth();

	while (el.getWidth() > wrapperWidth && fontSize > minSize) {
		fontSize -= step;
		el.setStyle("font-size", `${fontSize}${unit}`);
	}
}
