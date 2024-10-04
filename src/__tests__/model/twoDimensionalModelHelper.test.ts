import { TwoDimensionalModelHelper } from "../../model/helpers/twoDimensionalModelHelper";
import { MdtChartsDataRow, MdtChartsTwoDimensionalChart } from "../../config/config";
import { MarkDotDatumItem } from "../../model/model";

describe('shouldMarkerShow', () => {

    let chart: MdtChartsTwoDimensionalChart;
    let dataRows: MdtChartsDataRow[];
    let valueFieldName: string;
    let currentRow: MarkDotDatumItem;
    let keyFieldName: string

    beforeEach(()=> {
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
            tooltip: {
                show: true
            },
            markers: {
                show: false
            },
            embeddedLabels: 'key'
        }
        dataRows = [
            {$id: 1, brand: 'BMW', price: 100000, count: 10000, color: 'red', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 2, brand: 'LADA', price: 0, count: 1000, color: 'green', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 3, brand: 'MERCEDES', price: 15000, count: 1200, color: 'blue', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 4, brand: 'AUDI', price: null, count: 500, color: 'yellow', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 5, brand: 'VOLKSWAGEN', price: 115000, count: 6000, color: 'cyan', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 6, brand: 'DODGE', price: null, count: 4000, color: 'red', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 7, brand: 'SAAB', price: 50000, count: 11000, color: 'orange', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 8, brand: 'HONDA', price: 20000, count: 2000, color: 'brown', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 9, brand: 'TOYOTA', price: null, count: 15000, color: 'pink', $mdtChartsMetadata: { valueFieldName: 'price' }},
            {$id: 9, brand: 'LEXUS', price: 15000, count: 15000, color: 'pink', $mdtChartsMetadata: { valueFieldName: 'price' }},
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
        currentRow = {...dataRows[0]};
        currentRow[keyFieldName] = 'someKeyField';
        const res = TwoDimensionalModelHelper.shouldMarkerShow(chart, dataRows, valueFieldName, currentRow, keyFieldName)
        expect(res).toBeFalsy();
    });
});