import { ChartStyleModel } from "../../model/chartStyleModel";
const colors = require('../../assets/colors.json');

describe('get2DChartStyle test for grouped charts', () => {
    const chartPalette = colors.colors;
    
    test('should return first 3 colors', () => {
        const result = ChartStyleModel.get2DChartStyle(chartPalette, 1, 'bar', [3], 0).elementColors;
        expect(result).toEqual(['#f44336', '#E91E63', '#9C27B0']);
    });

    test('should return second 3 colors', () => {
        const result = ChartStyleModel.get2DChartStyle(chartPalette, 2, 'bar', [3, 3], 1).elementColors;
        expect(result).toEqual(['#673AB7', '#3F51B5', '#2196F3']);
    });

    test('should return color no. 4', () => {
        const result = ChartStyleModel.get2DChartStyle(chartPalette, 2, 'bar', [3, 1], 1).elementColors;
        expect(result).toEqual(['#673AB7']);
    });

    test('should return colors [13..15]', () => {
        const result = ChartStyleModel.get2DChartStyle(chartPalette, 2, 'bar', [4, 4, 4, 3], 3).elementColors;
        expect(result).toEqual(['#FFEB3B', '#FFC107', '#FF9800']);
    });
});