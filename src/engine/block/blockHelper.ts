import { BlockMargin } from "../../model/model";
import { Helper } from "../helpers/helper";
import { Size } from "../../config/config";

export interface ClipPathAttributes {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class BlockHelper {
	public static getClipPathAttributes(blockSize: Size, margin: BlockMargin): ClipPathAttributes {
		const outSize = 9;
		return {
			x: margin.left - outSize,
			y: margin.top - outSize,
			width: Helper.getValueOrZero(blockSize.width - margin.left - margin.right) + outSize * 2,
			height: Helper.getValueOrZero(blockSize.height - margin.top - margin.bottom) + outSize * 2
		};
	}

	public static getFormattedCssClassesForWrapper(cssClasses: string[]): string[] {
		const wrapperClasses: string[] = [];
		cssClasses.forEach((cssClass) => {
			wrapperClasses.push(cssClass + "-wrapper");
		});

		return wrapperClasses;
	}
}
