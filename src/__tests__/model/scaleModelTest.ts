import { TwoDimensionalChart } from "../../config/config";
import { DataSource } from "../../model/model";
import { ScaleModel } from "../../model/featuresModel/scaleModel";

function getData(): DataSource {
    let data = JSON.parse(`{
        "dataSet": [
            { "brand": "BMW", "price": 10, "count": 12 },
            { "brand": "LADA", "price": 50, "count": 10 },
            { "brand": "MERCEDES", "price": 15, "count": 12 },
            { "brand": "AUDI", "price": 20, "count": 5 },
            { "brand": "VOLKSWAGEN", "price": 115, "count": 6 },
            { "brand": "DODGE", "price": 115, "count": 4 },
            { "brand": "SAAB", "price": 50, "count": 11 },
            { "brand": "HONDA", "price": 20, "count": 2 },
            { "brand": "TOYOTA", "price": 120, "count": 20 }
        ]
    }`);
    data = Object.assign(data, JSON.parse(`{
        "dataSet_poor": [
            { "brand": "BMW", "price": 120, "count": 12, "simple": 300 },
            { "brand": "LADA", "price": 50, "count": 10, "simple": 30 },
            { "brand": "MERCEDES", "price": 15, "count": 12, "simple": 500 }
        ]
    }`));

    return data;
}

describe('getScaleMaxValue test', () => {
    let charts: TwoDimensionalChart[];
    let data: DataSource;
    let dataSource: string;

    beforeEach(() => {
        charts = [
            {
                isSegmented: false,
                type: 'line',
                data: {
                    valueFields: [
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Количество автомобилей на душу населения'
                        },
                        {
                            name: 'count',
                            format: 'integer',
                            title: 'Количество автомобилей на душу населения'
                        }
                    ]
                },
                tooltip: {
                    show: true
                },
                markers: {
                    show: true
                },
                embeddedLabels: 'key'
            }
        ]
        data = getData();
        dataSource = "dataSet";
    });

    describe('one chart', () => {
        describe('non-segmnted', () => {
            beforeEach(() => {
                charts[0].isSegmented = false;
            });

            test('should return 120 (max of all dataSet) for not-segmnted charts', () => {
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(120);
            });

            test('should return 20 (max of count) for not-segmnted charts', () => {
                charts[0].data.valueFields = charts[0].data.valueFields.slice(1, 2);
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(20);
            });

            test('should return 500', () => {
                dataSource = "dataSet_poor";
                charts[0].data.valueFields.push({
                    format: 'integer',
                    name: 'simple',
                    title: ''
                });
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(500);
            });
        });

        describe('segmented', () => {
            beforeEach(() => {
                charts[0].isSegmented = true;
            });

            test('should return 140 (max of all sums) for segmented chart', () => {
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(140);
            });

            test('should return 527', () => {
                dataSource = "dataSet_poor";
                charts[0].data.valueFields.push({
                    format: 'integer',
                    name: 'simple',
                    title: ''
                });
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(527);
            });
        });
    });

    describe('two charts', () => {
        describe('segmented/non-segmented', () => {
            test('should return 500', () => {
                charts = [
                    {
                        isSegmented: true,
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    name: 'price',
                                    format: 'money',
                                    title: 'Количество автомобилей на душу населения'
                                },
                                {
                                    name: 'count',
                                    format: 'integer',
                                    title: 'Количество автомобилей на душу населения'
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        markers: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    },
                    {
                        isSegmented: false,
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    format: 'integer',
                                    name: 'simple',
                                    title: ''
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        markers: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    }
                ]
                dataSource = "dataSet_poor";
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(500);
            });

            test('should return 500', () => {
                charts = [
                    {
                        isSegmented: true,
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    name: 'price',
                                    format: 'money',
                                    title: 'Количество автомобилей на душу населения'
                                },
                                {
                                    name: 'count',
                                    format: 'integer',
                                    title: 'Количество автомобилей на душу населения'
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        embeddedLabels: 'key',
                        markers: {
                            show: true
                        }
                    },
                    {
                        isSegmented: true,
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    format: 'integer',
                                    name: 'simple',
                                    title: ''
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        markers: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    }
                ]
                dataSource = "dataSet_poor";
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(500);
            });
        });

        describe('segmented/segmented', () => {
            test('should return 500', () => {
                charts = [
                    {
                        isSegmented: true,
                        type: 'line',
                        markers: {
                            show: true
                        },
                        data: {
                            valueFields: [
                                {
                                    name: 'price',
                                    format: 'money',
                                    title: 'Количество автомобилей на душу населения'
                                },
                                {
                                    name: 'count',
                                    format: 'integer',
                                    title: 'Количество автомобилей на душу населения'
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    },
                    {
                        isSegmented: true,
                        markers: {
                            show: true
                        },
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    format: 'integer',
                                    name: 'simple',
                                    title: ''
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    }
                ]
                dataSource = "dataSet_poor";
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(500);
            });

            test('should return 512', () => {
                charts = [
                    {
                        isSegmented: true,
                        type: 'line',
                        markers: {
                            show: true
                        },
                        data: {
                            valueFields: [
                                {
                                    name: 'price',
                                    format: 'money',
                                    title: 'Количество автомобилей на душу населения'
                                },
                                {
                                    name: 'count',
                                    format: 'integer',
                                    title: 'Количество автомобилей на душу населения'
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    },
                    {
                        isSegmented: true,
                        markers: {
                            show: true
                        },
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    format: 'integer',
                                    name: 'simple',
                                    title: ''
                                },
                                {
                                    name: 'count',
                                    format: 'integer',
                                    title: 'Количество автомобилей на душу населения'
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    }
                ]
                dataSource = "dataSet_poor";
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(512);
            });

            test('should return 512', () => {
                charts = [
                    {
                        isSegmented: true,
                        markers: {
                            show: true
                        },
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    name: 'price',
                                    format: 'money',
                                    title: 'Количество автомобилей на душу населения'
                                },
                                {
                                    name: 'count',
                                    format: 'integer',
                                    title: 'Количество автомобилей на душу населения'
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    },
                    {
                        isSegmented: true,
                        markers: {
                            show: true
                        },
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    name: 'count',
                                    format: 'integer',
                                    title: 'Количество автомобилей на душу населения'
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    },
                    {
                        isSegmented: false,
                        markers: {
                            show: true
                        },
                        type: 'line',
                        data: {
                            valueFields: [
                                {
                                    format: 'integer',
                                    name: 'simple',
                                    title: ''
                                },
                                {
                                    name: 'count',
                                    format: 'integer',
                                    title: 'Количество автомобилей на душу населения'
                                },
                                {
                                    name: 'price',
                                    format: 'money',
                                    title: 'Количество автомобилей на душу населения'
                                }
                            ]
                        },
                        tooltip: {
                            show: true
                        },
                        embeddedLabels: 'key'
                    }
                ]
                dataSource = "dataSet_poor";
                const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
                expect(result).toBe(500);
            });
        });
    })
});

describe('get scales tests', () => {
    let charts: TwoDimensionalChart[];
    let data: DataSource;
    let dataSource: string;

    beforeEach(() => {
        charts = [
            {
                isSegmented: false,
                type: 'line',
                data: {
                    valueFields: [
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Количество автомобилей на душу населения'
                        },
                        {
                            name: 'count',
                            format: 'integer',
                            title: 'Количество автомобилей на душу населения'
                        }
                    ]
                },
                tooltip: {
                    show: true
                },
                markers: {
                    show: true
                },
                embeddedLabels: 'key'
            },
            {
                isSegmented: false,
                type: 'bar',
                data: {
                    valueFields: [
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Количество автомобилей на душу населения'
                        },
                        {
                            name: 'count',
                            format: 'integer',
                            title: 'Количество автомобилей на душу населения'
                        }
                    ]
                },
                tooltip: {
                    show: true
                },
                markers: {
                    show: true
                },
                embeddedLabels: 'key'
            }
        ]
        data = getData();
        dataSource = "dataSet_poor";
    });

    test('get scale key band', () => {
        const result = ScaleModel.getScaleKey(['BMW', 'LADA', 'MECEDES'], 'vertical', { bottom: 20, left: 20, right: 20, top: 20 }, { height: 500, width: 1000 }, charts, charts.filter(chart => chart.type === 'bar'));
        expect(result).toEqual({
            domain: ['BMW', 'LADA', 'MECEDES'],
            range: {
                start: 0,
                end: 960
            },
            type: 'band',
            elementsAmount: 2
        })
    });

    test('get scale key', () => {
        charts[1].type = 'line'
        const result = ScaleModel.getScaleKey(['BMW', 'LADA', 'MECEDES'], 'vertical', { bottom: 20, left: 20, right: 20, top: 20 }, { height: 500, width: 1000 }, charts, charts.filter(chart => chart.type === 'bar'));
        expect(result).toEqual({
            domain: ['BMW', 'LADA', 'MECEDES'],
            range: {
                start: 0,
                end: 960
            },
            type: 'point',
            elementsAmount: 1
        })
    });
});