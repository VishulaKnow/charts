import { ElBounding, NewTooltipServiceClass, Sizable, TooltipPreCoordinate } from "./newTooltipService";

const ignoredValue = 0;
const ignoredBigvalue = 1000000;

describe('newTooltipService', () => {
    const getIgnoredSize = (big?: boolean): Sizable => {
        return {
            height: big ? ignoredBigvalue : ignoredValue,
            width: big ? ignoredBigvalue : ignoredValue
        }
    }
    const getSizeWithOne = (key: keyof Sizable, value: number) => {
        const size = getIgnoredSize();
        size[key] = value;
        return size;
    }
    const getPosWithOne = (key: keyof TooltipPreCoordinate, value: number) => {
        const coordinate: TooltipPreCoordinate = {
            left: ignoredValue,
            top: ignoredValue
        };
        coordinate[key] = value;
        return coordinate;
    }
    const service = new NewTooltipServiceClass();

    describe('getTooltipByWindow with parentBlock', () => {
        test('should return left point equal to `-(left of parent block)` if left of tooltip is less', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", -50);
            const windowSize: Sizable = getIgnoredSize(true);
            const blockBounding: ElBounding = {
                left: 10,
                bottom: ignoredValue,
                height: ignoredValue,
                top: ignoredValue,
                width: ignoredValue
            }

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.left).toBe(-blockBounding.left);
        });

        test('should return left point equal to left of preCoordinate if left of tooltip is less', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 20);
            const windowSize: Sizable = getIgnoredSize(true);
            const blockBounding: ElBounding = {
                left: 10,
                bottom: ignoredValue,
                height: ignoredValue,
                top: ignoredValue,
                width: ignoredValue
            }

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.left).toBe(preCoordinate.left);
        });

        test('should return left point equal to `(window width - tooltip width)` if right of tooltip is bigger', () => {
            const tooltipBounding: Sizable = getSizeWithOne("width", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 20);
            const windowSize: Sizable = getSizeWithOne("width", 90);
            const blockBounding: ElBounding = {
                left: 30,
                bottom: ignoredValue,
                height: ignoredValue,
                top: ignoredValue,
                width: ignoredValue
            }

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.left).toBe(-8); // 50 + 20 + 30 > 90 => 90 - 30 - 50 - scrollPad(18)
        });

        test('should return left point equal to left of preCoordinate if right of tooltip is less than window width', () => {
            const tooltipBounding: Sizable = getSizeWithOne("width", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 20);
            const windowSize: Sizable = getSizeWithOne("width", 200);
            const blockBounding: ElBounding = {
                left: 30,
                bottom: ignoredValue,
                height: ignoredValue,
                top: ignoredValue,
                width: ignoredValue
            }

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.left).toBe(preCoordinate.left); // 50 + 20 + 30 < 200
        });

        test('should return top point equal to `-(top of parent block)` if top of tooltip is less', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", -40);
            const windowSize: Sizable = getIgnoredSize(true);
            const blockBounding: ElBounding = {
                left: ignoredValue,
                bottom: ignoredValue,
                height: ignoredValue,
                top: -20,
                width: ignoredValue
            }

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(-blockBounding.top);
        });
    });
});