import { Size } from "../../config/config";
import { DonutHelper } from "../../engine/polarNotation/donut/DonutHelper";
import { BlockMargin, DonutChartSettings } from "../../model/model";

describe('DonutHelper', () => {
    describe('getThickness', () => {
        const getSize = (width: number, height: number): Size => ({ width, height });
        const getMargin = (margin: number): BlockMargin => ({ top: margin, left: margin, right: margin, bottom: margin });
        const getDefaultDonutSettings = (): DonutChartSettings => ({
            padAngle: 0,
            thickness: {
                max: 60,
                min: 40,
                unit: "px",
                value: null
            },
            aggregator: { margin: 0, text: "" }
        })

        test('should return max thickness if donut block size is greater than 400px', () => {
            const size = getSize(1000, 500);
            const margin = getMargin(10);
            const donutSettings = getDefaultDonutSettings();

            const res = DonutHelper.getThickness(donutSettings, size, margin);
            expect(res).toBe(60);
        });

        test('should return max thickness if donut block size is less than 400px', () => {
            const size = getSize(1000, 500);
            const margin = getMargin(60);
            const donutSettings = getDefaultDonutSettings();

            const res = DonutHelper.getThickness(donutSettings, size, margin);
            expect(res).toBe(40);
        });

        test('should return max thickness if useFixed is true', () => {
            const size = getSize(1000, 500);
            const margin = getMargin(60);
            const donutSettings = getDefaultDonutSettings();

            donutSettings.thickness.value = 50;

            const res = DonutHelper.getThickness(donutSettings, size, margin);
            expect(res).toBe(50);
        });

        test('should return thickness value by percent if unit is `%`', () => {
            const size = getSize(1000, 500);
            const margin = getMargin(50);
            const donutSettings = getDefaultDonutSettings();

            donutSettings.thickness.unit = "%";
            donutSettings.thickness.value = 50;

            const res = DonutHelper.getThickness(donutSettings, size, margin);
            expect(res).toBe(100); // (500 - 50 * 2) / 2 * 0.5
        });
    });
});