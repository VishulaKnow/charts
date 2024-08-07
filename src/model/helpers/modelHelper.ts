export class ModelHelper {
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

        let score = 0;
        const upperLetterScore = 1;
        const lowerLetterScore = 0.8;
        const digitScore = 0.75;
        const otherSymbolScore = 0.52;
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