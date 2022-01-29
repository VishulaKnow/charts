import { MdtChartsDataRow, MdtChartsDataSource, MdtChartsTwoDimensionalChart, MdtChartsTwoDimensionalOptions } from "../../config/config";
import { ScaleModel } from "../../model/featuresModel/scaleModel/scaleModel";
import { CanvasModel } from "../../model/modelInstance/canvasModel/canvasModel";

function getData(sourceName: "dataSet_poor" | "dataSet" | "dataSet_negative" = "dataSet"): MdtChartsDataRow[] {
    const data = {
        dataSet: [
            { brand: "BMW", price: 10, count: 12 },
            { brand: "LADA", price: 50, count: 10 },
            { brand: "MERCEDES", price: 15, count: 12 },
            { brand: "AUDI", price: 20, count: 5 },
            { brand: "VOLKSWAGEN", price: 115, count: 6 },
            { brand: "DODGE", price: 115, count: 4 },
            { brand: "SAAB", price: 50, count: 11 },
            { brand: "HONDA", price: 20, count: 2 },
            { brand: "TOYOTA", price: 120, count: 20 }
        ],
        dataSet_poor: [
            { brand: "BMW", price: 120, count: 12, simple: 300 },
            { brand: "LADA", price: 50, count: 10, simple: 30 },
            { brand: "MERCEDES", price: 15, count: 12, simple: 500 }
        ],
        dataSet_negative: [
            { brand: "BMW", price: -120, count: 12, simple: 300 },
            { brand: "LADA", price: -50, count: 10, simple: -30 },
            { brand: "MERCEDES", price: 15, count: -12, simple: 500 },
            { brand: "DODGE", price: -100, count: -52, simple: 500 }
        ]
    };

    return data[sourceName];
}

describe('getScaleMaxValue test', () => {
    let charts: MdtChartsTwoDimensionalChart[];

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
    });

    describe('one chart', () => {
        describe('non-segmnted', () => {
            beforeEach(() => {
                charts[0].isSegmented = false;
            });

            test('should return 120 (max of all dataSet) for not-segmnted charts', () => {
                const result = ScaleModel.getScaleMaxValue(charts, getData());
                expect(result).toBe(120);
            });

            test('should return 20 (max of count) for not-segmnted charts', () => {
                charts[0].data.valueFields = charts[0].data.valueFields.slice(1, 2);
                const result = ScaleModel.getScaleMaxValue(charts, getData());
                expect(result).toBe(20);
            });

            test('should return 500', () => {
                charts[0].data.valueFields.push({
                    format: 'integer',
                    name: 'simple',
                    title: ''
                });
                const result = ScaleModel.getScaleMaxValue(charts, getData("dataSet_poor"));
                expect(result).toBe(500);
            });
        });

        describe('segmented', () => {
            beforeEach(() => {
                charts[0].isSegmented = true;
            });

            test('should return 140 (max of all sums) for segmented chart', () => {
                const result = ScaleModel.getScaleMaxValue(charts, getData());
                expect(result).toBe(140);
            });

            test('should return 527', () => {
                charts[0].data.valueFields.push({
                    format: 'integer',
                    name: 'simple',
                    title: ''
                });
                const result = ScaleModel.getScaleMaxValue(charts, getData("dataSet_poor"));
                expect(result).toBe(527);
            });
        });
    });

    describe('With Negative values', () => {
        test('should return max sum of positive values if chart has negative values too', () => {
            charts[0].data.valueFields.push({ name: "simple", format: null, title: null });
            charts[0].isSegmented = true;

            const result = ScaleModel.getScaleMaxValue(charts, getData("dataSet_negative"));
            expect(result).toBe(515);
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
                const result = ScaleModel.getScaleMaxValue(charts, getData("dataSet_poor"));
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
                const result = ScaleModel.getScaleMaxValue(charts, getData("dataSet_poor"));
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
                const result = ScaleModel.getScaleMaxValue(charts, getData("dataSet_poor"));
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
                const result = ScaleModel.getScaleMaxValue(charts, getData("dataSet_poor"));
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
                const result = ScaleModel.getScaleMaxValue(charts, getData("dataSet_poor"));
                expect(result).toBe(500);
            });
        });
    })
});

describe('getScaleMinValue', () => {
    let charts: MdtChartsTwoDimensionalChart[];

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
                tooltip: null,
                markers: null,
                embeddedLabels: 'key'
            }
        ]
    });

    test('should return `0` if min value is more than 0', () => {
        const res = ScaleModel.getScaleMinValue(charts, getData());
        expect(res).toBe(0);
    });

    test('should return min negative value if chart is not segmented and data has negative values', () => {
        const res = ScaleModel.getScaleMinValue(charts, getData("dataSet_negative"));
        expect(res).toBe(-120);
    });

    test('should return min sum of negative values if chart is segmented and data has negative values', () => {
        charts[0].isSegmented = true;
        const res = ScaleModel.getScaleMinValue(charts, getData("dataSet_negative"));
        expect(res).toBe(-152);
    });
});

describe('get scales tests', () => {
    let charts: MdtChartsTwoDimensionalChart[];
    let data: MdtChartsDataSource;
    let dataSource: string;
    let options: MdtChartsTwoDimensionalOptions;

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
        data = {
            "dataSet_poor": getData("dataSet_poor")
        };
        dataSource = "dataSet_poor";
        options = {
            legend: {
                show: false
            },
            additionalElements: null,
            axis: {
                key: {
                    position: 'start',
                    ticks: null,
                    visibility: true
                },
                value: {
                    domain: {
                        start: -1, end: -1
                    },
                    position: "end",
                    ticks: null,
                    visibility: true
                }
            },
            charts,
            data: {
                dataSource,
                keyField: {
                    format: null,
                    name: 'price'
                },
            },
            orientation: "vertical",
            selectable: true,
            title: null,
            type: '2d',
            tooltip: {
                html: null
            }
        }
    });

    test('get scale key band', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin({ bottom: 20, left: 20, right: 20, top: 20 });
        canvasModel.initBlockSize({ height: 500, width: 1000 });

        const result = ScaleModel.getScaleKey(['BMW', 'LADA', 'MECEDES'], 'vertical', canvasModel, charts, charts.filter(chart => chart.type === 'bar'));
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
        const canvasModel = new CanvasModel();
        canvasModel.initMargin({ bottom: 20, left: 20, right: 20, top: 20 });
        canvasModel.initBlockSize({ height: 500, width: 1000 });

        charts[1].type = 'line'
        const result = ScaleModel.getScaleKey(['BMW', 'LADA', 'MECEDES'], 'vertical', canvasModel, charts, charts.filter(chart => chart.type === 'bar'));
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

    test('get scale linear', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin({ bottom: 20, left: 20, right: 20, top: 20 });
        canvasModel.initBlockSize({ height: 500, width: 1000 });

        const result = ScaleModel.getScaleLinear(options, data[dataSource], canvasModel);
        expect(result).toEqual({
            domain: [0, 120],
            range: {
                start: 0, end: 460
            },
            type: 'linear'
        })
    });
});