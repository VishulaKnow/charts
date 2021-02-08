import { ChartStyleModel } from "../../model/chartStyleModel";
const colors = require('../../assets/colors.json');

describe('get2DChartStyle.elementColors', () => {
    const chartPalette = colors.colors;

    describe('from get2DChartStyle elementColors test for grouped charts', () => {
        test('should return first 3 colors', () => {
            const result = ChartStyleModel.get2DChartStyle(chartPalette, 1, 'bar', [3], 0, false).elementColors;
            expect(result).toEqual(['#f44336', '#E91E63', '#9C27B0']);
        });

        test('should return second 3 colors', () => {
            const result = ChartStyleModel.get2DChartStyle(chartPalette, 2, 'bar', [3, 3], 1, false).elementColors;
            expect(result).toEqual(['#673AB7', '#3F51B5', '#2196F3']);
        });

        test('should return color no. 4', () => {
            const result = ChartStyleModel.get2DChartStyle(chartPalette, 2, 'bar', [3, 1], 1, false).elementColors;
            expect(result).toEqual(['#673AB7']);
        });

        test('should return colors [13..15]', () => {
            const result = ChartStyleModel.get2DChartStyle(chartPalette, 2, 'bar', [4, 4, 4, 3], 3, false).elementColors;
            expect(result).toEqual(['#FFEB3B', '#FFC107', '#FF9800']);
        });
    });

    describe('from get2DChartStyle elementColors test for segmented charts', () => {
        test('should return colors [1, 20, 39]', () => {
            const result = ChartStyleModel.get2DChartStyle(chartPalette, 1, 'bar', [3], 0, true).elementColors;
            expect(result).toEqual(['#f44336', '#ffebee', '#ffcdd2']);
        });

        test('should return colors [3, 22, 41]', () => {
            const result = ChartStyleModel.get2DChartStyle(chartPalette, 3, 'bar', [1, 1, 3], 2, true).elementColors;
            expect(result).toEqual(['#9C27B0', '#F3E5F5', '#E1BEE7']);
        });

        test('should return colors [5]', () => {
            const result = ChartStyleModel.get2DChartStyle(chartPalette, 3, 'bar', [1, 1, 5, 1, 1], 4, true).elementColors;
            expect(result).toEqual(['#3F51B5']);
        });
    });
})