
// import { ChartStyleConfig } from "../../designer/designerConfig";
// import { ChartStyleModel } from "../../model/chartStyleModel";

// function getColorHex(colors: string[]): string[] {
//     let hexes: string[] = [];
//     colors.forEach(color => {
//         hexes.push(color);
//     });
//     return hexes;
// }

// describe('get2DChartStyle.elementColors', () => {
//     const chartStyleConfig: ChartStyleConfig = {
//         baseColor: 'red',
//         step: 1
//     }

//     beforeEach(() => {
//         chartStyleConfig.step = 1;
//         chartStyleConfig.baseColor = 'red';
//     });

//     describe('from get2DChartStyle elementColors test for grouped charts', () => {
//         test('should [0, 9] colors', () => {
//             chartStyleConfig.step = 9;
//             const result = ChartStyleModel.get2DChartStyle(1, 'bar', [2], 0, false, chartStyleConfig).elementColors;
//             expect(getColorHex(result)).toEqual(['#f44336', '#4caf50']);
//         });

//         test('should [0, 6, 12] colors', () => {
//             chartStyleConfig.step = 6
//             const result = ChartStyleModel.get2DChartStyle(1, 'bar', [3], 0, false, chartStyleConfig).elementColors;
//             expect(getColorHex(result)).toEqual(['#f44336', '#03a9f4', '#ffeb3b']);
//         });

//         test('should [2, 8, 14] colors', () => {
//             chartStyleConfig.step = 6;
//             chartStyleConfig.baseColor = 'purple';
//             const result = ChartStyleModel.get2DChartStyle(1, 'bar', [3], 0, false, chartStyleConfig).elementColors;
//             expect(getColorHex(result)).toEqual(['#9c27b0', '#009688', '#ff9800']);
//         });
//     });

//     describe('from getChartStyle elementColors test for donut chart', () => {
//         test('should return [0, 1, 2, 3] colors', () => {
//             const result = ChartStyleModel.getChartStyle(4, chartStyleConfig).elementColors;
//             expect(getColorHex(result)).toEqual(['#f44336', '#e91e63', '#9c27b0', '#673ab7']);
//         });

//         test('should return [0, 1, 2, 3] colors with step 15', () => {
//             chartStyleConfig.step = 15;
//             const result = ChartStyleModel.getChartStyle(4, chartStyleConfig).elementColors;
//             expect(getColorHex(result)).toEqual(['#f44336', '#ff5722', '#ff9800', '#ffc107']);
//         });

//         test('should return [1, 5, 9, 13, 1, 5, 9] colors', () => {
//             chartStyleConfig.step = 4;
//             chartStyleConfig.baseColor = 'pink';
//             const result = ChartStyleModel.getChartStyle(7, chartStyleConfig).elementColors;
//             expect(getColorHex(result)).toEqual(['#e91e63', '#2196f3', '#4caf50', '#ffc107', '#e91e63', '#2196f3', '#4caf50']);
//         });
//     });
// });