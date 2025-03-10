interface TextVariationByNumber {
	one: string;
	twoToFour: string;
	tenToTwenty: string;
	other: string;
}

export function getTextVariationByNumber(hidedRecordsAmount: number, textVariation: TextVariationByNumber): string {
	const lastDigit = hidedRecordsAmount % 10;
	if (hidedRecordsAmount >= 10 && hidedRecordsAmount <= 20) return textVariation.tenToTwenty;
	if (lastDigit === 1) return textVariation.one;
	if (lastDigit >= 2 && lastDigit <= 4) return textVariation.twoToFour;
	return textVariation.other;
}
