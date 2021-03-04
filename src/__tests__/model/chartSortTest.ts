import { TwoDimensionalChart } from "../../config/config";
import { TwoDimensionalModel } from "../../model/twoDimensionalModel";

describe('check chart sorting in order: [area, bar, line]', () => {
    test('charts must be sorted', () => {
        const charts: TwoDimensionalChart[] = [
            {
                type: 'line',
                markers: {
                    show: true
                },
                isSegmented: true,
                data: {
                    valueFields: [
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
                embeddedLabels: 'none',
            },
            {
                type: 'bar',
                markers: {
                    show: true
                },
                isSegmented: true,
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
                embeddedLabels: 'none'
            }
        ];
        TwoDimensionalModel.sortCharts(charts);
        expect(charts.map(ch => ch.type)).toEqual(['bar', 'line']);
    });

    test('charts must be sorted', () => {
        const charts: TwoDimensionalChart[] = [
            {
                type: 'area',
                markers: {
                    show: true
                },
                isSegmented: true,
                data: {
                    valueFields: [
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
                embeddedLabels: 'none'
            },
            {
                type: 'line',
                markers: {
                    show: true
                },
                isSegmented: true,
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
                embeddedLabels: 'none'
            },
            {
                type: 'bar',
                markers: {
                    show: true
                },
                isSegmented: true,
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
                embeddedLabels: 'none'
            },
            {
                type: 'area',
                markers: {
                    show: true
                },
                isSegmented: true,
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
                embeddedLabels: 'none'
            }
        ];
        TwoDimensionalModel.sortCharts(charts);
        expect(charts.map(ch => ch.type)).toEqual(['area', 'area', 'bar', 'line']);
    });
});