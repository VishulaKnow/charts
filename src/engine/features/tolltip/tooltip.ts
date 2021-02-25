import { select, Selection, BaseType, pointer } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, DataRow, DataSource, IntervalChartModel, Model, OptionsModelData, Orient, PolarChartModel, ScaleKeyModel, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { ARROW_DEFAULT_POSITION, ARROW_SIZE, BarHighlighterAttrs, TipBoxAttributes, TooltipCoordinate, TooltipHelper, TooltipLineAttributes } from "./tooltipHelper";
import { Donut } from "../../polarNotation/donut";
import { ChartOrientation } from "../../../config/config";
import { DonutHelper } from '../../polarNotation/DonutHelper';
import { Scales } from '../scale/scale';
import { AxisScale } from 'd3-axis';
import { Bar } from '../../twoDimensionalNotation/bar/bar';
import { Dot } from '../lineDots/dot';

export class Tooltip {
    private static tooltipWrapperClass = 'tooltip-wrapper';
    private static tooltipContentClass = 'tooltip-content';
    private static tooltipBlockClass = 'tooltip-block';
    private static tooltipArrowClass = 'tooltip-arrow';

    public static renderTooltips(block: Block, model: Model, data: DataSource, scales?: Scales): void {
        this.renderTooltipWrapper(block);
        const chartsWithTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel) => chart.tooltip.show);
        if (chartsWithTooltipIndex !== -1) {
            if (model.options.type === '2d') {
                this.rednerTooltipFor2DCharts(block, model.chartBlock.margin, model.options.charts, data, model.options.data, model.blockCanvas.size, model.options.orient, scales.scaleKey, model.options.scale.scaleKey, model.options.axis.keyAxis.orient);
            } else if (model.options.type === 'polar') {
                this.renderTooltipsForDonut(block, model.options.charts, data, model.options.data, model.blockCanvas.size, model.chartBlock.margin, DonutHelper.getThickness(model.chartSettings.donut, model.blockCanvas.size, model.chartBlock.margin));
            } else if (model.options.type === 'interval') {
                this.renderTooltipsForInterval(block, model.options.charts, data, model.options.data, model.blockCanvas.size, model.options.orient);
            }
        }
    }

    private static rednerTooltipFor2DCharts(block: Block, margin: BlockMargin, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, chartOrientation: ChartOrientation, scaleKey: AxisScale<any>, scaleKeyModel: ScaleKeyModel, keyAxisOrient: Orient): void {
        if (scaleKey.domain().length === 0)
            return;

        let elements: Selection<BaseType, DataRow, BaseType, unknown>[] = [];
        charts.forEach(chart => {
            if(chart.type === 'line' || chart.type === 'area')
                elements.push(Dot.getAllDots(block, chart.cssClasses));
            else
                elements.push(Bar.getAllBarItems(block, chart.cssClasses));
        });
        this.renderLineTooltip(elements, block, scaleKey, margin, blockSize, charts, chartOrientation, keyAxisOrient, data, dataOptions, scaleKeyModel);
    }

    private static renderTooltipsForDonut(block: Block, charts: PolarChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, margin: BlockMargin, chartThickness: number): void {
        charts.forEach(chart => {
            const attrTransform = block.getSvg().select(`.${Donut.donutBlockClass}`).attr('transform');
            const translateNumbers = Helper.getTranslateNumbers(attrTransform);
            const translateX = translateNumbers[0];
            const translateY = translateNumbers[1];

            const arcItems = Donut.getAllArcGroups(block);
            this.renderTooltipForDonut(block, arcItems, data, dataOptions, chart, blockSize, margin, chartThickness, translateX, translateY);
        });
    }

    private static renderTooltipsForInterval(block: Block, charts: IntervalChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, chartOrientation: ChartOrientation): void {
        charts.forEach(chart => {
            const bars = block.getSvg()
                .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`);
            this.renderTooltipForGantt(block, bars, data, dataOptions, chart, chartOrientation, blockSize);
        });
    }

    private static renderLineTooltip(elements: Selection<BaseType, DataRow, BaseType, unknown>[], block: Block, scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], chartOrientation: ChartOrientation, keyAxisOrient: Orient, data: DataSource, dataOptions: OptionsModelData, scaleKeyModel: ScaleKeyModel): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const thisClass = this;

        const tooltipLine = this.renderTooltipLine(block);
        const tipBoxAttributes = TooltipHelper.getTipBoxAttributes(margin, blockSize);
        const tipBox = this.renderTipBox(block, tipBoxAttributes);

        let keyValue: string;

        tipBox
            .on('mouseover', function () {
                tooltipBlock.style('display', 'block');
            })
            .on('mousemove', function (event) {
                const index = TooltipHelper.getKeyIndex(pointer(event, this), chartOrientation, margin, blockSize, scaleKey, scaleKeyModel.type);
                keyValue = scaleKey.domain()[index];
                TooltipHelper.fillForMulty2DCharts(tooltipContent, charts, data, dataOptions, keyValue);

                const tooltipCoordinate = TooltipHelper.getTooltipFixedCoordinate(scaleKey, margin, blockSize, keyValue, tooltipContent.node(), keyAxisOrient);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                tooltipLine.style('display', 'block');
                const tooltipLineAttributes = TooltipHelper.getTooltipLineAttributes(scaleKey, margin, keyValue, chartOrientation, blockSize);
                thisClass.setTooltipLineAttributes(tooltipLine, tooltipLineAttributes);
                

                elements.forEach(elementSet => {
                    elementSet.classed('chart-element-highlight', false);
                    elementSet.filter(d => d[dataOptions.keyField.name] === keyValue)
                        .classed('chart-element-highlight', true);
                });
            })
            .on('mouseleave', function () {
                tooltipBlock.style('display', 'none');
                tooltipLine.style('display', 'none');
                
                elements.forEach(elementSet => {
                    elementSet.classed('chart-element-highlight', false);
                });
            });
    }

    private static renderTooltipForBars(block: Block, elemets: Selection<BaseType, DataRow, BaseType, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: TwoDimensionalChartModel, chartOrientation: ChartOrientation, blockSize: Size, margin: BlockMargin): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);

        const thisClass = this;

        let isGrouped: boolean;
        if (chartOrientation === 'vertical')
            isGrouped = parseFloat(elemets.attr('width')) < 10; // grouping bar by one bar width
        else
            isGrouped = parseFloat(elemets.attr('height')) < 10;

        let barHighlighter: Selection<SVGRectElement, unknown, HTMLElement, any>; // серая линия, проходящая от начала бара до конца чарт-блока

        elemets
            .on('mouseover', function (_event, dataRow) {
                thisClass.showTooltipBlock(tooltipBlock);
                const keyValue = TooltipHelper.getKeyForTooltip(dataRow, dataOptions.keyField.name, chart.isSegmented);

                if (isGrouped) {
                    TooltipHelper.fillFor2DChart(tooltipContent, chart, data, dataOptions, keyValue)
                } else {
                    const index = TooltipHelper.getElementIndex(elemets, this, keyValue, dataOptions.keyField.name, chart.isSegmented)
                    TooltipHelper.fillFor2DChart(tooltipContent, chart, data, dataOptions, keyValue, index);
                }

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinateByRect(select(this), tooltipBlock, blockSize, tooltipArrow, chartOrientation);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                let highlighterAttrs: BarHighlighterAttrs;
                if(isGrouped)
                    highlighterAttrs = TooltipHelper.getBarHighlighterAttrs(elemets.filter(d => d[dataOptions.keyField.name] === keyValue), chartOrientation, blockSize, margin, isGrouped);
                else
                    highlighterAttrs = TooltipHelper.getBarHighlighterAttrs(select(this), chartOrientation, blockSize, margin, isGrouped);
                barHighlighter = thisClass.renderBarHighlighter(block, highlighterAttrs);
            });

        elemets.on('mouseleave', function () {
            thisClass.hideTooltipBlock(tooltipBlock);
            barHighlighter.remove();
        });
    }

    private static renderTooltipForDonut(block: Block, elemets: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: PolarChartModel, blockSize: Size, margin: BlockMargin, donutThickness: number, translateX: number = 0, translateY: number = 0): void {
        const tooltipBlock = this.renderTooltipBlock(block, translateX, translateY);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        const filterId = 'shadow'
        this.renderShadowFilter(block, filterId);

        let clone: Selection<BaseType, unknown, BaseType, unknown>;

        elemets
            .on('mouseover', function (_event, dataRow) {
                thisClass.showTooltipBlock(tooltipBlock);
                const key = dataRow.data[dataOptions.keyField.name];
                TooltipHelper.fillTooltipForPolarChart(tooltipContent, chart, data, dataOptions, key, select(this).select('path').style('fill'))

                const coordinatePointer: [number, number] = TooltipHelper.getRecalcedCoordinateByArrow(DonutHelper.getArcCentroid(blockSize, margin, dataRow, donutThickness), tooltipBlock, blockSize, tooltipArrow, translateX, translateY);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                // Выделение выбранного сегмента с помощью тени. копия сегмента поверх оригинальногой. Оригинальный становится тенью
                clone = select(this).clone();
                select(this).style('filter', `url(#${filterId})`);

                TooltipHelper.changeDonutHighlightAppearance(select<SVGGElement, PieArcDatum<DataRow>>(this), margin, blockSize, donutThickness, true);
            });

        elemets.on('mouseleave', function () {
            thisClass.hideTooltipBlock(tooltipBlock);

            select(this) // удаление тени с оригинального сегмента
                .style('filter', null);
            clone.remove(); // удаление клона
            
            TooltipHelper.changeDonutHighlightAppearance(select<SVGGElement, PieArcDatum<DataRow>>(this), margin, blockSize, donutThickness, false);
        });
    }

    private static renderTooltipForGantt(block: Block, elemets: Selection<BaseType, DataRow, BaseType, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: IntervalChartModel, chartOrientation: ChartOrientation, blockSize: Size): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function (_event, dataRow) {
                thisClass.showTooltipBlock(tooltipBlock);
                const key = TooltipHelper.getKeyForTooltip(dataRow, dataOptions.keyField.name, false);
                TooltipHelper.fillTooltipForIntervalChart(tooltipContent, chart, data, dataOptions, key, select(this).style('fill'))

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinateByRect(select(this), tooltipBlock, blockSize, tooltipArrow, chartOrientation);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                TooltipHelper.setElementsSemiOpacity(TooltipHelper.getFilteredElements(elemets, dataOptions.keyField.name, key, false));
            });

        elemets.on('mouseleave', function () {
            thisClass.hideTooltipBlock(tooltipBlock);
            TooltipHelper.setElementsFullOpacity(elemets);
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

    private static renderTooltipLine(block: Block): Selection<SVGLineElement, unknown, HTMLElement, any> {
        return block.getChartBlock()
            .append('line')
            .attr('class', 'tooltip-line')
            .lower();
    }

    private static renderTipBox(block: Block, attributes: TipBoxAttributes): Selection<SVGRectElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .append('rect')
            .attr('class', 'tipbox')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height)
            .style('opacity', 0);
    }

    private static setTooltipLineAttributes(tooltipLine: Selection<SVGLineElement, unknown, HTMLElement, any>, attributes: TooltipLineAttributes): void {
        tooltipLine
            .attr('x1', attributes.x1)
            .attr('x2', attributes.x2)
            .attr('y1', attributes.y1)
            .attr('y2', attributes.y2)
            .attr('stroke-linecap', attributes.strokeLinecap);
    }

    private static renderTooltipArrow(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): Selection<BaseType, unknown, HTMLElement, any> {
        let tooltipArrow = tooltipBlock.select(`.${this.tooltipArrowClass}`);
        if (tooltipArrow.empty())
            tooltipArrow = tooltipBlock
                .append('div')
                .attr('class', this.tooltipArrowClass)
                .style('position', 'absolute')
                .style('left', `${ARROW_DEFAULT_POSITION}px`)
                .style('bottom', '-6px')
                .style('width', `${ARROW_SIZE}px`)
                .style('height', `${ARROW_SIZE}px`);

        return tooltipArrow;
    }

    private static renderTooltipBlock(block: Block, translateX: number = 0, translateY: number = 0): Selection<HTMLElement, unknown, HTMLElement, any> {
        const wrapper = block.getWrapper().select<HTMLElement>(`.${this.tooltipWrapperClass}`);

        let tooltipBlock = wrapper.select<HTMLElement>(`.${this.tooltipBlockClass}`);
        if (tooltipBlock.empty()) {
            tooltipBlock = wrapper
                .append('div')
                .attr('class', this.tooltipBlockClass)
                .style('position', 'absolute')
                .style('display', 'none');
        }

        if (translateX !== 0 || translateY !== 0)
            tooltipBlock.style('transform', `translate(${translateX}px, ${translateY}px)`);

        return tooltipBlock;
    }

    private static renderTooltipContentBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): Selection<HTMLDivElement, unknown, HTMLElement, any> {
        let tooltipContentBlock = tooltipBlock.select<HTMLDivElement>(`div.${this.tooltipContentClass}`);

        if (tooltipContentBlock.empty())
            tooltipContentBlock = tooltipBlock.append('div')
                .attr('class', this.tooltipContentClass);

        return tooltipContentBlock;
    }

    private static setTooltipCoordinate(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>, tooltipCoordinate: TooltipCoordinate): void {
        tooltipBlock
            .style('left', tooltipCoordinate.left)
            .style('top', tooltipCoordinate.top)
            .style('right', tooltipCoordinate.right)
            .style('bottom', tooltipCoordinate.bottom);
    }

    private static showTooltipBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): void {
        tooltipBlock.style('display', 'block');
    }

    private static hideTooltipBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): void {
        tooltipBlock.style('display', 'none');
    }

    private static renderShadowFilter(block: Block, filterId: string): Selection<SVGFilterElement, unknown, HTMLElement, unknown> {
        let filter = block.renderDefs()
            .select<SVGFilterElement>(`filter#${filterId}`);

        if(filter.empty())
            filter = block.renderDefs()
                .append('filter')
                .attr('id', filterId)
                .attr('width', '300%')
                .attr('height', '300%')
                .attr('x', '-100%')
                .attr('y', '-100%')
                .style('outline', '1px solid red');

        if(filter.select('feDropShadow').empty())
            filter.append('feDropShadow')
                .attr('dx', 0)
                .attr('dy', 0)
                .attr('flood-color', 'rgba(0, 0, 0, 0.15)')
                .attr('stdDeviation', 10);

        return filter;
    }

    private static renderBarHighlighter(block: Block, barAttrs: BarHighlighterAttrs): Selection<SVGRectElement, unknown, HTMLElement, any> {
        const barHighlighter = block.getChartBlock()
            .append('rect')
            .attr('class', 'bar-highlighter')
            .attr('x', barAttrs.x)
            .attr('y', barAttrs.y)
            .attr('width', barAttrs.width)
            .attr('height', barAttrs.height)
            .style('fill', '#BDBDBD')
            .style('pointer-events', 'none')
            .style('opacity', 0.2)
            .lower();

        return barHighlighter;
    }
}