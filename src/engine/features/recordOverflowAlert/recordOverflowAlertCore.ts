import { RecordOverflowAlertOptions, RecordOverflowAlertPositionAttrs } from "../../../model/model";
import { Block } from "../../block/block";
import { Selection } from "d3-selection";

class RecordOverflowAlertCoreClass {
	private readonly blockClass = "record-overflow-alert";

	public render(block: Block, options: RecordOverflowAlertOptions): void {
		if (options.show) {
			const alertBlock = block
				.getWrapper()
				.append("div")
				.attr("class", this.blockClass)
				.text(options.textContent);

			this.setAlertPosition(alertBlock, options.positionAttrs);
		}
	}

	public update(block: Block, options: RecordOverflowAlertOptions): void {
		let alertBlock = block.getWrapper().select(`.${this.blockClass}`);

		if (alertBlock.empty()) {
			if (options.show) this.render(block, options);
		} else {
			if (options.show) alertBlock.text(options.textContent);
			else alertBlock.remove();
		}
	}

	private setAlertPosition(
		alertBlock: Selection<HTMLDivElement, unknown, HTMLElement, any>,
		attrs: RecordOverflowAlertPositionAttrs
	): void {
		alertBlock
			.style("position", "absolute")
			.style("left", attrs.left)
			.style("right", attrs.right)
			.style("top", attrs.top)
			.style("bottom", attrs.bottom);
	}
}

export const RecordOverflowAlertCore = new RecordOverflowAlertCoreClass();
