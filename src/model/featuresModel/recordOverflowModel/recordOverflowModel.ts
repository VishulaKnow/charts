import {
	RecordOverflowAlertOptions,
	RecordOverflowFunctionTextContent,
	RecordOverflowVariationTextContent
} from "../../../config/config";
import { RecordOverflowAlertModel } from "../../model";

export function getTextVariationByNumber(
	hidedRecordsAmount: number,
	textVariation: RecordOverflowVariationTextContent
): string {
	const lastDigit = hidedRecordsAmount % 10;
	if (hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20) return textVariation.tenToTwenty;
	if (lastDigit === 1) return textVariation.one;
	if (lastDigit >= 2 && lastDigit <= 4) return textVariation.twoToFour;
	return textVariation.other;
}

export function createRecordOverflowModel(
	hiddenRecordsAmount: number,
	defaultTextVariation: RecordOverflowVariationTextContent,
	options?: RecordOverflowAlertOptions
): RecordOverflowAlertModel {
	let textContent: string;
	if ((options?.textContent as RecordOverflowFunctionTextContent)?.create) {
		textContent = (options?.textContent as RecordOverflowFunctionTextContent).create(hiddenRecordsAmount);
	} else if (options?.textContent) {
		textContent = `+ ${hiddenRecordsAmount} ${getTextVariationByNumber(
			hiddenRecordsAmount,
			options.textContent as RecordOverflowVariationTextContent
		)}`;
	} else {
		textContent = `+ ${hiddenRecordsAmount} ${getTextVariationByNumber(hiddenRecordsAmount, defaultTextVariation)}`;
	}

	return hiddenRecordsAmount === 0
		? { show: false }
		: {
				show: true,
				positionAttrs: {
					bottom: "0",
					right: "0"
				},
				textContent
		  };
}
