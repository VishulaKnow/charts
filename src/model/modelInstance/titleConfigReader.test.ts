import { MdtChartsConfig, MdtChartsDataRow } from "../../config/config";
import { TitleConfigReader } from "./titleConfigReader";

describe("getFieldsBySegments", () => {
    let config: MdtChartsConfig;
    let data: MdtChartsDataRow[];

    beforeEach(() => {
        config = {
            canvas: null,
            options: {
                type: "2d",
                title: "Заголовок 1",
                selectable: true,
                axis: null,
                additionalElements: null,
                legend: null,
                orientation: "vertical",
                data: null,
                valueLabels: null,
                charts: null
            }
        };
        data = [
            [
                { brand: "BMW", price: 10, count: 12 },
                { brand: "LADA", price: 50, count: 10 },
                { brand: "MERCEDES", price: 15, count: 12 },
                { brand: "AUDI", price: 20, count: 5 },
                { brand: "VOLKSWAGEN", price: 115, count: 6 },
                { brand: "DODGE", price: 115, count: 4 },
                { brand: "SAAB", price: 50, count: 11 },
                { brand: "HONDA", price: 20, count: 2 },
                { brand: "TOYOTA", price: 120, count: 20 }
            ]
        ];
    });

    test("should return default font size and text title from string titleConfig", () => {
        const result = new TitleConfigReader(
            config.options.title,
            () => data,
            () => 16
        );

        expect(result.getTextContent()).toEqual("Заголовок 1");
        expect(result.getFontSize()).toEqual(16);
    });

    test("should return default font size and text title from function titleConfig", () => {
        config.options.title = () => "Заголовок 2";
        const result = new TitleConfigReader(
            config.options.title,
            () => data,
            () => 16
        );

        expect(result.getTextContent()).toEqual("Заголовок 2");
        expect(result.getFontSize()).toEqual(16);
    });

    test("should return default font size and text title from object titleConfig", () => {
        config.options.title = {
            text: "Заголовок 3"
        };
        const result = new TitleConfigReader(
            config.options.title,
            () => data,
            () => 16
        );

        expect(result.getTextContent()).toEqual("Заголовок 3");
        expect(result.getFontSize()).toEqual(16);
    });

    test("should return font size and text title from object titleConfig", () => {
        config.options.title = {
            text: "Заголовок 4",
            fontSize: 20
        };
        const result = new TitleConfigReader(
            config.options.title,
            () => data,
            () => 16
        );

        expect(result.getTextContent()).toEqual("Заголовок 4");
        expect(result.getFontSize()).toEqual(20);
    });
});
