import { DataOptions, DiscreteAxisOptions, Size, TwoDimensionalChart, TwoDimensionalOptions } from "../../config/config";
import { AxisModel } from "../../model/featuresModel/axisModel";
import { AxisModelOptions, BlockMargin, DataSource } from "../../model/model";

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

describe('get key axis', () => {
    let charts: TwoDimensionalChart[];
    let data: DataSource;
    let axisOptions: DiscreteAxisOptions;
    let dataOptions: DataOptions;
    let margin: BlockMargin;
    let blockSize: Size;

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
        ];
        axisOptions = { ticks: { flag: false }, position: 'end', visibility: true }
        data = getData();
        dataOptions = { dataSource: "dataSet_poor", keyField: { name: 'brand', format: null } };
        margin = { top: 20, bottom: 20, left: 20, right: 20 };
        blockSize = { height: 500, width: 1000 }
    });

    test('should return bottom key axis with straight labels', () => {
        const result = AxisModel.getKeyAxis(charts, data, dataOptions, 'vertical', axisOptions, { maxSize: { main: 60, orthogonal: null } }, margin, blockSize);
        result.labels.maxSize = null;
        const toExpect: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: null,
                positition: 'straight',
                visible: true
            },
            orient: "bottom",
            ticks: {
                flag: false
            },
            translate: {
                translateX: 20,
                translateY: 480
            }
        }
        expect(result).toEqual(toExpect);
    });

    test('should return left key axis with straight labels', () => {
        axisOptions.position = 'start';
        const result = AxisModel.getKeyAxis(charts, data, dataOptions, 'horizontal', axisOptions, { maxSize: { main: 60, orthogonal: null } }, margin, blockSize);
        result.labels.maxSize = null;
        const toExpect: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: null,
                positition: 'straight',
                visible: true
            },
            orient: "left",
            ticks: {
                flag: false
            },
            translate: {
                translateX: 20,
                translateY: 20
            }
        }
        expect(result).toEqual(toExpect);
    });
});