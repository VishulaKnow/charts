import * as d3 from "d3";
import { BlockMargin, DataRow, DataSource, IntervalChartModel, Model, PolarChartModel, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { ARROW_DEFAULT_POSITION, DotEdgingAttrs, TooltipCoordinate, TooltipHelper } from "./tooltipHelper";
import { Donut } from "../../polarNotation/donut";
import { Bar } from "../../twoDimensionalNotation/bar/bar";
import { Dot } from "../lineDots/dot";
import { ChartOrientation } from "../../../config/config";

export class Tooltip
{
    private static tooltipWrapperClass = 'tooltip-wrapper';
    private static tooltipContentClass = 'tooltip-content';
    private static tooltipBlockClass = 'tooltip-block';
    private static tooltipArrowClass = 'tooltip-arrow';

    public static renderTooltips(block: Block, model: Model, data: DataSource): void {
        this.renderTooltipWrapper(block);
        const chartsWithTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel) => chart.tooltip.data.fields.length !== 0);
        if(chartsWithTooltipIndex !== -1) {
            if(model.options.type === '2d') {
                this.rednerTooltipFor2DCharts(block, model.options.charts, data, model.options.isSegmented, model.blockCanvas.size, model.options.orient);   
            } else if(model.options.type === 'polar') {
                this.renderTooltipsForDonut(block, model.options.charts, data, model.blockCanvas.size, model.chartBlock.margin, Donut.getThickness(model.chartSettings.donut, model.blockCanvas.size, model.chartBlock.margin));
            } else if(model.options.type === 'interval') {
                this.renderTooltipsForInterval(block, model.options.charts, data, model.blockCanvas.size, model.options.orient);
            }
        }
    }

    private static rednerTooltipFor2DCharts(block: Block, charts: TwoDimensionalChartModel[], data: DataSource, isSegmented: boolean, blockSize: Size, chartOrientation: ChartOrientation): void {
        charts.forEach(chart => {
            if(chart.type === 'bar') {
                this.renderTooltipForBars(block, Bar.getAllBarItems(block), data, chart, isSegmented, chartOrientation, blockSize);
            } else if(chart.type === 'line') {
                this.renderTooltipForDots(block, Dot.getAllDots(block, chart.cssClasses), data, chart, false, blockSize);
            } else {
                this.renderTooltipForDots(block, Dot.getAllDots(block, chart.cssClasses), data, chart, isSegmented, blockSize);
            }
        });
    }

    private static renderTooltipsForDonut(block: Block, charts: PolarChartModel[], data: DataSource, blockSize: Size, margin: BlockMargin, chartThickness: number): void {
        charts.forEach(chart => {
            const attrTransform = block.getSvg().select(`.${Donut.donutBlockClass}`).attr('transform');
            const translateNumbers = Helper.getTranslateNumbers(attrTransform);
            const translateX = translateNumbers[0];
            const translateY = translateNumbers[1];

            const arcItems = Donut.getAllArcs(block);
            this.renderTooltipForDonut(block, arcItems, data, chart, blockSize, margin, chartThickness, translateX, translateY);
        });
    }

    private static renderTooltipsForInterval(block: Block, charts: IntervalChartModel[], data: DataSource, blockSize: Size, chartOrientation: ChartOrientation): void {
        charts.forEach(chart => {
            if(chart.tooltip.data.fields.length !== 0) {
                const bars = block.getSvg()
                    .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`);
                this.renderTooltipForGantt(block, bars, data, chart, chartOrientation, blockSize);
            }
        });
    }

    private static renderTooltipForDots(block: Block, elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, data: DataSource, chart: TwoDimensionalChartModel, isSegmented: boolean, blockSize: Size): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, d) {
                tooltipBlock.style('display', 'block');                               
                const keyValue = TooltipHelper.getKeyForTooltip(d, chart.data.keyField.name, isSegmented);
                const index = thisClass.getElementIndex(elemets, this, keyValue, chart.data.keyField.name, isSegmented)
                tooltipContent.html(`${TooltipHelper.getTooltipHtmlFor2DChart(chart, data, keyValue, index)}`);

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinateByDot(d3.select(this), tooltipBlock, blockSize, tooltipArrow);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);
                
                const dotsEdgingAttrs = TooltipHelper.getDotEdgingAttrs(d3.select(this));
                thisClass.renderDotsEdging(block, dotsEdgingAttrs, chart.style.elementColors[index].toString()); 
            });

        elemets.on('mouseleave', function() {
            thisClass.removeDotsEdging(block);
            tooltipBlock.style('display', 'none');
        });
    }

    private static renderTooltipForBars(block: Block, elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, data: DataSource, chart: TwoDimensionalChartModel, isSegmented: boolean, chartOrientation: ChartOrientation, blockSize: Size): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        let isGrouped: boolean;
        if(chartOrientation === 'vertical')
            isGrouped = parseFloat(elemets.attr('width')) < 10; // grouping bar by one bar width
        else
            isGrouped = parseFloat(elemets.attr('height')) < 10;

        elemets
            .on('mouseover', function(event, dataRow) {
                tooltipBlock.style('display', 'block');
                const keyValue = TooltipHelper.getKeyForTooltip(dataRow, chart.data.keyField.name, isSegmented);
                
                if(isGrouped) {
                    tooltipContent.html(TooltipHelper.getMultyTooltipHtmlFor2DChart(chart, data, keyValue));
                } else {
                    const index = thisClass.getElementIndex(elemets, this, keyValue, chart.data.keyField.name, isSegmented)
                    tooltipContent.html(TooltipHelper.getTooltipHtmlFor2DChart(chart, data, keyValue, index));
                }

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinateByRect(d3.select(this), tooltipBlock, blockSize, tooltipArrow, chartOrientation);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                if(isGrouped) {
                    TooltipHelper.getFilteredElements(elemets, chart.data.keyField.name, keyValue, isSegmented)
                        .style('opacity', 0.3);
                } else {
                    elemets.style('opacity', 0.3);
                    d3.select(this).style('opacity', 1);
                }
            });

        elemets.on('mouseleave', function() {
            elemets.style('opacity', 1);
            tooltipBlock.style('display', 'none');
        });
    }

    private static renderTooltipForDonut(block: Block, elemets: d3.Selection<d3.BaseType, d3.PieArcDatum<DataRow>, d3.BaseType, unknown>, data: DataSource, chart: PolarChartModel, blockSize: Size, margin: BlockMargin, donutThickness: number, translateX: number = 0, translateY: number = 0): void {
        const tooltipBlock = this.renderTooltipBlock(block, translateX, translateY);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, dataRow) {
                tooltipBlock.style('display', 'block');
                const key = dataRow.data[chart.data.keyField.name];
                tooltipContent.html(TooltipHelper.getTooltipHtmlForPolarChart(chart, data, key, d3.select(this).select('path').style('fill')));
                
                const coordinatePointer: [number, number] = TooltipHelper.getRecalcedCoordinateByArrow(Donut.getArcCentroid(blockSize, margin, dataRow, donutThickness), tooltipBlock, blockSize, tooltipArrow);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                elemets.filter(d => d.data[chart.data.keyField.name] !== key)
                    .style('opacity', 0.3);
            });

        elemets.on('mouseleave', function() {
            tooltipBlock.style('display', 'none');
            elemets.style('opacity', 1);
        });
    }

    private static renderTooltipForGantt(block: Block, elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, data: DataSource, chart: IntervalChartModel, chartOrientation: ChartOrientation, blockSize: Size): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, dataRow) {
                tooltipBlock.style('display', 'block');
                const key = TooltipHelper.getKeyForTooltip(dataRow, chart.data.keyField.name, false);
                tooltipContent.html(`${TooltipHelper.getTooltipHtmlForIntervalChart(chart, data, key, d3.select(this).style('fill'))}`);

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinateByRect(d3.select(this), tooltipBlock, blockSize, tooltipArrow, chartOrientation);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                TooltipHelper.getFilteredElements(elemets, chart.data.keyField.name, key, false)
                    .style('opacity', 0.3);
            });

        elemets.on('mouseleave', function() {
            elemets.style('opacity', 1);
            tooltipBlock.style('display', 'none');
        });
    }

    private static renderTooltipWrapper(block: Block): void {
        block.getWrapper()
            .append('div')
            .attr('class', this.tooltipWrapperClass);
    }

    private static renderTooltipArrow(tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        let tooltipArrow = tooltipBlock.select(`.${this.tooltipArrowClass}`);
        if(tooltipArrow.size() === 0)
            tooltipArrow = tooltipBlock
                .append('div')
                .attr('class', this.tooltipArrowClass)
                .style('position', 'absolute')
                .style('left', `${ARROW_DEFAULT_POSITION}px`)
                .style('bottom', '-6px');
        
        return tooltipArrow;
    }

    private static renderTooltipBlock(block: Block, translateX: number = 0, translateY: number = 0): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        const wrapper = block.getWrapper().select(`.${this.tooltipWrapperClass}`);

        let tooltipBlock = wrapper.select(`.${this.tooltipBlockClass}`);
        if(tooltipBlock.size() === 0) {
            tooltipBlock = wrapper
                .append('div')
                .attr('class', this.tooltipBlockClass)
                .style('position', 'absolute')
                .style('display', 'none');
        }    

        if(translateX !== 0 || translateY !== 0)
            tooltipBlock.style('transform', `translate(${translateX}px, ${translateY}px)`);

        return tooltipBlock;
    }

    private static renderTooltipContentBlock(tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
        return tooltipBlock.append('div')
            .attr('class', this.tooltipContentClass);
    }

    private static setTooltipCoordinate(tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, tooltipCoordinate: TooltipCoordinate): void {
        tooltipBlock
            .style('left', tooltipCoordinate.left)
            .style('top', tooltipCoordinate.top)
            .style('right', tooltipCoordinate.right)
            .style('bottom', tooltipCoordinate.bottom);
    }

    private static renderDotsEdging(block: Block, attrs: DotEdgingAttrs, color: string): void {
        block.getChartBlock()
            .insert('circle', '.dot')
            .attr('class', 'dot-edging-internal')
            .attr('cx', attrs.cx)
            .attr('cy', attrs.cy)
            .attr('r', 10.5)
            .style('opacity', 0.4)
            .style('fill', color)
            .style('pointer-events', 'none');

        block.getChartBlock()
            .insert('circle', '.dot')
            .attr('class', 'dot-edging-external')
            .attr('cx', attrs.cx)
            .attr('cy', attrs.cy)
            .attr('r', 15.5)
            .style('opacity', 0.2)
            .style('fill', color)
            .style('pointer-events', 'none');
    }
    
    private static removeDotsEdging(block: Block): void {
        block.getChartBlock()
            .selectAll('.dot-edging-external, .dot-edging-internal')
            .remove();
    }

    private static getElementIndex(elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, dot: d3.BaseType, keyValue: string, keyName: string, isSegmented: boolean): number {
        let index = -1;
        const filtered = isSegmented ? elemets.filter(d => d.data[keyName] === keyValue) : elemets.filter(d => d[keyName] === keyValue);
        filtered.each(function(d, i) {
            if(d3.select(this).node() === d3.select(dot).node()) {
                index = i;
            }
        });

        return index;
    }
}