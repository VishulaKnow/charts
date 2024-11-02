import { TwoDimensionalModelHelper } from "../../model/helpers/twoDimensionalModelHelper";
import { MdtChartsDataRow, MdtChartsTwoDimensionalChart } from "../../config/config";
import { MarkDotDatumItem, TwoDimensionalChartModel } from "../../model/model";

describe('shouldMarkerShow', () => {

    let chart: MdtChartsTwoDimensionalChart;
    let dataRows: MdtChartsDataRow[];
    let valueFieldName: string;
    let currentRow: MarkDotDatumItem;
    let keyFieldName: string

    beforeEach(() => {
        chart = {
            isSegmented: false,
            type: 'line',
            data: {
                valueFields: [
                    {
                        name: 'price',
                        format: 'money',
                        title: 'Количество автомобилей на душу населения'
                    }
                ]
            },
            markers: {
                show: false
            },
            embeddedLabels: 'key'
        }
        dataRows = [
            { $id: 1, brand: 'BMW', price: 100000, count: 10000, color: 'red', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 2, brand: 'LADA', price: 0, count: 1000, color: 'green', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 3, brand: 'MERCEDES', price: 15000, count: 1200, color: 'blue', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 4, brand: 'AUDI', price: null, count: 500, color: 'yellow', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 5, brand: 'VOLKSWAGEN', price: 115000, count: 6000, color: 'cyan', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 6, brand: 'DODGE', price: null, count: 4000, color: 'red', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 7, brand: 'SAAB', price: 50000, count: 11000, color: 'orange', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 8, brand: 'HONDA', price: 20000, count: 2000, color: 'brown', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 9, brand: 'TOYOTA', price: null, count: 15000, color: 'pink', $mdtChartsMetadata: { valueFieldName: 'price' } },
            { $id: 9, brand: 'LEXUS', price: 15000, count: 15000, color: 'pink', $mdtChartsMetadata: { valueFieldName: 'price' } },
        ];
        valueFieldName = 'price';
        keyFieldName = 'brand';
    })

    test('should return false, because currentRow is the first one but nextRow has value', () => {
        currentRow = dataRows[0];
        const res = TwoDimensionalModelHelper.shouldMarkerShow(chart, dataRows, valueFieldName, currentRow, keyFieldName)
        expect(res).toBeFalsy();
    });

    test('should return true, because currentRow is the first one and nextRow with the value null', () => {
        dataRows[1][valueFieldName] = null;
        currentRow = dataRows[0];
        const res = TwoDimensionalModelHelper.shouldMarkerShow(chart, dataRows, valueFieldName, currentRow, keyFieldName)
        expect(res).toBeTruthy();
    });

    test('should return true, because currentRow is the last one and previousRow with the value null', () => {
        currentRow = dataRows[dataRows.length - 1];
        const res = TwoDimensionalModelHelper.shouldMarkerShow(chart, dataRows, valueFieldName, currentRow, keyFieldName)
        expect(res).toBeTruthy();
    });

    test('should return true, because currentRow has neighborsRows with the value null', () => {
        currentRow = dataRows[4];
        const res = TwoDimensionalModelHelper.shouldMarkerShow(chart, dataRows, valueFieldName, currentRow, keyFieldName)
        expect(res).toBeTruthy();
    });

    test('should return true, because dataRows has only one row', () => {
        dataRows = [dataRows[0]];
        currentRow = dataRows[0];
        const res = TwoDimensionalModelHelper.shouldMarkerShow(chart, dataRows, valueFieldName, currentRow, keyFieldName)
        expect(res).toBeTruthy();
    });

    test('should return false, because there is no such row in dataRows ', () => {
        currentRow = { ...dataRows[0] };
        currentRow[keyFieldName] = 'someKeyField';
        const res = TwoDimensionalModelHelper.shouldMarkerShow(chart, dataRows, valueFieldName, currentRow, keyFieldName)
        expect(res).toBeFalsy();
    });
});

describe('getGradientDefs', () => {

    let charts: TwoDimensionalChartModel[];

    beforeEach(() => {
        charts = [
            {
                type: 'area',
                isSegmented: false,
                data: null,
                tooltip: null,
                cssClasses: null,
                style: {
                    opacity: 1,
                    elementColors: ['green', 'red'],
                },
                embeddedLabels: null,
                markersOptions: null,
                lineLikeViewOptions: null,
                barViewOptions: null,
                legend: null,
                index: 1,
                areaViewOptions: {
                    fill: {
                        type: "gradient",
                        ids: [
                            'gradient-chart-1-sub-0',
                            'gradient-chart-1-sub-1'
                        ]
                    },
                    borderLine: {
                        on: true,
                        colorStyle: {
                            opacity: 1,
                            elementColors: ['green', 'red'],
                        },
                    }
                }
            },
            {
                type: 'line',
                isSegmented: false,
                data: null,
                tooltip: null,
                cssClasses: null,
                style: {
                    opacity: 1,
                    elementColors: ['green', 'red'],
                },
                embeddedLabels: null,
                markersOptions: null,
                lineLikeViewOptions: null,
                barViewOptions: null,
                legend: null,
                index: 2,
                areaViewOptions: {
                    fill: { type: "paletteColor" },
                    borderLine: {
                        on: false,
                        colorStyle: null,
                    }
                }
            },
        ]
    })

    test('should return array with two gradients of chart area type', () => {
        const gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'right', 'horizontal')

        expect(gradients.length).toEqual(2);
        expect(gradients[0].id).toEqual('gradient-chart-1-sub-0');
        expect(gradients[1].id).toEqual('gradient-chart-1-sub-1');
    });

    test('should return empty array because no charts area type', () => {
        charts[0].type = 'line';
        const gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'right', 'horizontal')

        expect(gradients.length).toEqual(0);
    });

    test('should return empty array because no areaViewOptions in charts', () => {
        charts[0].type = "line";
        const gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'right', 'horizontal')

        expect(gradients.length).toEqual(0);
    });

    test('should return opacity of gradient items 0 and 1, because keyAxisOrient is left', () => {
        const gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'left', 'horizontal')

        expect(gradients[0].items[0].opacity).toEqual(0);
        expect(gradients[0].items[1].opacity).toEqual(0.3);
    });

    test('should return opacity of gradient items 1 and 0, because keyAxisOrient is right', () => {
        const gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'right', 'horizontal')

        expect(gradients[0].items[0].opacity).toEqual(0.3);
        expect(gradients[0].items[1].opacity).toEqual(0);
    });

    test('should return y2 equal to 1 and x2 equal to 0, because chartOrient is vertical', () => {
        const gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'top', 'vertical')
        const expectedPosition = { x1: 0, y1: 0, x2: 0, y2: 1 };

        expect(gradients[0].position).toEqual(expectedPosition);
    });

    test('should return y2 equal to 0 and x2 equal to 1, because chartOrient is horizontal', () => {
        const gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'left', 'horizontal')
        const expectedPosition = { x1: 0, y1: 0, x2: 1, y2: 0 };

        expect(gradients[0].position).toEqual(expectedPosition);
    });

    it('should return first color by chart if chart key axis is bottom or right', () => {
        let gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'bottom', 'vertical')
        expect(gradients[0].items[0].color).toEqual('green');
        expect(gradients[0].items[1].color).toEqual('white');

        gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'right', 'horizontal')
        expect(gradients[0].items[0].color).toEqual('green');
        expect(gradients[0].items[1].color).toEqual('white');
    });

    it('should return second color by chart if chart key axis is top or left', () => {
        let gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'top', 'vertical')
        expect(gradients[0].items[0].color).toEqual('white');
        expect(gradients[0].items[1].color).toEqual('green');

        gradients = TwoDimensionalModelHelper.getGradientDefs(charts, 'left', 'horizontal')
        expect(gradients[0].items[0].color).toEqual('white');
        expect(gradients[0].items[1].color).toEqual('green');
    });
});
