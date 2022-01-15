import { DataModelInstance, DEFAULT_MAX_RECORDS_AMOUNT } from "../../model/modelInstance/dataModel";

describe('DataModelInstance', () => {
    describe('Max records amount section', () => {
        describe('initMaxRecordsAmount', () => {
            let modelInstance: DataModelInstance;

            beforeEach(() => {
                modelInstance = new DataModelInstance();
            })

            test('should reset default value if incoming value is number and it is more than 0', () => {
                modelInstance.initMaxRecordsAmount(20);
                const res = modelInstance.getMaxRecordsAmount();
                expect(res).toBe(20);
            });

            test('should NOT reset default value if incoming value is NOT a number or it is less or equal 0', () => {
                modelInstance.initMaxRecordsAmount(null);
                let res = modelInstance.getMaxRecordsAmount();
                expect(res).toBe(DEFAULT_MAX_RECORDS_AMOUNT);

                modelInstance.initMaxRecordsAmount(-1);
                res = modelInstance.getMaxRecordsAmount();
                expect(res).toBe(DEFAULT_MAX_RECORDS_AMOUNT);

                modelInstance.initMaxRecordsAmount(0);
                res = modelInstance.getMaxRecordsAmount();
                expect(res).toBe(DEFAULT_MAX_RECORDS_AMOUNT);
            });
        });
    });
});