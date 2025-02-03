import { DataRepositoryModel } from "./dataRepository";

describe("DataRepositoryModel", () => {
    describe("getBiggestValueAndDecremented", () => {
        test("should return biggest value by fields if there are not segmented charts", () => {
            const rep = new DataRepositoryModel();
            rep.initOptions(
                {
                    dataSource: "source",
                    keyField: { format: "string", name: "Key" }
                },
                [
                    { format: "money", name: "Val1" },
                    { format: "money", name: "Val2" }
                ]
            );
            rep.initRawFullSource({
                source: [
                    { Key: "K1", Val1: 100, Val2: 30 },
                    { Key: "K2", Val1: 120, Val2: 300 }
                ]
            });
            const result = rep.getBiggestValueAndDecremented();
            expect(result).toEqual([300, 299]);
        });

        test("should return biggest value by fields if there are not segmented charts and segments are set", () => {
            const rep = new DataRepositoryModel();
            rep.initOptions(
                {
                    dataSource: "source",
                    keyField: { format: "string", name: "Key" }
                },
                [
                    { format: "money", name: "Val1" },
                    { format: "money", name: "Val2" }
                ]
            );
            rep.initRawFullSource({
                source: [
                    { Key: "K1", Val1: 100, Val2: 30 },
                    { Key: "K2", Val1: 120, Val2: 300 }
                ]
            });
            const result = rep.getBiggestValueAndDecremented([["Val1"], ["Val2"]]);
            expect(result).toEqual([300, 299]);
        });

        test("should return biggest value by segments if there are segmented charts", () => {
            const rep = new DataRepositoryModel();
            rep.initOptions(
                {
                    dataSource: "source",
                    keyField: { format: "string", name: "Key" }
                },
                [
                    { format: "money", name: "Val1" },
                    { format: "money", name: "Val2" },
                    { format: "money", name: "Val3" }
                ]
            );
            rep.initRawFullSource({
                source: [
                    { Key: "K1", Val1: 100, Val2: 30, Val3: 30 },
                    { Key: "K2", Val1: 120, Val2: 300, Val3: 100 }
                ]
            });
            const result = rep.getBiggestValueAndDecremented([["Val1", "Val2"], ["Val3"]]);
            expect(result).toEqual([420, 419]);
        });

        test("should return biggest value by segments if there are segmented charts but biggest value in non segmented chart", () => {
            const rep = new DataRepositoryModel();
            rep.initOptions(
                {
                    dataSource: "source",
                    keyField: { format: "string", name: "Key" }
                },
                [
                    { format: "money", name: "Val1" },
                    { format: "money", name: "Val2" },
                    { format: "money", name: "Val3" }
                ]
            );
            rep.initRawFullSource({
                source: [
                    { Key: "K1", Val1: 100, Val2: 30, Val3: 500 },
                    { Key: "K2", Val1: 120, Val2: 300, Val3: 100 }
                ]
            });
            const result = rep.getBiggestValueAndDecremented([["Val1", "Val2"], ["Val3"]]);
            expect(result).toEqual([500, 499]);
        });
    });
});
