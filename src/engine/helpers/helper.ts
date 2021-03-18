
export class Helper {

    public static getCssClassesLine(cssClasses: string[]): string {
        return '.' + cssClasses.join('.');
    }

    public static getCssClassesArray(cssClass: string): string[] {
        return cssClass.split(' ');
    }

    public static getCssClassesWithElementIndex(cssClasses: string[], index: number): string[] {
        return cssClasses.concat([`chart-element-${index}`]);
    }

    public static getTranslateNumbers(transformValue: string): [number, number] {
        if (!transformValue)
            return [0, 0];

        const translateNumbers = transformValue.substring(10, transformValue.length - 1).split(', ');
        const translateX = parseFloat(translateNumbers[0]);
        const translateY = parseFloat(translateNumbers[1]);

        return [translateX, translateY];
    }

    public static getSumOfNumeric(numbers: number[]): number {
        return numbers.reduce((acc, value) => acc + value, 0);
    }

    public static parseFormattedToNumber(value: string, rankSpliter: string): number {
        return parseFloat(value.replace(rankSpliter, '.').split(/\s/).join(''));
    }

    public static calcDigitsAfterDot(value: number): number {
        const valueInString = value.toString();
        const dotIndex = valueInString.lastIndexOf('.') === -1 ? valueInString.length : valueInString.lastIndexOf('.') + 1;
        return valueInString.substring(dotIndex).length;
    }

    public static checkDomainsEquality(oldDomain: string[], newDomain: string[]): boolean {
        if (oldDomain.length !== newDomain.length)
            return false;

        let isEqual = true;
        oldDomain.forEach((keyValue, index) => {
            if (keyValue !== newDomain[index])
                isEqual = false;
        });
        return isEqual;
    }

    public static getValueOrZero(value: number): number {
        return value > 0 ? value : 0;
    }
}