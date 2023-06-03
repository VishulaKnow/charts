import { getNewLegendItemWidths } from "./legendWidthCalculator";

describe('getNewWidths', () => {
    it('should return same widths if all items are fit in row', () => {
        const res = getNewLegendItemWidths({
            wrapper: { width: 100, maxRowsAmount: 1 },
            items: [
                { marginRight: 0, marginLeft: 0, width: 20 },
                { marginRight: 20, marginLeft: 0, width: 20 },
                { marginRight: 20, marginLeft: 0, width: 20 }
            ]
        });
        expect(res).toEqual([20, 20, 20]);
    });

    it('should return right amount if all elements have same width for 1 row', () => {
        const res = getNewLegendItemWidths({
            wrapper: { width: 100, maxRowsAmount: 1 },
            items: [
                { marginRight: 0, marginLeft: 0, width: 20 },
                { marginRight: 20, marginLeft: 0, width: 20 },
                { marginRight: 20, marginLeft: 0, width: 20 },
                { marginRight: 20, marginLeft: 0, width: 20 }
            ]
        });
        expect(res).toEqual([10, 10, 10, 10]);
    });

    it('should return right amount if all elements have same width for 2 rows', () => {
        const res = getNewLegendItemWidths({
            wrapper: { width: 50, maxRowsAmount: 2 },
            items: [
                { marginRight: 0, marginLeft: 0, width: 20 },
                { marginRight: 20, marginLeft: 0, width: 20 },
                { marginRight: 20, marginLeft: 0, width: 20 },
                { marginRight: 20, marginLeft: 0, width: 20 }
            ]
        });
        expect(res).toEqual([10, 10, 10, 10]);
    });

    it('should return same values if values have not same widths bu there are fits in 1 row', () => {
        const res = getNewLegendItemWidths({
            wrapper: { width: 100, maxRowsAmount: 1 },
            items: [
                { marginRight: 0, marginLeft: 0, width: 10 },
                { marginRight: 10, marginLeft: 0, width: 20 },
                { marginRight: 10, marginLeft: 0, width: 20 },
                { marginRight: 10, marginLeft: 0, width: 20 }
            ]
        });
        expect(res).toEqual([10, 20, 20, 20]);
    });

    it('should decrease only long values if there are very short values for 1 row', () => {
        const res = getNewLegendItemWidths({
            wrapper: { width: 100, maxRowsAmount: 1 },
            items: [
                { marginRight: 0, marginLeft: 0, width: 10 },
                { marginRight: 10, marginLeft: 0, width: 20 },
                { marginRight: 10, marginLeft: 0, width: 20 },
                { marginRight: 10, marginLeft: 0, width: 20 },
                { marginRight: 10, marginLeft: 0, width: 20 }
            ]
        });
        expect(res).toEqual([10, 12.5, 12.5, 12.5, 12.5]);
    });

    it('should decrease only long values if there are very short values for 1 row', () => {
        const res = getNewLegendItemWidths({
            wrapper: { width: 100, maxRowsAmount: 1 },
            items: [
                { marginRight: 0, marginLeft: 0, width: 10 },
                { marginRight: 10, marginLeft: 0, width: 90 }
            ]
        });
        expect(res).toEqual([10, 80]);
    });

    it('should decrease only long values if there are very short values for 1 row', () => {
        const res = getNewLegendItemWidths({
            wrapper: { width: 100, maxRowsAmount: 1 },
            items: [
                { marginRight: 0, marginLeft: 0, width: 10 },
                { marginRight: 10, marginLeft: 0, width: 90 },
                { marginRight: 0, marginLeft: 0, width: 40 },
            ]
        });
        expect(res).toEqual([10, 50, 30]);
    });

    it('????', () => {
        const res = getNewLegendItemWidths({
            wrapper: { width: 730, maxRowsAmount: 2 },
            items: [
                { marginRight: 0, marginLeft: 0, width: 143 },
                { marginRight: 12, marginLeft: 0, width: 271 },
                { marginRight: 12, marginLeft: 0, width: 143 },
                { marginRight: 12, marginLeft: 0, width: 143 },
                { marginRight: 12, marginLeft: 0, width: 163 },
                { marginRight: 12, marginLeft: 0, width: 421 }
            ]
        });
        expect(res).toEqual([143, 265, 143, 143, 163, 421]);
    });

    // it('????', () => {
    //     const res = getNewLegendItemWidths({
    //         wrapper: { width: 730, maxRowsAmount: 2 },
    //         items: [
    //             { marginRight: 0, marginLeft: 0, width: 243 },
    //             { marginRight: 12, marginLeft: 0, width: 371 },
    //             { marginRight: 12, marginLeft: 0, width: 243 },
    //             { marginRight: 12, marginLeft: 0, width: 243 },
    //             { marginRight: 12, marginLeft: 0, width: 263 },
    //             { marginRight: 12, marginLeft: 0, width: 521 }
    //         ]
    //     });
    //     expect(res).toEqual([143, 265, 143, 143, 163, 421]);
    // });
});