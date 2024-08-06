import { DataOptions, MdtChartsDataSource, DiscreteAxisOptions, NumberAxisOptions, Size, MdtChartsTwoDimensionalChart, MdtChartsTwoDimensionalOptions, AxisLabelPosition, ShowTickFn } from "../../config/config";
import { TooltipSettings } from "../../designer/designerConfig";
import { AxisModel, MINIMAL_HORIZONTAL_STEP_SIZE, MINIMAL_VERTICAL_STEP_SIZE } from "../../model/featuresModel/axisModel";
import { AxisModelService, showAllTicks } from "../../model/featuresModel/axisModelService";
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
    let charts: MdtChartsTwoDimensionalChart[];
    let data: MdtChartsDataSource;
    let discreteAxisOptions: DiscreteAxisOptions;
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
        discreteAxisOptions = { ticks: { flag: false }, position: 'end', visibility: true }
        numberAxisOptions = { ...discreteAxisOptions, domain: { start: 0, end: 120 }, labels: null }
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

        const result = AxisModel.getKeyAxis({ charts, orientation: "vertical", data: dataOptions, axis: { key: discreteAxisOptions } } as any, data, { maxSize: { main: 60 } }, canvasModel, tooltipSettings);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: 0,
                position: 'straight',
                visible: true,
                defaultTooltip: true,
                showTick: showAllTicks,
                linearTickStep: MINIMAL_HORIZONTAL_STEP_SIZE
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

        discreteAxisOptions.position = 'start';
        tooltipSettings.position = 'followCursor';
        const result = AxisModel.getKeyAxis({ charts, orientation: "horizontal", data: dataOptions, axis: { key: discreteAxisOptions } } as any, data, { maxSize: { main: 60 } }, canvasModel, tooltipSettings);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: 0,
                position: 'straight',
                visible: true,
                defaultTooltip: false,
                showTick: showAllTicks,
                linearTickStep: MINIMAL_HORIZONTAL_STEP_SIZE
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

    test('getKeyAxis should return rule to show tick', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin(margin);
        canvasModel.initBlockSize({ height: 400, width: 140 });
        dataOptions.dataSource = "dataSet";

        const result = AxisModel.getKeyAxis({ charts, orientation: "vertical", data: dataOptions, axis: { key: discreteAxisOptions } } as any, data, { maxSize: { main: 60 } }, canvasModel, tooltipSettings);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: 0,
                position: 'straight',
                visible: true,
                defaultTooltip: true,
                showTick: (d, i) => i % 2 === 0 ? d : undefined,
                linearTickStep: MINIMAL_HORIZONTAL_STEP_SIZE
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

        const showTickExpected = expected.labels.showTick;
        const showTickResult = result.labels.showTick;

        for (let i = 0; i < data[dataOptions.dataSource].length; i++) {
            expect(showTickExpected("key", i)).toBe(showTickResult("key", i));
        }
    });

    test('getKeyAxis should use tick space from rule from config if it is set', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin(margin);
        canvasModel.initBlockSize({ height: 400, width: 140 });
        dataOptions.dataSource = "dataSet";
        discreteAxisOptions.labels = { showRule: { spaceForOneLabel: 25 } }

        const result = AxisModel.getKeyAxis({ charts, orientation: "vertical", data: dataOptions, axis: { key: discreteAxisOptions } } as any, data, { maxSize: { main: 60 } }, canvasModel, tooltipSettings);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: 0,
                position: 'straight',
                visible: true,
                defaultTooltip: true,
                showTick: (d, i) => i % 3 === 0 ? d : undefined,
                linearTickStep: MINIMAL_HORIZONTAL_STEP_SIZE
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

        const showTickExpected = expected.labels.showTick;
        const showTickResult = result.labels.showTick;

        for (let i = 0; i < data[dataOptions.dataSource].length; i++) {
            expect(showTickExpected("key", i)).toBe(showTickResult("key", i));
        }
    });

    test('getKeyAxis should return rule from config if it set', () => {
        const canvasModel = new CanvasModel();
        canvasModel.initMargin(margin);
        canvasModel.initBlockSize({ height: 400, width: 140 });
        dataOptions.dataSource = "dataSet";
        const showRule: ShowTickFn = (d, i) => i % 10 ? d : undefined;
        discreteAxisOptions.labels = { showRule: { showTickFn: showRule } }

        const result = AxisModel.getKeyAxis({ charts, orientation: "vertical", data: dataOptions, axis: { key: discreteAxisOptions } } as any, data, { maxSize: { main: 60 } }, canvasModel, tooltipSettings);
        const expected: AxisModelOptions = {
            visibility: true,
            type: "key",
            cssClass: "key-axis",
            labels: {
                maxSize: 0,
                position: 'straight',
                visible: true,
                defaultTooltip: true,
                showTick: showRule,
                linearTickStep: MINIMAL_HORIZONTAL_STEP_SIZE
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

        const showTickExpected = expected.labels.showTick;
        const showTickResult = result.labels.showTick;

        expect(showTickExpected).toBe(showTickResult);
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
                defaultTooltip: true,
                showTick: showAllTicks,
                linearTickStep: MINIMAL_VERTICAL_STEP_SIZE
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
                defaultTooltip: true,
                showTick: showAllTicks,
                linearTickStep: MINIMAL_VERTICAL_STEP_SIZE
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

describe('AXisModelService', () => {
    describe('getKeyAxisLabelPosition', () => {
        const service = new AxisModelService();

        test('should return value from config if it exists and equal values from type', () => {
            let res = service.getKeyAxisLabelPosition(0, 0, "rotated");
            expect(res).toBe<AxisLabelPosition>("rotated");

            res = service.getKeyAxisLabelPosition(0, 0, "straight");
            expect(res).toBe<AxisLabelPosition>("straight");
        });

        test('should return "straight" if band has more or equal 50px', () => {
            let res = service.getKeyAxisLabelPosition(1000, 20);
            expect(res).toBe<AxisLabelPosition>("straight"); // 1000 / 20 = 50

            res = service.getKeyAxisLabelPosition(1000, 10);
            expect(res).toBe<AxisLabelPosition>("straight"); // 1000 / 10 = 1000
        });

        test('should return "rotated" if band has less than 50px', () => {
            let res = service.getKeyAxisLabelPosition(1000, 40);
            expect(res).toBe<AxisLabelPosition>("rotated"); // 1000 / 40 = 25
        });

        test('should ignore value from config if it is not from type', () => {
            let res = service.getKeyAxisLabelPosition(1000, 40, "straight2" as any);
            expect(res).toBe<AxisLabelPosition>("rotated"); // 1000 / 40 = 25

            res = service.getKeyAxisLabelPosition(1000, 10, "rotated2" as any);
            expect(res).toBe<AxisLabelPosition>("straight"); // 1000 / 10 = 1000
        });
    });
});