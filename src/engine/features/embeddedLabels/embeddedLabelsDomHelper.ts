import { BarAttrs, EmbeddedLabelPosition, EmbeddedLabelsHelper, LabelAttrs } from "./embeddedLabelsHelper";
import { BaseType, Selection } from "d3-selection";
import { BlockMargin } from "../../../model/model";
import { Transition } from "d3-transition";
import { DomHelper } from "../../helpers/domHelper";
import { MdtChartsDataRow, Size } from "../../../config/config";

export class EmbeddedLabelsDomHelper {
	public static setLabelBlockAttrs(
		attrs: LabelAttrs,
		labelBlock: Selection<SVGTextElement, MdtChartsDataRow, HTMLElement, unknown>,
		transitionDuration: number = 0
	): Promise<any> {
		return new Promise((resolve) => {
			let labelBlockHandler:
				| Selection<SVGTextElement, MdtChartsDataRow, HTMLElement, unknown>
				| Transition<SVGTextElement, MdtChartsDataRow, HTMLElement, unknown> = labelBlock;

			if (transitionDuration > 0) {
				labelBlockHandler = labelBlockHandler
					.interrupt()
					.transition()
					.duration(transitionDuration)
					.on("end", () => resolve("updated"));
			}
			labelBlockHandler.attr("x", attrs.x).attr("y", attrs.y).attr("dominant-baseline", "middle");

			if (transitionDuration <= 0) resolve("updated");
		});
	}
	public static cropText(
		labelBlock: Selection<SVGGraphicsElement, unknown, BaseType, unknown>,
		barAttrs: BarAttrs,
		position: EmbeddedLabelPosition,
		labelUnserveFlag: boolean,
		margin: BlockMargin,
		blockSize: Size
	): void {
		let labelTextSpace: number;

		if (labelUnserveFlag) labelTextSpace = blockSize.width - margin.left - margin.right;
		else labelTextSpace = EmbeddedLabelsHelper.getSpaceSizeForType(position, barAttrs.width, margin, blockSize);

		DomHelper.cropSvgLabels(labelBlock, labelTextSpace);
	}
}
