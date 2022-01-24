import { ChartStyleConfig } from "../../designer/designerConfig";
import { MdtChartsTwoDimensionalChart, TwoDimValueField } from "../../config/config";
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

        const getChart = (fieldsColors?: string[]): MdtChartsTwoDimensionalChart => {
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

        const valueField = (color: string = null): TwoDimValueField => {
            return {
                format: null,
                name: null,
                title: null,
                color
            }
        }

        const fieldsAmounts = [1, 5, 2];

        describe('without colors from config', () => {
            test('should return first colors from palette if chart is first', () => {
                const chart = getChart();
                const result = service.getChartColors(chart, styleConfig, [8], 0);
                expect(result).toEqual(expectedColors);
            });

            test('should return first colors from palette if chart is 1st and charts amount is more than 1', () => {
                const chart = getChart();
                const result = service.getChartColors(chart, styleConfig, fieldsAmounts, 0);
                expect(result).toEqual(expectedColors.slice(0, 1));
            });

            test('should return 5 colors from palette with skip 1 color if chart is 2nd and has 5 value fields and first chart has 1 value field', () => {
                const chart = getChart();
                const result = service.getChartColors(chart, styleConfig, fieldsAmounts, 1);
                expect(result).toEqual(expectedColors.slice(1, 6));
            });

            test('should return 2 colors from palette with skip 6 colors if chart is 3rd and has 2 value fields and firsts charts has 6 value field together', () => {
                const chart = getChart();
                const result = service.getChartColors(chart, styleConfig, fieldsAmounts, 2);
                expect(result).toEqual(expectedColors.slice(6, 8));
            });
        });

        describe('with colors from config', () => {
            test('should return colors from config if all value fields has colors', () => {
                const valueFieldsColors = ["red"];
                const chart = getChart(valueFieldsColors);

                const result = service.getChartColors(chart, styleConfig, fieldsAmounts, 0);
                expect(result).toEqual(valueFieldsColors);
            });

            test('should return colors from config if all value fields has colors and chart is not first', () => {
                const valueFieldsColors = ["red", "green", "blue", "aqua", "cyan"];
                const chart = getChart(valueFieldsColors);

                const result = service.getChartColors(chart, styleConfig, fieldsAmounts, 1);
                expect(result).toEqual(valueFieldsColors);
            });
        });

        describe('partial with colors from config (config color just replace generated color. It is not change generated colors order)', () => {
            test('should return color from config and 2nd generated color if for 2nd value field color is not set', () => {
                let chart = getChart(["red"]);
                let result = service.getChartColors(chart, styleConfig, [2, 6], 0);
                expect(result).toEqual(["red", expectedColors[1]]); // 1 - not 0. color with index equal 0 is just ignored

                chart = getChart([null, "red"]);
                result = service.getChartColors(chart, styleConfig, [2, 6], 0);
                expect(result).toEqual([expectedColors[0], "red"]);
            });

            test('should return color from config and 2nd generated color if for 2nd value field color is not set', () => {
                const vfColors = ["red", null, "blue", "", undefined];
                const chart = getChart(vfColors);
                const generatedColors = expectedColors.slice(1, 6);

                const result = service.getChartColors(chart, styleConfig, fieldsAmounts, 1);
                expect(result).toEqual([
                    vfColors[0],
                    generatedColors[1],
                    vfColors[2],
                    generatedColors[3],
                    generatedColors[4]
                ])
            });
        });
    });
});