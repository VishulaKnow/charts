import { DataManagerModelService } from "../../model/dataManagerModel/dataManagerModelService";
import { DataScope } from "../../model/model";

describe("DataManagerModelSerivce", () => {
    describe("getMaximumPossibleAmount", () => {
        const service = new DataManagerModelService();

        test("should return incoming keys if max amount more than incoming keys length", () => {
            const keys: string[] = ["key1", "key2", "key3", "key4", "key5"];
            const maxAmount = 10;
            const res = service.getMaximumPossibleAmount(keys, maxAmount);

            expect(res).toEqual<DataScope>({
                allowableKeys: keys,
                hidedRecordsAmount: 0
            });
        });

        test("should return incoming keys if max amount equal incoming keys length", () => {
            const keys: string[] = ["key1", "key2", "key3", "key4", "key5"];
            const maxAmount = 5;
            const res = service.getMaximumPossibleAmount(keys, maxAmount);

            expect(res).toEqual<DataScope>({
                allowableKeys: keys,
                hidedRecordsAmount: 0
            });
        });

        test("should return sliced keys if max amount is less than incoming keys length", () => {
            const keys: string[] = ["key1", "key2", "key3", "key4", "key5"];
            const maxAmount = 3;
            const res = service.getMaximumPossibleAmount(keys, maxAmount);

            expect(res).toEqual<DataScope>({
                allowableKeys: ["key1", "key2", "key3"],
                hidedRecordsAmount: 2
            });
        });
    });

    describe("limitAllowableKeys", () => {
        const service = new DataManagerModelService();

        test("should limit keys and increase hided records amount if max possible amount is more than keys length", () => {
            const keys: string[] = ["key1", "key2", "key3", "key4", "key5"];
            const hidedRecordsAmount = 5;
            const maxAmount = 3;

            const res = service.limitAllowableKeys(keys, hidedRecordsAmount, maxAmount);
            expect(res).toEqual<DataScope>({
                allowableKeys: ["key1", "key2", "key3"],
                hidedRecordsAmount: 7 // 5 + 2
            });
        });

        test("should do nothing if max possible amount is less or equal keys length", () => {
            const keys: string[] = ["key1", "key2", "key3", "key4", "key5"];
            const hidedRecordsAmount = 5;
            const maxAmount = 5;

            const res = service.limitAllowableKeys(keys, hidedRecordsAmount, maxAmount);
            expect(res).toEqual<DataScope>({
                allowableKeys: keys,
                hidedRecordsAmount
            });
        });
    });
});
