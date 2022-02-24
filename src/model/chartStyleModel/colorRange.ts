import { MdtChartsColorRangeItem } from "../../config/config";

export class ColorRangeManager {
    private sortedRange: MdtChartsColorRangeItem[];

    constructor(range: MdtChartsColorRangeItem[]) {
        this.sortedRange = sortColorRange(range);
    }

    getColorByValue(value: number) {
        for (let i = 0; i < this.sortedRange.length; i++) {
            const currentItem = this.sortedRange[i];
            const nextItem = this.sortedRange[i + 1];

            if (!nextItem) return currentItem.color;

            if (currentItem.value == null && value < nextItem.value) return currentItem.color;

            if (currentItem.value === value) return currentItem.color;

            if (value >= currentItem.value && value < nextItem.value) return currentItem.color;
        }
    }
}

export function sortColorRange(colorRange: MdtChartsColorRangeItem[]) {
    const range = [...colorRange];
    range.sort((a, b) => {
        if (a.value == null) return -1;
        return a.value < b.value
            ? -1
            : (a.value == b.value ? 0 : 1);
    });
    return range;
}