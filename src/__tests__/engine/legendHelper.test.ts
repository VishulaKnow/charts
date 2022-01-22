import { LegendHelperService } from "../../engine/features/legend/legendHelperService";
import { LegendItemsDirection } from "../../model/featuresModel/legendModel/legendCanvasModel";

describe('LegendHelperService', () => {
    describe('getLegendItemsDirection', () => {
        const service = new LegendHelperService();

        test('should return column position if legend position is left or right', () => {
            let res = service.getLegendItemsDirection("left");
            expect(res).toBe<LegendItemsDirection>("column");

            res = service.getLegendItemsDirection("right");
            expect(res).toBe<LegendItemsDirection>("column");
        });

        test('should return row position if legend position is top or bottom', () => {
            let res = service.getLegendItemsDirection("top");
            expect(res).toBe<LegendItemsDirection>("row");

            res = service.getLegendItemsDirection("bottom");
            expect(res).toBe<LegendItemsDirection>("row");
        });
    });

    describe('getLegendLabelClassByPosition', () => {
        const service = new LegendHelperService();

        test('should return class with `nowrap` position if chart is 2d and position is top', () => {
            let res = service.getLegendLabelClassByPosition("top", "2d", "legend-label");
            expect(res).toBe("legend-label legend-label-nowrap");
        });

        test('should return just class if chart is not 2d or position is not top', () => {
            let res = service.getLegendLabelClassByPosition("right", "2d", "legend-label");
            expect(res).toBe("legend-label");

            res = service.getLegendLabelClassByPosition("top", "polar", "legend-label");
            expect(res).toBe("legend-label");

            res = service.getLegendLabelClassByPosition("bottom", "polar", "legend-label");
            expect(res).toBe("legend-label");

            res = service.getLegendLabelClassByPosition("right", "polar", "legend-label");
            expect(res).toBe("legend-label");

            res = service.getLegendLabelClassByPosition("left", "polar", "legend-label");
            expect(res).toBe("legend-label");
        });
    });
});