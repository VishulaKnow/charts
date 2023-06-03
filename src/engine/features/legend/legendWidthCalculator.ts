type SizePx = number;

interface WidthCalculatorConfig {
    wrapper: LegendWrapperConfig;
    items: LegendItemConfig[];
}

export function getNewLegendItemWidths(config: WidthCalculatorConfig): SizePx[] {
    const wrapper = new LegendWrapper(config.wrapper);
    const collection = new LegendItemCollection(config.items.map(i => new LegendItem(i)));

    return getNewWidths(collection, wrapper);
}

function getNewWidths(collection: LegendItemCollection, wrapper: LegendWrapper) {
    let extra = collection.getTotalWidth() - wrapper.getMaxWidth();
    if (extra <= 0) {
        return fixWidthsByLinePos(collection, wrapper);
    }

    const avgWidth = (wrapper.getMaxWidth() - collection.getTotalMarginSizes()) / collection.getItemsAmount();
    const biggerThanAvg = collection.getItemsWithWidthBiggerThan(avgWidth);

    let avgExtra = extra / biggerThanAvg.length;
    biggerThanAvg.forEach((item, index) => {
        const avgDiff = item.getCurrentWidth() - avgWidth;
        const decreaseBy = avgDiff < avgExtra ? avgDiff : avgExtra;
        item.decreaseBy(decreaseBy);
        extra -= decreaseBy;
        avgExtra = extra / (biggerThanAvg.length - index - 1);
    });

    return fixWidthsByLinePos(collection, wrapper);
}

function fixWidthsByLinePos(collection: LegendItemCollection, wrapper: LegendWrapper) {
    const byRows: LegendItemCollection[] = [];
    let currentRow: LegendItem[] = [];
    collection.items.forEach((item, i) => {
        const currentRowSum = currentRow.reduce((acc, i) => acc + i.getCurrentTotalWidth(), 0);
        if (currentRowSum + item.getWidthWithoutRightMargin() <= wrapper.getWidthOfOneLine()) {
            currentRow.push(item);
        } else {
            byRows.push(new LegendItemCollection(currentRow));
            currentRow = [item];
        }
        if (i === collection.items.length - 1) byRows.push(new LegendItemCollection(currentRow));
    });

    if (byRows.length <= wrapper.getMaxRowsCount()) return collection.getActualWidths();

    const result: SizePx[] = [];

    for (let i = 0; i < byRows.length - 1; i++) {
        const top = byRows[i];
        const bottom = byRows[i + 1];

        const topFreeSpace = wrapper.getWidthOfOneLine() - top.getTotalWidth();
        const firstOfBottom = bottom.getFirstItem();
        if (topFreeSpace / firstOfBottom.getCurrentTotalWidth() > 0.51 || i === byRows.length - 2) {
            const fromBottom = bottom.shift();
            top.push(fromBottom);
            result.push(...getNewWidths(top, new LegendWrapper({ maxRowsAmount: 1, width: wrapper.getWidthOfOneLine() })));
        }
    }
    return result;
}

interface LegendWrapperConfig {
    maxRowsAmount: number;
    width: SizePx;
}

class LegendWrapper {
    constructor(private config: LegendWrapperConfig) { }

    getMaxWidth() {
        return this.config.width * this.config.maxRowsAmount;
    }

    getWidthOfOneLine() {
        return this.config.width;
    }

    getMaxRowsCount() {
        return this.config.maxRowsAmount;
    }
}

export interface LegendItemConfig {
    marginLeft: SizePx;
    marginRight: SizePx;
    width: SizePx;
}

class LegendItem {
    private width: SizePx;

    constructor(private config: LegendItemConfig) {
        this.width = this.config.width;
    }

    getCurrentTotalWidth() {
        return this.width + this.getTotalMarginSize();
    }

    getWidthWithoutRightMargin() {
        return this.width + this.config.marginLeft;
    }

    decreaseBy(by: SizePx) {
        this.width -= by;
    }

    getCurrentWidth() {
        return this.width;
    }

    getTotalMarginSize() {
        return this.config.marginLeft + this.config.marginRight;
    }
}

class LegendItemCollection {
    constructor(public readonly items: LegendItem[]) { }

    getTotalWidth() {
        return this.items.reduce((acc, item) => acc + item.getCurrentTotalWidth(), 0);
    }

    getActualWidths() {
        return this.items.map(item => item.getCurrentWidth());
    }

    getTotalMarginSizes() {
        return this.items.reduce((acc, item) => acc + item.getTotalMarginSize(), 0);
    }

    getItemsAmount() {
        return this.items.length;
    }

    getItemsWithWidthBiggerThan(thanWidth: SizePx) {
        return this.items
            .filter(item => item.getCurrentWidth() > thanWidth)
            .sort((a, b) => a.getCurrentWidth() - b.getCurrentWidth());
    }

    getFirstItem() {
        return this.items[0];
    }

    shift() {
        return this.items.shift();
    }

    push(item: LegendItem) {
        this.items.push(item);
    }
}