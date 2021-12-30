import { ChartStyleConfig } from "../../designer/designerConfig";
import { TwoDimensionalChart, TwoDimValueField } from "../../config/config";
import { TwoDimensionalChartStyleService } from "../../model/chartStyleModel/TwoDimensionalChartStyleModel";

describe('TwoDimensionalChartStyleService', () => {
    describe('getChartColors', () => {
        const service = new TwoDimensionalChartStyleService();
        const styleConfig: ChartStyleConfig = {
            baseColors: ['#209de3', '#ff3131', '#ffba00', '#20b078']
        }
        const expectedColors = [
            "#209de3",
            "#5a81b5",
            "#946587",
            "#ce4958",
            "#ff402c",
            "#ffa209",
            "#9fb633",
            "#20b078"
        ];

        const getChart = (fieldsColors?: string[]): TwoDimensionalChart => {
            return {
                type: "bar",
                embeddedLabels: null,
                isSegmented: false,
                tooltip: null,
                markers: null,
                data: {
                    valueFields: fieldsColors ? fieldsColors.map(fc => valueField(fc)) : [valueField()]
                }
            }
        }

        const valueField = (color = ""): TwoDimValueField => {
            return {
                format: null,
                name: null,
                title: null,
                color
            }
        }

        describe('without colors from config', () => {
            test('should return first colors from palette if chart is first', () => {
                const chart = getChart();
                const result = service.getChartColors(chart, styleConfig, [8], 0);
                expect(result).toEqual(expectedColors);
            });

            test('should return first colors from palette if chart is 1st and charts amount is more than 1', () => {
                const chart = getChart();
                const result = service.getChartColors(chart, styleConfig, [1, 5, 2], 0);
                expect(result).toEqual(expectedColors.slice(0, 1));
            });

            test('should return 5 colors from palette with skip 1 color if chart is 2nd and has 5 value fields and first chart has 1 value field', () => {
                const chart = getChart();
                const result = service.getChartColors(chart, styleConfig, [1, 5, 2], 1);
                expect(result).toEqual(expectedColors.slice(1, 6));
            });

            test('should return 2 colors from palette with skip 6 colors if chart is 3rd and has 2 value fields and firsts charts has 6 value field together', () => {
                const chart = getChart();
                const result = service.getChartColors(chart, styleConfig, [1, 5, 2], 2);
                expect(result).toEqual(expectedColors.slice(6, 8));
            });
        });
    });
});