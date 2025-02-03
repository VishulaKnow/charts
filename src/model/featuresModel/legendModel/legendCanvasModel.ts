import { DataLegendParams } from "../../dataManagerModel/dataManagerModel";
import { LegendPosition } from "../../model";
import { CLASSES, styledElementValues } from "../../modelBuilder";

export type LegendItemsDirection = "row" | "column";

export interface LegendItemContentOptions {
	text: string;
	markerSize: { widthPx: number; heightPx: number; marginRightPx: number };
	wrapperSize: { marginRightPx: number };
}

export class LegendCanvasModel {
	//TODO: find better solution
	public static findElementsAmountByLegendSize(
		items: LegendItemContentOptions[],
		position: LegendPosition,
		legendBlockWidth: number,
		legendBlockHeight: number
	): DataLegendParams {
		const legendWrapper = this.getLegendWrapperEl(legendBlockWidth, position === "right" ? "column" : "row");
		document.body.append(legendWrapper);
		let amount = 0;

		for (let i = 0; i < items.length; i++) {
			const itemWrapper = document.createElement("div");
			const colorBlock = document.createElement("span");
			const textBlock = document.createElement("span");

			itemWrapper.classList.add("legend-item");

			if (position === "bottom" || position === "top") {
				itemWrapper.classList.add("legend-item-inline");
				textBlock.classList.add("legend-label-nowrap");
			} else {
				itemWrapper.classList.add("legend-item-row");
			}

			// colorBlock.classList.add(CLASSES.legendColor);
			colorBlock.style.display = "inline-block";
			colorBlock.style.width = `${items[i].markerSize.widthPx}px`;
			colorBlock.style.height = `${items[i].markerSize.heightPx}px`;
			colorBlock.style.marginRight = `${items[i].markerSize.marginRightPx}px`;

			textBlock.classList.add(CLASSES.legendLabel);
			textBlock.textContent = items[i].text;
			itemWrapper.style.marginRight = `${items[i].wrapperSize.marginRightPx}px`;
			itemWrapper.append(colorBlock, textBlock);
			legendWrapper.append(itemWrapper);

			amount++;

			if (legendWrapper.offsetHeight > legendBlockHeight) {
				itemWrapper.remove();
				if (legendBlockHeight - legendWrapper.offsetHeight >= 15 && position !== "bottom" && position !== "top")
					amount = amount; //TODO: remove
				else amount -= 1;
				break;
			}
		}
		const size = {
			width: legendWrapper.offsetWidth,
			height: legendWrapper.offsetHeight
		};

		legendWrapper.remove();

		return {
			amount: amount < 0 ? 0 : amount,
			size
		};
	}

	private static getLegendWrapperEl(legendBlockWidth: number, itemsDirection: LegendItemsDirection) {
		const legendWrapper = document.createElement("div");
		legendWrapper.style.opacity = "0";
		legendWrapper.style.position = "absolute";

		legendWrapper.style.display = "flex";
		if (itemsDirection === "column") legendWrapper.classList.add("legend-block-column");
		else legendWrapper.classList.add("legend-block-row", "legend-wrapper-with-wrap");

		legendWrapper.style.maxWidth = legendBlockWidth + "px";

		return legendWrapper;
	}
}
