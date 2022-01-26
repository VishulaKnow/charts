import { MdtChartsDataRow } from "../../../../config/config";
import { DataStacker, StackedDataFull } from "./dataStacker";
import { DataStackerService } from "./dataStackerService";

describe('DataStacker', () => {
    const stacker = new DataStacker();

    describe('getStackedData', () => {
        describe('for positive values', () => {
            let dataRows: MdtChartsDataRow[] = [
                { price: 12, count: 30 },
                { price: 30, count: 12 },
                { price: 0, count: 100 },
                { price: 10, count: 0 }
            ]
            const valueFields = ["price", "count"];

            test('should return right stack', () => {
                const res = stacker.getStackedData(dataRows, valueFields);
                expect(res).toEqual<StackedDataFull>([
                    [
                        { "0": 0, "1": 12, data: dataRows[0] },
                        { "0": 0, "1": 30, data: dataRows[1] },
                        { "0": 0, "1": 0, data: dataRows[2] },
                        { "0": 0, "1": 10, data: dataRows[3] },
                    ],
                    [
                        { "0": 12, "1": 42, data: dataRows[0] },
                        { "0": 30, "1": 42, data: dataRows[1] },
                        { "0": 0, "1": 100, data: dataRows[2] },
                        { "0": 10, "1": 10, data: dataRows[3] },
                    ]
                ])
            });
        });

        describe('for negative values', () => {
            let dataRows: MdtChartsDataRow[] = [
                { price: -12, count: -30 },
                { price: -30, count: -12 },
                { price: 0, count: -100 },
                { price: -10, count: 0 }
            ]
            const valueFields = ["price", "count"];

            test('should return right stack', () => {
                const res = stacker.getStackedData(dataRows, valueFields);
                expect(res).toEqual<StackedDataFull>([
                    [
                        { "0": 0, "1": -12, data: dataRows[0] },
                        { "0": 0, "1": -30, data: dataRows[1] },
                        { "0": 0, "1": 0, data: dataRows[2] },
                        { "0": 0, "1": -10, data: dataRows[3] },
                    ],
                    [
                        { "0": -12, "1": -42, data: dataRows[0] },
                        { "0": -30, "1": -42, data: dataRows[1] },
                        { "0": 0, "1": -100, data: dataRows[2] },
                        { "0": -10, "1": -10, data: dataRows[3] },
                    ]
                ])
            });
        });
    });
});

describe('DataStackerService', () => {
    const service = new DataStackerService();
    let data: StackedDataFull = [
        [
            { "0": 0, "1": 42, data: {} },
            { "0": 0, "1": -123, data: {} }
        ]
    ]

    describe('getLastValue', () => {
        test('should return 0 if vfIndex is 0', () => {
            const res = service.getValue0(data, 0, 0, 0);
            expect(res).toBe(0);
        });

        test('should return last positive values if positive value exists and need positive', () => {
            const res = service.getValue0(data, 1, 0, 12);
            expect(res).toBe(42);
        });

        test('should return 0 if positive value not exists and need positive', () => {
            const res = service.getValue0(data, 1, 1, 12);
            expect(res).toBe(0);
        });

        test('should return last negative value if negative value exists and need negative', () => {
            const res = service.getValue0(data, 1, 1, -12);
            expect(res).toBe(-123);
        });

        test('should return 0 if negative value not exists and need negative', () => {
            const res = service.getValue0(data, 1, 0, -12);
            expect(res).toBe(0);
        });
    });

    describe('getValue1', () => {
        test('should return sum of value0 + value from data', () => {
            let res = service.getValue1(0, 12);
            expect(res).toBe(12);

            res = service.getValue1(-12, -30);
            expect(res).toBe(-42);

            res = service.getValue1(0, 30);
            expect(res).toBe(30);

            res = service.getValue1(0, -30);
            expect(res).toBe(-30);
        });
    });
});

describe('real example (positive only)', () => {
    const stacker = new DataStacker();
    const data = [
        {
            $id: 1,
            brand: "BMW BMW",
            price: 100000,
            count: 12000,
            color: "red"
        },
        {
            $id: 2,
            brand: "LADA",
            price: 0,
            count: 1000,
            color: "green"
        },
        {
            $id: 3,
            brand: "MERCEDES",
            price: 15000,
            count: 1200,
            color: "blue"
        },
        {
            $id: 4,
            brand: "AUDI",
            price: 20000,
            count: 500,
            color: "yellow"
        },
        {
            $id: 5,
            brand: "VOLKSWAGEN",
            price: 115000,
            count: 6000,
            color: "cyan"
        },
        {
            $id: 6,
            brand: "DODGE",
            price: 115000,
            count: 4000,
            color: "red"
        },
        {
            $id: 7,
            brand: "SAAB",
            price: 50000,
            count: 11000,
            color: "orange"
        },
        {
            $id: 8,
            brand: "HONDA",
            price: 20000,
            count: 2000,
            color: "brown"
        },
        {
            $id: 9,
            brand: "TOYOTA",
            price: 40000,
            count: 15000,
            color: "pink"
        }
    ];
    const valueFields = ["price", "count"]
    const stackedData = [
        [
            { "0": 0, "1": 100000, data: data[0] },
            { "0": 0, "1": 0, data: data[1] },
            { "0": 0, "1": 15000, data: data[2] },
            { "0": 0, "1": 20000, data: data[3] },
            { "0": 0, "1": 115000, data: data[4] },
            { "0": 0, "1": 115000, data: data[5] },
            { "0": 0, "1": 50000, data: data[6] },
            { "0": 0, "1": 20000, data: data[7] },
            { "0": 0, "1": 40000, data: data[8] }
        ],
        [
            { "0": 100000, "1": 112000, data: data[0] },
            { "0": 0, "1": 1000, data: data[1] },
            { "0": 15000, "1": 16200, data: data[2] },
            { "0": 20000, "1": 20500, data: data[3] },
            { "0": 115000, "1": 121000, data: data[4] },
            { "0": 115000, "1": 119000, data: data[5] },
            { "0": 50000, "1": 61000, data: data[6] },
            { "0": 20000, "1": 22000, data: data[7] },
            { "0": 40000, "1": 55000, data: data[8] }
        ]
    ];

    test('check on real example', () => {
        const res = stacker.getStackedData(data, valueFields);
        expect(res).toEqual(stackedData);
    });
});