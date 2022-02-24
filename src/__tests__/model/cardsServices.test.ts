import { MdtChartsCardsChange, MdtChartsDataRow } from "../../config/config";
import { CardsChangeService } from "../../model/notations/cards/cardsChangeService";
import { DEFAULT_CARD_CHANGE_COLOR, DEFAULT_CARD_COLOR, getCardColor } from "../../model/notations/cards/cardsModelService";

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
            expect(res.color).toBe(DEFAULT_CARD_CHANGE_COLOR.aboveZero);
        });

        test('should return color by value if color options are set', () => {
            let data = getData(42);
            const options = getOptions({
                color: [
                    {
                        color: "red"
                    },
                    {
                        value: 0,
                        color: "blue"
                    },
                    {
                        value: 0,
                        color: "green"
                    }
                ]
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

        test('should take last color from range if all ranges is not including value', () => {
            const data = getData(-42);
            const options = getOptions({
                color: [
                    {
                        value: 0,
                        color: "blue"
                    },
                    {
                        value: 0,
                        color: "red"
                    }
                ]
            });

            const res = service.getChangeModel(data, options);
            expect(res.color).toBe("red");
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

describe('getCardColor', () => {
    test('should return default color if value is string', () => {
        const res = getCardColor("value", [{ value: 12, color: "red" }]);
        expect(res).toBe(DEFAULT_CARD_COLOR);
    });

    test('should return default color if range is empty', () => {
        let res = getCardColor("value", void 0);
        expect(res).toBe(DEFAULT_CARD_COLOR);

        res = getCardColor("value", []);
        expect(res).toBe(DEFAULT_CARD_COLOR);
    });
});