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
    const getBoundingWithOne = (key: keyof ElBounding, value: number) => {
        const blockBounding: ElBounding = {
            left: ignoredValue,
            bottom: ignoredValue,
            height: ignoredValue,
            top: ignoredValue,
            width: ignoredValue
        }
        blockBounding[key] = value;
        return blockBounding;
    }

    const service = new NewTooltipServiceClass();

    describe('getTooltipByWindow with parentBlock', () => {
        test('should return left point equal to `-(left of parent block)` if left of tooltip is less', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", -50);
            const windowSize: Sizable = getIgnoredSize(true);
            const blockBounding: ElBounding = getBoundingWithOne("left", 10);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.left).toBe(-blockBounding.left);
        });

        test('should return left point equal to left of preCoordinate if left of tooltip is less', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 20);
            const windowSize: Sizable = getIgnoredSize(true);
            const blockBounding: ElBounding = getBoundingWithOne("left", 10);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.left).toBe(preCoordinate.left);
        });

        test('should return left point equal to `(window width - tooltip width)` if right of tooltip is bigger', () => {
            const tooltipBounding: Sizable = getSizeWithOne("width", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 20);
            const windowSize: Sizable = getSizeWithOne("width", 90);
            const blockBounding: ElBounding = getBoundingWithOne("left", 30);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.left).toBe(-8); // 50 + 20 + 30 > 90 => 90 - 30 - 50 - scrollPad(18)
        });

        test('should return left point equal to left of preCoordinate if right of tooltip is less than window width', () => {
            const tooltipBounding: Sizable = getSizeWithOne("width", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 20);
            const windowSize: Sizable = getSizeWithOne("width", 200);
            const blockBounding: ElBounding = getBoundingWithOne("left", 30);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.left).toBe(preCoordinate.left); // 50 + 20 + 30 < 200
        });

        test('should return top point equal to `-(top of parent block)` if top of tooltip is less', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", -40);
            const windowSize: Sizable = getIgnoredSize(true);
            const blockBounding: ElBounding = getBoundingWithOne("top", -20);

            let res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(-blockBounding.top);

            blockBounding.top = -60;
            res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(-blockBounding.top); // 60 by blockBounding = 0 by window

            blockBounding.top = -100;
            preCoordinate.top = 20;
            res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(-blockBounding.top);

            blockBounding.top = -10;
            preCoordinate.top = 5;
            res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(-blockBounding.top);
        });

        test('should return top point equal top of preCoordinate if top of tooltip is bigger', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", 20);
            const windowSize: Sizable = getIgnoredSize(true);
            const blockBounding: ElBounding = getBoundingWithOne("top", 100);

            let res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(preCoordinate.top);

            preCoordinate.top = -99;
            res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(preCoordinate.top);
        });

        test('should return top point equal to `(winHeight - tooltipHeight)` if bottom of tooltip is bigger than window height', () => {
            const tooltipBounding: Sizable = getSizeWithOne("height", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", 90);
            const windowSize: Sizable = getSizeWithOne("height", 200);
            const blockBounding: ElBounding = {
                left: ignoredValue,
                bottom: 210,
                height: 110,
                top: 100,
                width: ignoredValue
            }

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(50); // 110 - 50 - (210 - 200)
        });

        test('should return top point equal to top of preCoordinate if bottom of tooltip is less than height of window', () => {
            const tooltipBounding: Sizable = getSizeWithOne("height", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", 90);
            const windowSize: Sizable = getSizeWithOne("height", 300);
            const blockBounding: ElBounding = {
                left: ignoredValue,
                bottom: 210,
                height: 110,
                top: 100,
                width: ignoredValue
            }

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize, blockBounding);
            expect(res.top).toBe(preCoordinate.top); // 90 + 50 + 100 < 300
        });
    });

    describe('getTooltipByWindow without parentBlock', () => {
        test('should return left point equal to 0 if left of tooltip is less', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", -50);
            const windowSize: Sizable = getIgnoredSize(true);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize);
            expect(res.left === 0).toBe(true); // negative zero jest not matching with simple zero
        });

        test('should return left point equal to left of preCoordinate if left of tooltip is bigger than 0', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 20);
            const windowSize: Sizable = getIgnoredSize(true);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize);
            expect(res.left).toBe(preCoordinate.left);
        });

        test('should return left point equal to `(window width - tooltip width)` if right of tooltip is bigger', () => {
            const tooltipBounding: Sizable = getSizeWithOne("width", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 60);
            const windowSize: Sizable = getSizeWithOne("width", 100);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize);
            expect(res.left).toBe(32); // 60 + 50 > 100 => 100 - 50 - scrollPad(18)
        });

        test('should return left point equal to left of preCoordinate if right of tooltip is less than window width', () => {
            const tooltipBounding: Sizable = getSizeWithOne("width", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("left", 20);
            const windowSize: Sizable = getSizeWithOne("width", 200);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize);
            expect(res.left).toBe(preCoordinate.left); // 50 + 20 < 200
        });

        test('should return top point equal to 0 if top of tooltip is less than 0', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", -40);
            const windowSize: Sizable = getIgnoredSize(true);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize);
            expect(res.top === 0).toBe(true);
        });

        test('should return top point equal top of preCoordinate if top of tooltip is bigger than 0', () => {
            const tooltipBounding: Sizable = getIgnoredSize();
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", 20);
            const windowSize: Sizable = getIgnoredSize(true);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize);
            expect(res.top).toBe(preCoordinate.top);
        });

        test('should return top point equal to `(winHeight - tooltipHeight)` if bottom of tooltip is bigger than window height', () => {
            const tooltipBounding: Sizable = getSizeWithOne("height", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", 90);
            const windowSize: Sizable = getSizeWithOne("height", 100);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize);
            expect(res.top).toBe(50); // 90 + 50 > 100 => 100 - 50
        });

        test('should return top point equal to top of preCoordinate if bottom of tooltip is less than height of window', () => {
            const tooltipBounding: Sizable = getSizeWithOne("height", 50);
            const preCoordinate: TooltipPreCoordinate = getPosWithOne("top", 90);
            const windowSize: Sizable = getSizeWithOne("height", 300);

            const res = service.getTooltipByWindow(tooltipBounding, preCoordinate, windowSize);
            expect(res.top).toBe(preCoordinate.top); // 90 + 50 < 300
        });
    });
});