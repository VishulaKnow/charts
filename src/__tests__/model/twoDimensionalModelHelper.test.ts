import { TwoDimensionalModelHelper } from "../../model/helpers/twoDimensionalModelHelper";
import { MdtChartsDataRow, MdtChartsLineLikeChartDashedStyles, MdtChartsTwoDimensionalChart, MdtChartsTwoDimensionalValueLabels } from "../../config/config";
import { MarkDotDatumItem, TwoDimensionalChartLegendLineModel, TwoDimensionalChartModel } from "../../model/model";
import { getLegendMarkerOptions, getLineViewOptions, getSegmentedRadiusValues, getWidthOfLegendMarkerByType, LINE_CHART_DEFAULT_WIDTH, parseDashStyles } from "../../model/notations/twoDimensional/styles";
import { styledElementValues } from "../../model/modelBuilder";
import { CanvasModel } from "../../model/modelInstance/canvasModel/canvasModel";

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
                },
                dotViewOptions: null,
                valueLabels: null
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
                },
                dotViewOptions: null,
                valueLabels: null
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

describe('getSegmentedRadiusValues', () => {

    test('should return radius for bottomLeft and bottomRight equal to 2, because key position is bottom and the segment of bars is first', () => {
        const radiusValues = getSegmentedRadiusValues(3, 0, 'bottom', 2);

        expect(radiusValues.topLeft).toEqual(0);
        expect(radiusValues.topRight).toEqual(0);
        expect(radiusValues.bottomLeft).toEqual(2);
        expect(radiusValues.bottomRight).toEqual(2);
    });

    test('should return radius for topLeft and topRight equal to 2, because key position is bottom and the segment of bars is last', () => {
        const radiusValues = getSegmentedRadiusValues(3, 2, 'bottom', 2);

        expect(radiusValues.topLeft).toEqual(2);
        expect(radiusValues.topRight).toEqual(2);
        expect(radiusValues.bottomLeft).toEqual(0);
        expect(radiusValues.bottomRight).toEqual(0);
    });

    test('should return radius for topLeft and bottomLeft equal to 2, because key position is left and the segment of bars is first', () => {
        const radiusValues = getSegmentedRadiusValues(3, 0, 'left', 2);

        expect(radiusValues.topLeft).toEqual(2);
        expect(radiusValues.topRight).toEqual(0);
        expect(radiusValues.bottomLeft).toEqual(2);
        expect(radiusValues.bottomRight).toEqual(0);
    });

    test('should return radius for topRight and bottomRight equal to 2, because key position is left and the segment of bars is last', () => {
        const radiusValues = getSegmentedRadiusValues(3, 2, 'left', 2);

        expect(radiusValues.topLeft).toEqual(0);
        expect(radiusValues.topRight).toEqual(2);
        expect(radiusValues.bottomLeft).toEqual(0);
        expect(radiusValues.bottomRight).toEqual(2);
    });

    test('should return radius for all sides equal to 0, because the segment of bars is not first or last', () => {
        const radiusValues = getSegmentedRadiusValues(3, 1, 'bottom', 2);

        expect(radiusValues.topLeft).toEqual(0);
        expect(radiusValues.topRight).toEqual(0);
        expect(radiusValues.bottomLeft).toEqual(0);
        expect(radiusValues.bottomRight).toEqual(0);
    });

    test('should return radius for all sides equal to 2, because length of segments amount equal to 1', () => {
        const radiusValues = getSegmentedRadiusValues(1, 0, 'bottom', 2);

        expect(radiusValues.topLeft).toEqual(2);
        expect(radiusValues.topRight).toEqual(2);
        expect(radiusValues.bottomLeft).toEqual(2);
        expect(radiusValues.bottomRight).toEqual(2);
    });
});

describe('getLegendMarkerOptions', () => {

    let chart: MdtChartsTwoDimensionalChart;

    beforeEach(() => {
        chart = {
            isSegmented: false,
            type: 'dot',
            data: null,
            embeddedLabels: 'none',
            markers: {
                show: false
            },
            lineStyles: {
                dash: {
                    on: true,
                    dashSize: 3,
                    gapSize: 3
                },
                width: 10
            },
            barStyles: {
                hatch: {
                    on: false
                }
            },
            dotLikeStyles: {
                shape: {
                    type: "line",
                    width: 5
                }
            },
            valueLabels: {
                on: true
            }
        }
    });

    test('should return line because chart type is dot and type of dot styles is line', () => {
        const result = getLegendMarkerOptions(chart);

        expect(result.markerShape).toEqual('line');
    });

    test('should return line because chart type is dot and dotLikeStyles is empty', () => {
        chart.dotLikeStyles = null;
        const result = getLegendMarkerOptions(chart);

        expect(result.markerShape).toEqual('line');
    });

    test('should return line because chart type is dot and shape is empty', () => {
        chart.dotLikeStyles.shape = null;
        const result = getLegendMarkerOptions(chart);

        expect(result.markerShape).toEqual('line');
    });

    test('should return line because chart type is dot and type of shape is empty', () => {
        chart.dotLikeStyles.shape.type = null;
        const result = getLegendMarkerOptions(chart);

        expect(result.markerShape).toEqual('line');
    });

    test('should return ', () => {
        const result = getLegendMarkerOptions(chart);

        expect(result.markerShape).toEqual('line');
    });

})

describe('getLineViewOptions', () => {

    let chart: MdtChartsTwoDimensionalChart;

    beforeEach(() => {
        chart = {
            isSegmented: false,
            type: 'line',
            data: null,
            embeddedLabels: 'none',
            markers: {
                show: false
            },
            lineStyles: {
                dash: {
                    on: true,
                    dashSize: 3,
                    gapSize: 3
                },
                width: 10
            },
            barStyles: {
                hatch: {
                    on: false
                }
            },
            areaStyles: {
                borderLine: {
                    on: true,
                }
            },
            dotLikeStyles: {
                shape: {
                    type: "line",
                    width: 5
                }
            },
            valueLabels: {
                on: true
            }
        }
    })

    test('should return lineViewOptions for line type chart', () => {
        const result = getLineViewOptions(chart);
        const expected: TwoDimensionalChartLegendLineModel = {
            dashedStyles: {
                on: true,
                dashSize: 3,
                gapSize: 3
            },
            strokeWidth: 10,
            length: 24
        };

        expect(result).toEqual(expected);
    });

    test('should return lineViewOptions for dot type chart', () => {
        chart.type = 'dot';

        const result = getLineViewOptions(chart);
        const expected: TwoDimensionalChartLegendLineModel = {
            dashedStyles: {
                on: false,
                dashSize: 0,
                gapSize: 0
            },
            strokeWidth: 5,
            length: 24
        };

        expect(result).toEqual(expected);
    });

    test('should return lineViewOptions for area type chart', () => {
        chart.type = 'area';

        const result = getLineViewOptions(chart);
        const expected: TwoDimensionalChartLegendLineModel = {
            dashedStyles: {
                on: false,
                dashSize: 0,
                gapSize: 0
            },
            strokeWidth: LINE_CHART_DEFAULT_WIDTH,
            length: 24
        };

        expect(result).toEqual(expected);
    });

    test('should return strokeWidth equal to LINE_CHART_DEFAULT_WIDTH, because lineStyles is empty', () => {
        chart.lineStyles = null;
        const result = getLineViewOptions(chart);

        expect(result.strokeWidth).toEqual(LINE_CHART_DEFAULT_WIDTH);
    });

    test('should return strokeWidth equal to LINE_CHART_DEFAULT_WIDTH, because width is empty', () => {
        chart.lineStyles.width = null;
        const result = getLineViewOptions(chart);

        expect(result.strokeWidth).toEqual(LINE_CHART_DEFAULT_WIDTH);
    });

    test('should return strokeWidth equal to LINE_CHART_DEFAULT_WIDTH, because dotLikeStyles is empty', () => {
        chart.type = 'dot';
        chart.dotLikeStyles = null;
        const result = getLineViewOptions(chart);

        expect(result.strokeWidth).toEqual(LINE_CHART_DEFAULT_WIDTH);
    });

    test('should return strokeWidth equal to LINE_CHART_DEFAULT_WIDTH, because shape is empty', () => {
        chart.type = 'dot';
        chart.dotLikeStyles.shape = null;
        const result = getLineViewOptions(chart);

        expect(result.strokeWidth).toEqual(LINE_CHART_DEFAULT_WIDTH);
    });

    test('should return strokeWidth equal to LINE_CHART_DEFAULT_WIDTH, because width is empty', () => {
        chart.type = 'dot';
        chart.dotLikeStyles.shape.width = null;
        const result = getLineViewOptions(chart);

        expect(result.strokeWidth).toEqual(LINE_CHART_DEFAULT_WIDTH);
    });

    test('should return strokeWidth equal to LINE_CHART_DEFAULT_WIDTH, because areaStyles is empty', () => {
        chart.type = 'area';
        chart.areaStyles = null;
        const result = getLineViewOptions(chart);

        expect(result.strokeWidth).toEqual(LINE_CHART_DEFAULT_WIDTH);
    });

    test('should return strokeWidth equal to LINE_CHART_DEFAULT_WIDTH, because borderLine is empty', () => {
        chart.type = 'area';
        chart.areaStyles.borderLine = null;
        const result = getLineViewOptions(chart);

        expect(result.strokeWidth).toEqual(LINE_CHART_DEFAULT_WIDTH);
    });
});

describe('getWidthOfLegendMarkerByType', () => {

    test('should return width equal to 8', () => {
        const result = getWidthOfLegendMarkerByType('bar');

        expect(result).toEqual(8);
    });

    test('should return width equal to 24', () => {
        const result = getWidthOfLegendMarkerByType('line');

        expect(result).toEqual(24);
    });

    test('should return width from styledElementValues', () => {
        const result = getWidthOfLegendMarkerByType('area');

        expect(result).toEqual(styledElementValues.defaultLegendMarkerSizes.widthPx);
    });

});

describe('parseDashStyles', () => {

    let dashOptionsConfig: MdtChartsLineLikeChartDashedStyles;

    beforeEach(() => {
        dashOptionsConfig = {
            on: true,
            dashSize: 3,
            gapSize: 3
        }
    })

    test('should return dashStyles from config', () => {
        const result = parseDashStyles(dashOptionsConfig);

        expect(result).toEqual({
            on: true,
            dashSize: 3,
            gapSize: 3
        });
    });

    test('should return dash with default values, because dashSize and gapSize are not exist', () => {
        delete dashOptionsConfig.dashSize
        delete dashOptionsConfig.gapSize
        const result = parseDashStyles({ on: true });

        expect(result).toEqual({
            on: true,
            dashSize: 10,
            gapSize: 3
        });
    });

    test('should return dashStyles off, because dashOptions is empty', () => {
        dashOptionsConfig = null;
        const result = parseDashStyles();

        expect(result.on).toBeFalsy();
    });
});

describe('getValueLabels', () => {
    let canvasModelMock: CanvasModel;
    let valueLabels: MdtChartsTwoDimensionalValueLabels;

    beforeEach(() => {
        valueLabels = { collision: { otherValueLabels: { mode: "hide" } } };
        canvasModelMock = new CanvasModel();
    });

    test('should return shift value mode for left and right sides, because chartOrientation is vertical', () => {
        const result = TwoDimensionalModelHelper.getValueLabels(valueLabels, canvasModelMock, 'vertical', { fontSize: 10, color: "rgba(68, 68, 68, 0.7)" });

        expect(result.collision.chartBlock.left.mode).toEqual('shift');
        expect(result.collision.chartBlock.right.mode).toEqual('shift');
        expect(result.collision.chartBlock.top.mode).toEqual('none');
        expect(result.collision.chartBlock.bottom.mode).toEqual('none');
    });

    test('should return shift value mode for top and bottom sides, because chartOrientation is horizontal', () => {
        const result = TwoDimensionalModelHelper.getValueLabels(valueLabels, canvasModelMock, 'horizontal', { fontSize: 10, color: "rgba(68, 68, 68, 0.7)" });

        expect(result.collision.chartBlock.left.mode).toEqual('none');
        expect(result.collision.chartBlock.right.mode).toEqual('none');
        expect(result.collision.chartBlock.top.mode).toEqual('shift');
        expect(result.collision.chartBlock.bottom.mode).toEqual('shift');
    });
});