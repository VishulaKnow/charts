import { DomHelper } from "../../engine/helpers/domHelper";

export class ModelHelper {
    private static readonly defaultBaseFontSize = 13;
    private static baseFontSize: number

    private static getBaseFontSize(propertyName: string) {
        if (!this.baseFontSize)
            this.baseFontSize = this.getFontSizeCssValue(propertyName, this.defaultBaseFontSize);
        return this.baseFontSize;
    }

    public static getFontSizeCssValue(propertyName: string, defaultValue: number): number {
        const value = parseInt(DomHelper.getCssPropertyValue(document.documentElement, propertyName));
        return isNaN(value) ? defaultValue : value;
    }

    public static getSum(items: number[]): number {
        return items.reduce((acc, item) => acc + item, 0);
    }

    public static getUniqueValues(values: string[]): string[] {
        const uniqueValues = values.filter((keyValue, index, self) => self.indexOf(keyValue) === index);

        return uniqueValues;
    }

    public static getStringScore(word: string): number {
        // lower case letter width ~ 0.8 from upper case width.
        // Number width == lower case letter width

        const fontSize = this.getBaseFontSize('--chart-base-font-size')
        let score = 0;
        const upperLetterScore = fontSize / 10;
        const lowerLetterScore = fontSize / 14;
        const digitScore = fontSize / 15;
        const otherSymbolScore = fontSize / 23;
        const specialSmallSymbols = [",", ".", " "]
        for (let i = 0; i < word.length; i++) {
            if (parseFloat(word[i]).toString() !== word[i] && !specialSmallSymbols.includes(word[i]) && word[i].trim().length > 0) {
                if (word[i].toUpperCase() === word[i]) score += upperLetterScore;
                else score += lowerLetterScore;
            } else if (word[i] == parseInt(word[i]).toString()) score += digitScore;
            else score += otherSymbolScore;
        }

        return score;
    }
}