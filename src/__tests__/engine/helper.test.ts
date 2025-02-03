import { MdtChartsDataRow, MdtChartsDataSource } from "../../config/config";
import { Helper } from "../../engine/helpers/helper";

describe("getTranslateNumbers", () => {
    test("getTranslateNumbers should return tuple of two numbers which equal transaleX and translateY", () => {
        expect(Helper.getTranslateNumbers("translate(14, 34)")).toEqual([14, 34]);
        expect(Helper.getTranslateNumbers("translate(2000, 0)")).toEqual([2000, 0]);
        expect(Helper.getTranslateNumbers("translate(-12, -123)")).toEqual([-12, -123]);
        expect(Helper.getTranslateNumbers("translate(0, 0)")).toEqual([0, 0]);
    });

    test("getTranslateNumbers should return tuple of zeros if transform attr is null", () => {
        expect(Helper.getTranslateNumbers(null)).toEqual([0, 0]);
    });
});

describe("checkDomainsEquality", () => {
    test("should return true for equal domains", () => {
        const result = Helper.checkDomainsEquality(["bmw", "MERCEDES"], ["bmw", "MERCEDES"]);
        expect(result).toBe(true);
    });

    test("should return false for equal domains, but in diff order", () => {
        const result = Helper.checkDomainsEquality(["bmw", "MERCEDES"], ["MERCEDES", "bmw"]);
        expect(result).toBe(false);
    });

    test("should return false for non-equal domains", () => {
        const result = Helper.checkDomainsEquality(["bmw", "MERCEDES", "DD"], ["bmw", "MERCEDES"]);
        expect(result).toBe(false);
    });
});

describe("parseFormattedToNumber", () => {
    test("should return float number from money string", () => {
        const result = Helper.parseFormattedToNumber("12 300,00", ",");
        expect(result).toBe(12300);
        expect(typeof result).toBe("number");
    });

    test("should return float number from decimal string with spaces", () => {
        const result = Helper.parseFormattedToNumber("12 300.00", ".");
        expect(result).toBe(12300);
        expect(typeof result).toBe("number");
    });

    test("should return float number from money string with two spaces", () => {
        const result = Helper.parseFormattedToNumber("12 300 120,00", ",");
        expect(result).toBe(12300120);
        expect(typeof result).toBe("number");
    });
});

describe("calcDigitesAfterDot", () => {
    test("should return 3 digits", () => {
        const result = Helper.calcDigitsAfterDot(12.32);
        expect(result).toBe(2);
    });

    test("should return 0 digits", () => {
        const result = Helper.calcDigitsAfterDot(12);
        expect(result).toBe(0);
    });
});

describe("string transformers", () => {
    test("getTranslateNumbers should return tuple of zeros if transform attr is null", () => {
        expect(Helper.getTranslateNumbers(null)).toEqual([0, 0]);
    });

    test("getRgbaFromRgb", () => {
        const result = Helper.getRgbaFromRgb("rgb(13, 123, 23)", 0.5);
        expect(result).toBe("rgba(13, 123, 23, 0.5)");
    });
});

describe("test id and keyValue manipulations", () => {
    let dataset: MdtChartsDataRow[];
    beforeEach(() => {
        dataset = [
            {
                $id: 12,
                name: "bmw",
                price: 130
            },
            {
                $id: 145,
                name: "audi",
                price: 141
            },
            {
                $id: 1453,
                name: "lada",
                price: 11
            }
        ];
    });

    test("getRowsByIds", () => {
        const result = Helper.getRowsByIds([12, 145], dataset);
        expect(result).toEqual([
            {
                $id: 12,
                name: "bmw",
                price: 130
            },
            {
                $id: 145,
                name: "audi",
                price: 141
            }
        ]);
    });

    test("extractKeysFromRows", () => {
        const result = Helper.extractKeysFromRows("name", dataset);
        expect(result).toEqual(["bmw", "audi", "lada"]);
    });

    test("getKeysByIds", () => {
        const result = Helper.getKeysByIds([12, 1453], "name", dataset);
        expect(result).toEqual(["bmw", "lada"]);
    });

    test("getKeysByIds empty", () => {
        const result = Helper.getKeysByIds([], "name", dataset);
        expect(result).toEqual([]);
    });

    test("getRowsFromKeys", () => {
        const result = Helper.getRowsByKeys(["bmw"], "name", dataset);
        expect(result).toEqual([
            {
                $id: 12,
                name: "bmw",
                price: 130
            }
        ]);
    });
});

describe("compareData", () => {
    let oldSet: MdtChartsDataSource;
    let newSet: MdtChartsDataSource;
    let dataSetName = "data";

    beforeEach(() => {
        oldSet = {
            data: [
                {
                    name: "bmw",
                    price: 100
                },
                {
                    name: "audi",
                    price: 1234
                },
                {
                    name: "lada",
                    price: 300
                }
            ]
        };
        newSet = {
            data: [
                {
                    name: "bmw",
                    price: 100
                },
                {
                    name: "audi",
                    price: 1234
                },
                {
                    name: "lada",
                    price: 300
                }
            ]
        };
    });

    test("should return true for equal sets", () => {
        const result = Helper.compareData(oldSet, newSet, dataSetName);
        expect(result).toBe(true);
    });

    test("should return false for sets with diff lengths", () => {
        newSet[dataSetName].pop();
        const result = Helper.compareData(oldSet, newSet, dataSetName);
        expect(result).toBe(false);
    });

    test("should return false for sets with diff keys", () => {
        newSet[dataSetName][2].name = "subaru";
        const result = Helper.compareData(oldSet, newSet, dataSetName);
        expect(result).toBe(false);
    });

    test("should return false for sets with diff values", () => {
        newSet[dataSetName][1].price = 1213432;
        const result = Helper.compareData(oldSet, newSet, dataSetName);
        expect(result).toBe(false);
    });

    test("should return false for equal sets with DIFF order", () => {
        newSet = {
            data: [
                {
                    name: "bmw",
                    price: 100
                },
                {
                    name: "lada",
                    price: 300
                },
                {
                    name: "audi",
                    price: 1234
                }
            ]
        };
        const result = Helper.compareData(oldSet, newSet, dataSetName);
        expect(result).toBe(false);
    });

    test("should return false for falsy sets", () => {
        newSet = undefined;
        const result = Helper.compareData(oldSet, newSet, dataSetName);
        expect(result).toBe(false);
    });

    test("should return false for falsy arrays in sets", () => {
        newSet[dataSetName] = undefined;
        const result = Helper.compareData(oldSet, newSet, dataSetName);
        expect(result).toBe(false);
    });

    test("should return false for falsy sourceName", () => {
        dataSetName = undefined;
        const result = Helper.compareData(oldSet, newSet, dataSetName);
        expect(result).toBe(false);
    });
});

describe("simple methods", () => {
    test("getValueOrZero should return 12", () => {
        expect(Helper.getValueOrZero(12)).toBe(12);
    });

    test("getValueOrZero should return 0", () => {
        expect(Helper.getValueOrZero(-12)).toBe(0);
    });

    test("getPXValueFromString should return 42", () => {
        expect(Helper.getPXValueFromString("42px")).toBe(42);
    });

    test("getKeyFieldValue for non-wrapped", () => {
        const row = {
            key: "key"
        };
        expect(Helper.getKeyFieldValue(row, "key", false)).toBe("key");
    });

    test("getKeyFieldValue for wrapped", () => {
        const row = {
            data: {
                key: "key"
            }
        };
        expect(Helper.getKeyFieldValue(row, "key", true)).toBe("key");
    });
});
