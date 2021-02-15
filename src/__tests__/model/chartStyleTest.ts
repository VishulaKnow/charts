import { Color } from "d3-color";
import { ChartStyleModel } from "../../model/chartStyleModel";

function getColorHex(colors: Color[]): string[] {
    let hexes: string[] = [];
    colors.forEach(color => {
        hexes.push(color.hex());
    })
    return hexes;
}

describe('get2DChartStyle.elementColors', () => {
    describe('from get2DChartStyle elementColors test for grouped charts', () => {
        test('should [0, 9] colors', () => {
            const result = ChartStyleModel.get2DChartStyle(1, 'bar', [2], 0, false).elementColors;
            expect(getColorHex(result)).toEqual(['#f44336', '#4caf50']);
        });

        test('should [0, 6, 12] colors', () => {
            const result = ChartStyleModel.get2DChartStyle(1, 'bar', [3], 0, false).elementColors;
            expect(getColorHex(result)).toEqual(['#f44336', '#03a9f4', '#ffeb3b']);
        });
    });
});