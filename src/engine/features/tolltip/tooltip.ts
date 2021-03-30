import { select, Selection, pointer, } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, DataRow, DataSource, IntervalChartModel, Model, OptionsModelData, Orient, PolarChartModel, ScaleKeyModel, TwoDimensionalChartModel } from "../../../model/model";
import { Block } from "../../block/block";
import { TooltipDomHelper } from "./tooltipDomHelper";
import { Donut } from "../../polarNotation/donut/donut";
import { ChartOrientation, Size } from "../../../config/config";
import { Scales } from '../scale/scale';
import { AxisScale } from 'd3-axis';
import { TooltipComponentsManager } from './tooltipComponentsManager';
import { ElementHighlighter } from '../../elementHighlighter/elementHighlighter';
import { DonutHelper } from '../../polarNotation/donut/DonutHelper';
import { TipBox } from '../tipBox/tipBox';
import { TipBoxHelper } from '../tipBox/tipBoxHelper';
import { Helper } from '../../helpers/helper';
import { TooltipHelper } from './tooltipHelper';

export class Tooltip {
    public static readonly tooltipBlockClass = 'tooltip-block';
    public static readonly tooltipLineClass = 'tooltip-line';
    public static readonly tooltipWrapperClass = 'tooltip-wrapper';
    public static readonly tooltipContentClass = 'tooltip-content';
    public static readonly tooltipArrowClass = 'tooltip-arrow';

    public static render(block: Block, model: Model, data: DataSource, scales?: Scales): void {
        TooltipComponentsManager.renderTooltipWrapper(block);
        const chartsWithTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel) => chart.tooltip.show);
        if (chartsWithTooltipIndex !== -1) {
            if (model.options.type === '2d') {
                this.renderTooltipFor2DCharts(block, model.options.charts, data, model.options.data, model.blockCanvas.size, model.chartBlock.margin, model.options.orient, scales.key, model.options.scale.key, model.options.axis.key.orient);
            } else if (model.options.type === 'polar') {
                this.renderTooltipForPolar(block, model.options.charts, data, model.options.data, model.blockCanvas.size, model.chartBlock.margin, DonutHelper.getThickness(model.chartSettings.donut, model.blockCanvas.size, model.chartBlock.margin));
            }
        }
    }

    public static hide(block: Block): void {
        TooltipComponentsManager.hideTooltipBlock(block.getWrapper().select(`.${this.tooltipBlockClass}`));
    }

    private static renderTooltipFor2DCharts(block: Block, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, margin: BlockMargin, chartOrientation: ChartOrientation, scaleKey: AxisScale<any>, scaleKeyModel: ScaleKeyModel, keyAxisOrient: Orient): void {
        if (scaleKey.domain().length === 0)
            return;

        this.renderLineTooltip(block, scaleKey, margin, blockSize, charts, chartOrientation, keyAxisOrient, data, dataOptions, scaleKeyModel);
    }

    private static renderTooltipForPolar(block: Block, charts: PolarChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, margin: BlockMargin, chartThickness: number): void {
        charts.forEach(chart => {
            const attrTransform = block.getSvg().select(`.${Donut.donutBlockClass}`).attr('transform');
            const translateNums = Helper.getTranslateNumbers(attrTransform);
            const arcItems = Donut.getAllArcGroups(block);
            this.renderTooltipForDonut(block, arcItems, data, dataOptions, chart, blockSize, margin, chartThickness, translateNums[0], translateNums[1]);
        });
    }

    private static renderLineTooltip(block: Block, scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], chartOrientation: ChartOrientation, keyAxisOrient: Orient, data: DataSource, dataOptions: OptionsModelData, scaleKeyModel: ScaleKeyModel): void {
        const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block);
        const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);
        const tooltipLine = TooltipComponentsManager.renderTooltipLine(block);
        const tipBox = TipBox.renderOrGet(block, margin, blockSize);

        ElementHighlighter.renderShadowFilter(block);

        let currentKey: string = null;

        tipBox
            .on('mousemove', function (e) {
                const keyValue = TipBoxHelper.getKeyValueByPointer(pointer(e, this), chartOrientation, margin, blockSize, scaleKey, scaleKeyModel.type);

                if (!currentKey || currentKey !== keyValue) {
                    currentKey = keyValue;
                    TooltipComponentsManager.showTooltipBlock(tooltipBlock);
                    TooltipDomHelper.fillForMulty2DCharts(tooltipContent, charts, data, dataOptions, keyValue);

                    const tooltipCoordinate = TooltipHelper.getTooltipFixedCoordinate(scaleKey, margin, keyValue, block.getSvg().node().getBoundingClientRect(), tooltipContent.node().getBoundingClientRect(), keyAxisOrient, window.innerWidth, window.innerHeight);
                    TooltipComponentsManager.setLineTooltipCoordinate(tooltipBlock, tooltipCoordinate, chartOrientation, block.transitionManager.durations.tooltipSlide);

                    const tooltipLineAttributes = TooltipHelper.getTooltipLineAttributes(scaleKey, margin, keyValue, chartOrientation, blockSize);
                    TooltipComponentsManager.setTooltipLineAttributes(tooltipLine, tooltipLineAttributes, block.transitionManager.durations.tooltipSlide);
                    TooltipComponentsManager.showTooltipLine(tooltipLine);

                    ElementHighlighter.highlight2DElementsHover(block, dataOptions.keyField.name, keyValue, charts, block.transitionManager.durations.markerHover);
                }
            })
            .on('mouseleave', function () {
                TooltipComponentsManager.hideTooltipBlock(tooltipBlock);
                TooltipComponentsManager.hideTooltipLine(tooltipLine);
                currentKey = null;
                ElementHighlighter.removeUnselected2DHighlight(block, dataOptions.keyField.name, charts, block.transitionManager.durations.markerHover);
            });
    }

    private static renderTooltipForDonut(block: Block, elements: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: PolarChartModel, blockSize: Size, margin: BlockMargin, donutThickness: number, translateX: number = 0, translateY: number = 0): void {
        const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block, translateX, translateY);
        const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = TooltipComponentsManager.renderTooltipArrow(tooltipBlock);

        ElementHighlighter.renderShadowFilter(block);

        elements
            .on('mouseover', function (e, dataRow: PieArcDatum<DataRow>) {
                TooltipComponentsManager.showTooltipBlock(tooltipBlock);
                TooltipDomHelper.fillTextForPolarChart(tooltipContent, chart, data, dataOptions, dataRow.data[dataOptions.keyField.name], select(this).select('path').style('fill'))

                const coordinatePointer = TooltipDomHelper.getRecalcedCoordinateByArrow(DonutHelper.getArcCentroid(blockSize, margin, dataRow, donutThickness), tooltipBlock, blockSize, tooltipArrow, translateX, translateY);
                const tooltipCoordinate = TooltipHelper.getCoordinateByPointer(coordinatePointer);
                TooltipComponentsManager.setBlockCoordinate(tooltipBlock, tooltipCoordinate);

                const clones = Donut.getAllArcClones(block)
                    .filter((d: PieArcDatum<DataRow>) => d.data[dataOptions.keyField.name] === dataRow.data[dataOptions.keyField.name]);
                if (clones.nodes().length === 0) {
                    ElementHighlighter.renderArcCloneAndHighlight(block, margin, select(this), blockSize, donutThickness);
                }
            });

        elements.on('mouseleave', function (e, dataRow: PieArcDatum<DataRow>) {
            TooltipComponentsManager.hideTooltipBlock(tooltipBlock);
            if (!block.filterEventManager.isSelected(dataRow.data[dataOptions.keyField.name], dataOptions.keyField.name)) {
                ElementHighlighter.removeCloneForElem(block, dataOptions.keyField.name, select(this));
                ElementHighlighter.changeDonutHighlightState(select(this), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, false);
            }
        });
    }
}