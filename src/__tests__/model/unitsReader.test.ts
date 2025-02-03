import { UnitsReader } from "../../model/helpers/unitsReader";

describe("UnitsReader", () => {
    const unitsReader = new UnitsReader();

    describe("getUnitByValue", () => {
        test("should return default unit if value is number", () => {
            const res = unitsReader.getUnitByValue(123, "px", []);
            expect(res).toBe("px");
        });

        test("should return default unit if value does not end with units from array", () => {
            const res = unitsReader.getUnitByValue("123em", "px", ["px", "%"]);
            expect(res).toBe("px");
        });

        test("should return unit from array if string ends with this unit from string", () => {
            const res = unitsReader.getUnitByValue("123%", "px", ["px", "%"]);
            expect(res).toBe("%");
        });
    });
});
