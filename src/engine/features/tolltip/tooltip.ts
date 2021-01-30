import * as d3 from "d3";
import { BlockMargin, DataRow, DataSource, Field, IntervalChartModel, Model, PolarChartModel, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { DotEdgingAttrs, TooltipCoordinate, TooltipHelper } from "./tooltipHelper";
import { Donut } from "../../polarNotation/donut";
import { Bar } from "../../twoDimensionalNotation/bar/bar";
import { Dot } from "../lineDots/dot";

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
                this.rednerTooltipFor2DCharts(block, model.options.charts, data, model.options.isSegmented, model.blockCanvas.size);   
            } else if(model.options.type === 'polar') {
                this.renderTooltipsForDonut(block, model.options.charts, data, model.blockCanvas.size, model.chartBlock.margin);
            } else if(model.options.type === 'interval') {
                this.renderTooltipsForGantt(block, model.options.charts, data);
            }
        }
    }

    private static rednerTooltipFor2DCharts(block: Block, charts: TwoDimensionalChartModel[], data: DataSource, isSegmented: boolean, blockSize: Size): void {
        charts.forEach(chart => {
            if(chart.type === 'bar') {
                this.renderTooltipForBar(block, Bar.getAllBarItems(block), data, chart, isSegmented, blockSize);
            } else if(chart.type === 'line') {
                this.renderTooltipForDots(block, Dot.getAllDots(block, chart.cssClasses), data, chart, false, blockSize);
            } else {
                this.renderTooltipForDots(block, Dot.getAllDots(block, chart.cssClasses), data, chart, isSegmented, blockSize);
            }
        });
    }

    private static renderTooltipsForDonut(block: Block, charts: PolarChartModel[], data: DataSource, blockSize: Size, margin: BlockMargin): void {
        charts.forEach(() => {
            const attrTransform = block.getSvg().select(`.${Donut.donutBlockClass}`).attr('transform');
            const translateNumbers = Helper.getTranslateNumbers(attrTransform);
            const translateX = translateNumbers[0];
            const translateY = translateNumbers[1];

            const arcItems = Donut.getAllArcs(block);
            this.renderTooltipForDonut(block, arcItems, data, charts, blockSize, margin, translateX, translateY);
        });
    }

    private static renderTooltipsForGantt(block: Block, charts: IntervalChartModel[], data: DataSource): void {
        charts.forEach(chart => {
            if(chart.tooltip.data.fields.length !== 0) {
                const bars = block.getSvg()
                    .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`);
                this.renderTooltipForSingleElements(block, bars, chart.tooltip.data.fields, data[chart.data.dataSource], charts);
            }
        });
    }

    private static renderTooltipForDots(block: Block, elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, data: DataSource, chart: TwoDimensionalChartModel, isSegmented: boolean, blockSize: Size): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.getTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, d) {
                tooltipBlock.style('display', 'block');                
                const key = TooltipHelper.getKeyForTooltip(d, chart.data.keyField.name, isSegmented);
                tooltipContent.html(`${TooltipHelper.getTooltipHtmlFor2DCharts(chart, data, key)}`);

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinate(d3.select(this), tooltipBlock, 'circle', blockSize, tooltipArrow);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);
                
                const dotsEdgingAttrs = TooltipHelper.getDotEdgingAttrs(d3.select(this));
                thisClass.renderDotsEdging(block, dotsEdgingAttrs, d3.select(this).style('fill'));
            });

        elemets.on('mouseleave', function() {
            thisClass.removeDotsEdging(block);
            tooltipBlock.style('display', 'none');
        });
    }

    private static renderTooltipForBar(block: Block, elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, data: DataSource, chart: TwoDimensionalChartModel, isSegmented: boolean, blockSize: Size): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.getTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, d) {
                tooltipBlock.style('display', 'block');
                const key = TooltipHelper.getKeyForTooltip(d, chart.data.keyField.name, isSegmented);
                tooltipContent.html(`${TooltipHelper.getTooltipHtmlFor2DCharts(chart, data, key)}`);

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinate(d3.select(this), tooltipBlock, 'rect', blockSize, tooltipArrow);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                TooltipHelper.getFilteredElements(elemets, chart.data.keyField.name, key, isSegmented)
                    .style('opacity', 0.3);
            });

        elemets.on('mouseleave', function() {
            elemets.style('opacity', 1);
            tooltipBlock.style('display', 'none');
        });
    }

    private static renderTooltipForDonut(block: Block, elemets: d3.Selection<d3.BaseType, d3.PieArcDatum<DataRow>, d3.BaseType, unknown>, data: DataSource, charts: PolarChartModel[], blockSize: Size, margin: BlockMargin, translateX: number = 0, translateY: number = 0): void {
        const tooltipBlock = this.renderTooltipBlock(block, translateX, translateY);
        const tooltipContent = this.getTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, d) {
                tooltipBlock.style('display', 'block');
                const key = d.data[charts[0].data.keyField.name];
                tooltipContent.html(TooltipHelper.getTooltipHtmlForPolarChart(charts[0], data, key, d3.select(this).select('path').style('fill')));
                
                const coordinatePointer: [number, number] = TooltipHelper.getRecalcedCoordinateByArrow(Donut.getArcCentroid(blockSize, margin, d, charts[0].appearanceOptions.innerRadius), tooltipBlock, blockSize, tooltipArrow);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                elemets.filter(d => d.data[charts[0].data.keyField.name] !== key)
                    .style('opacity', 0.3);
            });

        elemets.on('mouseleave', function() {
            tooltipBlock.style('display', 'none');
            elemets.style('opacity', 1);
        });
    }

    private static renderTooltipForSingleElements(block: Block, elemets: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, fields: Field[], data: DataRow[], charts: TwoDimensionalChartModel[] | PolarChartModel[] | IntervalChartModel[], translateX: number = 0, translateY: number = 0): void {
        const tooltipBlock = this.renderTooltipBlock(block, translateX, translateY);
        const tooltipContent = this.getTooltipContentBlock(tooltipBlock);
        const thisClass = this;
    
        elemets
            .data(data)
            .on('mouseover', function(event, d) {
                tooltipContent.html(TooltipHelper.getTooltipTextForSingleChart(fields, d, charts[0].data.keyField.name));
                tooltipBlock.style('display', 'block');
            });
    
        elemets
            .data(data)
            .on('mousemove', function(event) {
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(d3.pointer(event, this));
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate); 
            });
    
        elemets.on('mouseleave', () => tooltipBlock.style('display', 'none'));
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
                .style('left', '9px')
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

            tooltipBlock.append('div')
                .attr('class', this.tooltipContentClass);
        }    

        if(translateX !== 0 || translateY !== 0)
            tooltipBlock.style('transform', `translate(${translateX}px, ${translateY}px)`);

        return tooltipBlock;
    }

    private static setTooltipCoordinate(tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, tooltipCoordinate: TooltipCoordinate): void {
        tooltipBlock
            .style('left', tooltipCoordinate.left)
            .style('top', tooltipCoordinate.top)
            .style('right', tooltipCoordinate.right)
            .style('bottom', tooltipCoordinate.bottom);
    }

    private static getTooltipContentBlock(tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return tooltipBlock.select(`.${this.tooltipContentClass}`);
    }
}