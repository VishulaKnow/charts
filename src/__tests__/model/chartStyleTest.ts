import { Color } from "d3-color";
import { ChartStyleModel } from "../../model/chartStyleModel";

const colorsJson = require('../../assets/materialColors.json').colors;

function getColorHex(colors: Color[]): string[] {
    let hexes: string[] = [];
    colors.forEach(color => {
        hexes.push(color.hex());
    })
    return hexes;
}

describe('get2DChartStyle.elementColors', () => {
    const chartPalette = colorsJson;

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

// describe('get2DChartStyle.elementColors', () => {
//     const chartPalette = colorsJson;

//     describe('from get2DChartStyle elementColors test for grouped charts', () => {
//         test('should return first 3 colors', () => {
//             const result = ChartStyleModel.get2DChartStyle(chartPalette, 1, 'bar', [3], 0, false).elementColors;
//             expect(getColorHex(result)).toEqual(['#f44336', '#e91e63', '#9c27b0']);
//         });

//         test('should return [4..7] colors', () => {
//             const result = ChartStyleModel.get2DChartStyle(chartPalette, 2, 'bar', [3, 4], 1, false).elementColors;
//             expect(getColorHex(result)).toEqual(['#673ab7', '#3f51b5', '#2196f3', '#03a9f4']);
//         });

//         test('should return [8] colors', () => {
//             const result = ChartStyleModel.get2DChartStyle(chartPalette, 3, 'bar', [3, 4, 1], 2, false).elementColors;
//             expect(getColorHex(result)).toEqual(['#00bcd4']);
//         });
//     });

//     describe('from get2DChartStyle elementColors test for segmented charts', () => {
//         test('should return red-500, red-400, red-300 colors', () => {
//             const result = ChartStyleModel.get2DChartStyle(chartPalette, 1, 'bar', [3], 0, true).elementColors;
//             expect(getColorHex(result)).toEqual(['#f44336', '#ef5350', '#e57373']);
//         });

//         test('should return red-500 colors', () => {
//             const result = ChartStyleModel.get2DChartStyle(chartPalette, 3, 'bar', [1, 1, 4], 0, true).elementColors;
//             expect(getColorHex(result)).toEqual(['#f44336']);
//         });

//         test('should return purple-500, purple-400, purple-300, purple-200 colors', () => {
//             const result = ChartStyleModel.get2DChartStyle(chartPalette, 3, 'bar', [1, 1, 4], 2, true).elementColors;
//             expect(getColorHex(result)).toEqual(['#9c27b0', '#ab47bc', '#ba68c8', '#ce93d8']);
//         });
//     });
// });

// describe('should return first N colors for polar chart', () => {
//     const chartPalette = colorsJson;

//     test('should return first 3 colors', () => {
//         const result = ChartStyleModel.getChartStyle(chartPalette, 3).elementColors;
//         expect(getColorHex(result)).toEqual(['#f44336', '#e91e63', '#9c27b0']);
//     });

//     test('should return first 7 colors', () => {
//         const result = ChartStyleModel.getChartStyle(chartPalette, 7).elementColors;
//         expect(getColorHex(result)).toEqual(['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4']);
//     });
// });

// describe('test getting base color from simple colors (black, white etc.)', () => {
//     const chartPalette = colorsJson;

//     test('should return black and white', () => {
//         const result = ChartStyleModel.get2DChartStyle(chartPalette, 2, 'bar', [21, 2], 1, false).elementColors;
//         expect(getColorHex(result)).toEqual(['#ffffff', '#000000']);
//     });
// });