import { ColorReaderClass } from "../../engine/colorReader/colorReader";
import { MdtChartsColorField, MdtChartsDataRow } from "../../config/config";
import { PolarChartModel } from "../../model/model";

describe("Donut ColorReader", () => {
    describe("getColorForArc", () => {
        const colorReader = new ColorReaderClass();

        const getPolarChart = (colorField: MdtChartsColorField, elementColors?: string[]): PolarChartModel => {
            return {
                cssClasses: [],
                style: {
                    elementColors,
                    opacity: 1
                },
                tooltip: {
                    show: true
                },
                type: "donut",
                data: {
                    valueField: {
                        format: "",
                        name: "",
                        title: ""
                    },
                    colorField
                },
                legend: {
                    markerShape: "default",
                    barViewOptions: {
                        hatch: { on: false },
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
                        width: 42
                    },
                    lineViewOptions: {
                        dashedStyles: { dashSize: 0, gapSize: 0, on: false },
                        strokeWidth: 0,
                        length: 42
                    }
                }
            };
        };

        test("should return color from dataRow if `colorField` exists in model", () => {
            const row: MdtChartsDataRow = {
                color: "red",
                value: 42
            };
            const chart = getPolarChart("color");

            const result = colorReader.getColorForArc(row, chart, 0);
            expect(result).toBe<string>("red");
        });

        test("should return color from palette if `colorField` in model is not exist", () => {
            const row: MdtChartsDataRow = {
                color: "red",
                value: 42
            };
            const chart = getPolarChart(null, ["green"]);

            const result = colorReader.getColorForArc(row, chart, 0);
            expect(result).toBe<string>("green");
        });
    });
});
