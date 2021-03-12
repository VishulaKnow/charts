import { select, Selection, pointer } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, DataRow, DataSource, IntervalChartModel, Model, OptionsModelData, Orient, PolarChartModel, ScaleKeyModel, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { TooltipHelper } from "./tooltipHelper";
import { Donut } from "../../polarNotation/donut";
import { ChartOrientation } from "../../../config/config";
import { DonutHelper } from '../../polarNotation/DonutHelper';
import { Scales } from '../scale/scale';
import { AxisScale } from 'd3-axis';
import { NamesManager } from '../../namesManager';
import { TooltipComponentsManager } from './tooltipComponentsManager';
import { ElementHighlighter } from './elementHighlighter';

export class Tooltip {
    public static tipBoxClass = 'tipbox';
    public static tooltipBlockClass = 'tooltip-block';
    public static tooltipLineClass = 'tooltip-line';
    public static tooltipWrapperClass = 'tooltip-wrapper';
    public static tooltipContentClass = 'tooltip-content';
    public static tooltipArrowClass = 'tooltip-arrow';

    public static render(block: Block, model: Model, data: DataSource, scales?: Scales): void {
        this.renderTooltipWrapper(block);
        const chartsWithTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel) => chart.tooltip.show);
        if (chartsWithTooltipIndex !== -1) {
            if (model.options.type === '2d') {
                this.renderTooltipFor2DCharts(block, model.options.charts, data, model.options.data, model.blockCanvas.size, model.chartBlock.margin, model.options.orient, scales.scaleKey, model.options.scale.scaleKey, model.options.axis.keyAxis.orient);
            } else if (model.options.type === 'polar') {
                this.renderTooltipForPolar(block, model.options.charts, data, model.options.data, model.blockCanvas.size, model.chartBlock.margin, DonutHelper.getThickness(model.chartSettings.donut, model.blockCanvas.size, model.chartBlock.margin));
            }
        }
    }

    private static renderTooltipFor2DCharts(block: Block, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, margin: BlockMargin, chartOrientation: ChartOrientation, scaleKey: AxisScale<any>, scaleKeyModel: ScaleKeyModel, keyAxisOrient: Orient): void {
        if (scaleKey.domain().length === 0)
            return;

        this.renderLineTooltip(block, scaleKey, margin, blockSize, charts, chartOrientation, keyAxisOrient, data, dataOptions, scaleKeyModel);
    }

    private static renderTooltipForPolar(block: Block, charts: PolarChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, margin: BlockMargin, chartThickness: number): void {
        charts.forEach(chart => {
            const attrTransform = block.getSvg().select(`.${Donut.donutBlockClass}`).attr('transform');
            const translateNumbers = Helper.getTranslateNumbers(attrTransform);
            const translateX = translateNumbers[0];
            const translateY = translateNumbers[1];

            const arcItems = Donut.getAllArcGroups(block);
            this.renderTooltipForDonut(block, arcItems, data, dataOptions, chart, blockSize, margin, chartThickness, translateX, translateY);
        });
    }

    private static renderLineTooltip(block: Block, scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], chartOrientation: ChartOrientation, keyAxisOrient: Orient, data: DataSource, dataOptions: OptionsModelData, scaleKeyModel: ScaleKeyModel): void {
        const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block);
        const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);

        const tooltipLine = TooltipComponentsManager.renderTooltipLine(block);
        const tipBoxAttributes = TooltipHelper.getTipBoxAttributes(margin, blockSize);
        const tipBox = TooltipComponentsManager.renderTipBox(block, tipBoxAttributes);

        tooltipContent.classed('tooltip-content-2d', true);

        const filterId = NamesManager.getId('shadow', block.id);
        ElementHighlighter.renderShadowFilter(block, filterId);

        let currentKey: string = null;

        tipBox
            .on('mousemove', function (event) {
                const index = TooltipHelper.getKeyIndex(pointer(event, this), chartOrientation, margin, blockSize, scaleKey, scaleKeyModel.type);
                const keyValue = scaleKey.domain()[index];

                if (!currentKey || currentKey !== keyValue) {
                    currentKey = keyValue;

                    TooltipComponentsManager.showTooltipBlock(tooltipBlock);

                    TooltipHelper.fillForMulty2DCharts(tooltipContent, charts, data, dataOptions, keyValue);

                    const tooltipCoordinate = TooltipHelper.getTooltipFixedCoordinate(scaleKey, margin, blockSize, keyValue, tooltipContent.node(), keyAxisOrient);
                    TooltipComponentsManager.setLineTooltipCoordinate(tooltipBlock, tooltipCoordinate, chartOrientation, block.transitionManager.twoDimensionalTooltipDuration);

                    const tooltipLineAttributes = TooltipHelper.getTooltipLineAttributes(scaleKey, margin, keyValue, chartOrientation, blockSize);
                    TooltipComponentsManager.setTooltipLineAttributes(tooltipLine, tooltipLineAttributes, block.transitionManager.twoDimensionalTooltipDuration);
                    TooltipComponentsManager.showTooltipLine(tooltipLine);

                    ElementHighlighter.highlight2DElements(block, dataOptions.keyField.name, keyValue, charts, filterId, block.transitionManager.markerHoverDuration);
                }
            })
            .on('mouseleave', function () {
                TooltipComponentsManager.hideTooltipBlock(tooltipBlock);
                TooltipComponentsManager.hideTooltipLine(tooltipLine);
                currentKey = null;

                ElementHighlighter.remove2DElementsHighlighting(block, charts, block.transitionManager.markerHoverDuration);
            });
    }

    private static renderTooltipForDonut(block: Block, elemets: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: PolarChartModel, blockSize: Size, margin: BlockMargin, donutThickness: number, translateX: number = 0, translateY: number = 0): void {
        const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block, translateX, translateY);
        const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = TooltipComponentsManager.renderTooltipArrow(tooltipBlock);

        tooltipContent.classed('tooltip-content-2d', true);

        const filterId = NamesManager.getId('shadow', block.id);
        ElementHighlighter.renderShadowFilter(block, filterId);

        elemets
            .on('mouseover', function (_event, dataRow) {
                TooltipComponentsManager.showTooltipBlock(tooltipBlock);
                TooltipHelper.fillTooltipForPolarChart(tooltipContent, chart, data, dataOptions, dataRow.data[dataOptions.keyField.name], select(this).select('path').style('fill'))

                const coordinatePointer: [number, number] = TooltipHelper.getRecalcedCoordinateByArrow(DonutHelper.getArcCentroid(blockSize, margin, dataRow, donutThickness), tooltipBlock, blockSize, tooltipArrow, translateX, translateY);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                TooltipComponentsManager.setTooltipBlockCoordinate(tooltipBlock, tooltipCoordinate);

                select(this).style('filter', `url(#${filterId})`);

                ElementHighlighter.changeDonutHighlightAppearance(select<SVGGElement, PieArcDatum<DataRow>>(this), margin, blockSize, donutThickness, block.transitionManager.donutArcHoverDuration, true);
            });

        elemets.on('mouseleave', function () {
            TooltipComponentsManager.hideTooltipBlock(tooltipBlock);
            ElementHighlighter.removeElementsFilter(select(this));

            ElementHighlighter.changeDonutHighlightAppearance(select<SVGGElement, PieArcDatum<DataRow>>(this), margin, blockSize, donutThickness, block.transitionManager.donutArcHoverDuration, false);
        });
    }

    private static renderTooltipWrapper(block: Block): void {
        let tooltipWrapper = block.getWrapper()
            .select(`.${this.tooltipWrapperClass}`)

        if (tooltipWrapper.empty())
            block.getWrapper()
                .append('div')
                .attr('class', this.tooltipWrapperClass);
    }
}