import { TwoDimConfigReader } from "./configReader";
import { DataRepositoryModel } from "../../model/modelInstance/dataModel/dataRepository";
import { MdtChartsConfig, MdtChartsDataRow, MdtChartsTwoDimensionalOptions, NumberDomain } from "../../config/config";

describe('getFieldsBySegments', () => {
    let reader: TwoDimConfigReader;
    let config: any;

    beforeEach(() => {
        config = {
            canvas: null,
            options: {
                charts: [
                    {
                        type: "bar",
                        isSegmented: true,
                        embeddedLabels: null,
                        markers: null,
                        tooltip: null,
                        data: {
                            valueFields: [
                                { name: "Val1", title: "", format: "" },
                                { name: "Val2", title: "", format: "" }
                            ],
                            valueGroup: 'secondary'
                        }
                    },
                    {
                        type: "line",
                        isSegmented: false,
                        embeddedLabels: null,
                        markers: null,
                        tooltip: null,
                        data: {
                            valueFields: [
                                { name: "Val3", title: "", format: "" },
                                { name: "Val4", title: "", format: "" }
                            ],
                            valueGroup: 'main'
                        }
                    }
                ]
            } as any
        }
        reader = new TwoDimConfigReader(config,null);
    })

    test('should return array of charts valueFields only with valueGroup equals "main"', () => {
        const result = reader.getFieldsBySegments();
        expect(result).toEqual([["Val3"], ["Val4"]]);
    });

    test('should return array of all valueFields in charts', () => {
        config.options.charts.forEach((chart: any) => {
            delete chart.data.valueGroup;
        });

        const result = reader.getFieldsBySegments();
        expect(result).toEqual([["Val1", "Val2"], ["Val3"], ["Val4"]]);
    });

    test('should return array of all valueFields in charts', () => {
        config.options.charts.forEach((chart: any) => {
            chart.data.valueGroup = 'main';
        });

        const result = reader.getFieldsBySegments();
        expect(result).toEqual([["Val1", "Val2"], ["Val3"], ["Val4"]]);
    });

});

describe('getBiggestValueAndDecremented', () => {
    let domain: NumberDomain
    let config: MdtChartsConfig;
    let options: MdtChartsTwoDimensionalOptions;
    let reader: TwoDimConfigReader;
    let dataRows: MdtChartsDataRow[]
    let repository: DataRepositoryModel;

    beforeEach(() => {
        domain = { start: -1, end: -1 };
        options = {
            type: '2d',
            axis: {
                key: null,
                value: {
                    domain: domain,
                    position: 'start',
                    ticks: { flag: false },
                    visibility: false,
                    labels: null
                }
            },
            charts: [
                {
                    type: "bar",
                    data: {
                        valueFields: [
                            { name: "price", title: "", format: "" },
                        ],
                        valueGroup: 'secondary'
                    },
                    tooltip: null,
                    markers: null,
                    barStyles: null,
                    embeddedLabels: null,
                    isSegmented: null,
                    lineStyles: null
                },
                {
                    type: "line",
                    data: {
                        valueFields: [
                            { name: "count", title: "", format: "" },
                        ],
                        valueGroup: 'main'
                    },
                    tooltip: null,
                    markers: null,
                    barStyles: null,
                    embeddedLabels: null,
                    isSegmented: null,
                    lineStyles: null
                }
            ],
            title: '',
            selectable: true,
            additionalElements: null,
            legend: null,
            orientation: null,
            data: null,
            tooltip: null
        };
        config = {
            canvas: null,
            options
        }
        reader = new TwoDimConfigReader(config,null);
        dataRows = [
            {$id: 1, brand: 'BMW', price: 100000, count: 10000, color: 'red'},
            {$id: 2, brand: 'LADA', price: 0, count: 1000, color: 'green'},
            {$id: 3, brand: 'MERCEDES', price: 15000, count: 1200, color: 'blue'},
            {$id: 4, brand: 'AUDI', price: 20000, count: 500, color: 'yellow'},
            {$id: 5, brand: 'VOLKSWAGEN', price: 115000, count: 6000, color: 'cyan'},
            {$id: 6, brand: 'DODGE', price: 115000, count: 4000, color: 'red'},
            {$id: 7, brand: 'SAAB', price: 50000, count: 11000, color: 'orange'},
            {$id: 8, brand: 'HONDA', price: 20000, count: 2000, color: 'brown'},
            {$id: 9, brand: 'TOYOTA', price: 40000, count: 15000, color: 'pink'},
            {$id: 9, brand: 'LEXUS', price: null, count: 15000, color: 'pink'},
        ];
        repository = new DataRepositoryModel();
        repository.getRawRows = () => dataRows;
    })

    test('should return biggest and biggest - 1 value for the count field', () => {
        const res = reader.getBiggestValueAndDecremented(repository)
        expect(res).toStrictEqual([15000, 14999])
    });

    test('should return biggest and biggest - 1 value for the price field', () => {
        options.charts.forEach((chart: any) => {
            delete chart.data.valueGroup;
        });

        const res = reader.getBiggestValueAndDecremented(repository)
        expect(res).toStrictEqual([115000, 114999])
    });

    test('should return biggest and biggest - 1 value from domain in config for the count field', () => {
        domain.end = 11000;
        const res = reader.getBiggestValueAndDecremented(repository)
        expect(res).toStrictEqual([11000, 10999])
    });
});

describe('getBiggestValueAndDecrementedSecondary', () => {
    let domain: NumberDomain
    let config: MdtChartsConfig;
    let options: MdtChartsTwoDimensionalOptions;
    let reader: TwoDimConfigReader;
    let dataRows: MdtChartsDataRow[]
    let repository: DataRepositoryModel;

    beforeEach(() => {
        domain = { start: -1, end: -1 };
        options = {
            type: '2d',
            axis: {
                key: null,
                value: {
                    domain: null,
                    position: 'start',
                    ticks: { flag: false },
                    visibility: false,
                    labels: null
                },
                valueSecondary: {
                    domain: domain,
                    ticks: { flag: false },
                    visibility: false,
                    labels: null
                }
            },
            charts: [
                {
                    type: "bar",
                    data: {
                        valueFields: [
                            { name: "price", title: "", format: "" },
                        ],
                        valueGroup: 'secondary'
                    },
                    tooltip: null,
                    markers: null,
                    barStyles: null,
                    embeddedLabels: null,
                    isSegmented: null,
                    lineStyles: null
                },
                {
                    type: "line",
                    data: {
                        valueFields: [
                            { name: "count", title: "", format: "" },
                        ],
                        valueGroup: 'main'
                    },
                    tooltip: null,
                    markers: null,
                    barStyles: null,
                    embeddedLabels: null,
                    isSegmented: null,
                    lineStyles: null
                }
            ],
            title: '',
            selectable: true,
            additionalElements: null,
            legend: null,
            orientation: null,
            data: null,
            tooltip: null
        };
        config = {
            canvas: null,
            options
        }
        reader = new TwoDimConfigReader(config,null);
        dataRows = [
            {$id: 1, brand: 'BMW', price: 100000, count: 10000, color: 'red'},
            {$id: 2, brand: 'LADA', price: 0, count: 1000, color: 'green'},
            {$id: 3, brand: 'MERCEDES', price: 15000, count: 1200, color: 'blue'},
            {$id: 4, brand: 'AUDI', price: 20000, count: 500, color: 'yellow'},
            {$id: 5, brand: 'VOLKSWAGEN', price: 115000, count: 6000, color: 'cyan'},
            {$id: 6, brand: 'DODGE', price: 115000, count: 4000, color: 'red'},
            {$id: 7, brand: 'SAAB', price: 50000, count: 11000, color: 'orange'},
            {$id: 8, brand: 'HONDA', price: 20000, count: 2000, color: 'brown'},
            {$id: 9, brand: 'TOYOTA', price: 40000, count: 15000, color: 'pink'},
            {$id: 9, brand: 'LEXUS', price: null, count: 15000, color: 'pink'},
        ];
        repository = new DataRepositoryModel();
        repository.getRawRows = () => dataRows;
    })

    test('should return biggest and biggest - 1 value for the count field', () => {
        const res = reader.getBiggestValueAndDecrementedSecondary(repository)
        expect(res).toStrictEqual([15000, 14999])
    });

    test('should return biggest and biggest - 1 value for the price field', () => {
        options.charts.forEach((chart: any) => {
            delete chart.data.valueGroup;
        });

        const res = reader.getBiggestValueAndDecrementedSecondary(repository)
        expect(res).toStrictEqual([115000, 114999])
    });

    test('should return biggest and biggest - 1 value from domain in config for the count field', () => {
        domain.end = 11000;
        const res = reader.getBiggestValueAndDecrementedSecondary(repository)
        expect(res).toStrictEqual([11000, 10999])
    });
});