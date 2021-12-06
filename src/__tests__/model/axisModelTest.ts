import { DataOptions, MdtChartsDataSource, DiscreteAxisOptions, NumberAxisOptions, Size, TwoDimensionalChart, TwoDimensionalOptions } from "../../config/config";
import { TooltipSettings } from "../../designer/designerConfig";
import { AxisModel } from "../../model/featuresModel/axisModel";
import { AxisModelOptions, BlockMargin } from "../../model/model";
import { CanvasModel } from "../../model/modelInstance/canvasModel/canvasModel";

function getData(): MdtChartsDataSource {
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

describe('get axes', () => {
    let charts: TwoDimensionalChart[];
    let data: MdtChartsDataSource;
    let descreteAxisOptions: DiscreteAxisOptions;
    let numberAxisOptions: NumberAxisOptions;
    let dataOptions: DataOptions;
    let margin: BlockMargin;
    let blockSize: Size;
    let tooltipSettings: TooltipSettings;

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
        descreteAxisOptions = { ticks: { flag: false }, position: 'end', visibility: true }
        numberAxisOptions = { ...descreteAxisOptions, domain: { start: 0, end: 120 } }
        data = getData();
        dataOptions = { dataSource: "dataSet_poor", keyField: { name: 'brand', format: null } };
        margin = { top: 20, bottom: 20, left: 20, right: 20 };
        blockSize = { height: 500, width: 1000 };
        tooltipSettings = {
            position: 'fixed'
        }
    });

    test('getKeyAxis should return bottom key axis with straight labels', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin(margin);
        canvasModel.initBlockSize(blockSize);

        const result = AxisModel.getKeyAxis(charts, data, dataOptions, 'vertical', descreteAxisOptions, { maxSize: { main: 60 } }, canvasModel, tooltipSettings);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: 0,
                position: 'straight',
                visible: true,
                defaultTooltip: true
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
        expect(result).toEqual(expected);
    });

    test('getKeyAxis should return left key axis with straight labels', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin(margin);
        canvasModel.initBlockSize(blockSize);

        descreteAxisOptions.position = 'start';
        tooltipSettings.position = 'followCursor';
        const result = AxisModel.getKeyAxis(charts, data, dataOptions, 'horizontal', descreteAxisOptions, { maxSize: { main: 60 } }, canvasModel, tooltipSettings);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: 0,
                position: 'straight',
                visible: true,
                defaultTooltip: false
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
        expect(result).toEqual(expected);
    });

    test('getValueAxis should return left axis', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin(margin);
        canvasModel.initBlockSize(blockSize);

        numberAxisOptions.position = 'start';
        const result = AxisModel.getValueAxis('vertical', numberAxisOptions, { maxSize: { main: 60 } }, canvasModel);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "value",
            cssClass: "value-axis",
            labels: {
                maxSize: 60,
                position: 'straight',
                visible: true,
                defaultTooltip: true
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
        expect(result).toEqual(expected);
    });

    test('getValueAxis should return right axis', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin(margin);
        canvasModel.initBlockSize(blockSize);

        const result = AxisModel.getValueAxis('vertical', numberAxisOptions, { maxSize: { main: 60 } }, canvasModel);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "value",
            cssClass: "value-axis",
            labels: {
                maxSize: 60,
                position: 'straight',
                visible: true,
                defaultTooltip: true
            },
            orient: "right",
            ticks: {
                flag: false
            },
            translate: {
                translateX: 980,
                translateY: 20
            }
        }
        expect(result).toEqual(expected);
    });
});