import { MdtChartsCardsChange, MdtChartsDataRow } from "../../config/config";
import { CardsChangeService, DEFAULT_CARD_CHANGE_COLORS, DEFAULT_CARD_FONT_COLOR } from "../../model/notations/cards/cardsChangeService";

describe('CardsChangeService', () => {
    const getData = (changeValue: number): MdtChartsDataRow => ({
        change: changeValue
    });
    const getOptions = (extend?: Partial<MdtChartsCardsChange>): MdtChartsCardsChange => ({
        value: {
            field: "change"
        },
        description: "description",
        ...extend
    });

    describe('getChangeModel', () => {
        const service = new CardsChangeService();

        test('should return null if change option is empty or value field if change is empty', () => {
            const data = getData(42);

            let emptyOptions: undefined = void 0;
            let res = service.getChangeModel(data, emptyOptions);
            expect(res).toBeUndefined();

            let options = getOptions();
            options.value = void 0;
            res = service.getChangeModel(data, emptyOptions);
            expect(res).toBeUndefined();

            options = getOptions();
            options.value = { field: void 0 }
            res = service.getChangeModel(data, emptyOptions);
            expect(res).toBeUndefined();
        });

        test('should return default color if color from config is empty', () => {
            const data = getData(42);
            const options = getOptions();

            const res = service.getChangeModel(data, options);
            expect(res.color).toBe(DEFAULT_CARD_CHANGE_COLORS.aboveZero);
        });

        test('should return color by value if color options are set', () => {
            let data = getData(42);
            const options = getOptions({
                color: {
                    aboveZero: "green",
                    belowZero: "red",
                    equalZero: "blue"
                }
            });

            let res = service.getChangeModel(data, options);
            expect(res.color).toBe("green");

            data = getData(-42);
            res = service.getChangeModel(data, options);
            expect(res.color).toBe("red");

            data = getData(0);
            res = service.getChangeModel(data, options);
            expect(res.color).toBe("blue");
        });

        test('should return default color if color is fill but color for current value is not set', () => {
            const data = getData(-42);
            const options = getOptions({
                color: {
                    aboveZero: "red",
                    equalZero: "blue"
                }
            });

            const res = service.getChangeModel(data, options);
            expect(res.color).toBe(DEFAULT_CARD_CHANGE_COLORS.belowZero);
        });

        test('should return empty icon if icon options is not set', () => {
            const data = getData(42);
            const options = getOptions();

            const res = service.getChangeModel(data, options);
            expect(res.icon).toBeUndefined();
        });

        test('should return icon by value if icon options are set', () => {
            let data = getData(42);
            const options = getOptions({
                icon: {
                    aboveZero: () => "above",
                    belowZero: () => "below",
                    equalZero: () => "equal"
                } as any
            });

            let res = service.getChangeModel(data, options);
            expect(res.icon()).toBe("above");

            data = getData(-42);
            res = service.getChangeModel(data, options);
            expect(res.icon()).toBe("below");

            data = getData(0);
            res = service.getChangeModel(data, options);
            expect(res.icon()).toBe("equal");
        });
    });
});