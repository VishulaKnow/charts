import * as d3 from "d3";
import { BlockMargin, DataRow, DataSource, Field, IntervalChartModel, Model, PolarChartModel, ScaleKeyModel, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../scale/scale";
import { Block } from "../../block/block";
import { DotEdgingAttrs, TipBoxAttributes, TooltipCoordinate, TooltipHelper, TooltipLineAttributes } from "./tooltipHelper";
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

    public static renderTooltips(block: Block, model: Model, data: DataSource, scales: Scales): void {
        this.renderTooltipWrapper(block);
        const chartsWithTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel) => chart.tooltip.data.fields.length !== 0);
        if(chartsWithTooltipIndex !== -1) {
            if(model.options.type === '2d') {
                if(model.options.charts.findIndex(chart => chart.type === 'area' || chart.type === 'line') === -1)
                    this.renderTooltipForBar(block, Bar.getAllBarItems(block), data, model.options.charts, model.options.isSegmented);
                else if(model.options.charts.findIndex(chart => chart.type === 'area' || chart.type === 'bar') === -1)
                    this.renderTooltipForDots(block, Dot.getAllDots(block), data, model.options.charts, false);
                else if(model.options.charts.findIndex(chart => chart.type === 'line' || chart.type === 'bar') === -1)
                    this.renderTooltipForDots(block, Dot.getAllDots(block), data, model.options.charts, model.options.isSegmented);
                else 
                    this.renderLineTooltip(block, scales.scaleKey, model.chartBlock.margin, model.blockCanvas.size, model.options.charts, data, model.options.scale.scaleKey, model.options.orient);
            } else if(model.options.type === 'polar') {
                this.renderTooltipsForDonut(block, model.options.charts, data, model.blockCanvas.size, model.chartBlock.margin);
            } else if(model.options.type === 'interval') {
                this.renderTooltipsForGantt(block, model.options.charts, data);
            }
        }
    }

    private static renderTooltipsForDonut(block: Block, charts: PolarChartModel[], data: DataSource, blockSize: Size, margin: BlockMargin): void {
        charts.forEach(chart => {
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

    private static renderTooltipForDots(block: Block, elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, data: DataSource, charts: TwoDimensionalChartModel[], isSegmented: boolean): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.getTooltipContentBlock(tooltipBlock);
        this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, d) {
                tooltipBlock.style('display', 'block');                
                const key = TooltipHelper.getKeyForTooltip(d, charts[0].data.keyField.name, isSegmented);
                tooltipContent.html(`${TooltipHelper.getTooltipHtmlFor2DCharts(charts[0], data, key)}`);

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinate(d3.select(this), tooltipBlock, 'circle');
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

    private static renderTooltipForBar(block: Block, elemets: d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown>, data: DataSource, charts: TwoDimensionalChartModel[], isSegmented: boolean): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.getTooltipContentBlock(tooltipBlock);
        this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, d) {
                tooltipBlock.style('display', 'block');
                const key = TooltipHelper.getKeyForTooltip(d, charts[0].data.keyField.name, isSegmented);
                tooltipContent.html(`${TooltipHelper.getTooltipHtmlFor2DCharts(charts[0], data, key)}`);

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinate(d3.select(this), tooltipBlock, 'rect');
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                TooltipHelper.getFilteredElements(elemets, charts[0].data.keyField.name, key, isSegmented)
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
        this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function(event, d) {
                tooltipBlock.style('display', 'block');
                const key = d.data[charts[0].data.keyField.name];
                tooltipContent.html(TooltipHelper.getTooltipHtmlForPolarChart(charts[0], data, key, d3.select(this).select('path').style('fill')));
                
                const coordinatePointer: [number, number] = TooltipHelper.getRecalcedCoordinateByArrow(Donut.getArcCentroid(blockSize, margin, d, charts[0].appearanceOptions.innerRadius), tooltipBlock);
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

    private static renderLineTooltip(block: Block, scaleKey: d3.AxisScale<any>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], data: DataSource, scaleKeyModel: ScaleKeyModel, chartOrientation: ChartOrientation): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.getTooltipContentBlock(tooltipBlock);
        const thisClass = this;
    
        const tooltipLine = this.renderTooltipLine(block);    
        const bandSize = Scale.getScaleStep(scaleKey); 
        const tipBoxAttributes = TooltipHelper.getTipBoxAttributes(margin, blockSize);
        const tipBox = this.renderTipBox(block, tipBoxAttributes);

        tipBox
            .on('mouseover', function(event) {
                tooltipBlock.style('display', 'block');
            })
            .on('mousemove', function(event) {
                const index = TooltipHelper.getKeyIndex(d3.pointer(event, this), chartOrientation, margin, bandSize, scaleKeyModel.type);        
                const key = scaleKey.domain()[index];
                tooltipContent.html(`${TooltipHelper.getTooltipHtmlFor2DCharts(charts[0], data, key)}`);
                
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(d3.pointer(event, this));
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                tooltipLine.style('display', 'block');
                const tooltipLineAttributes = TooltipHelper.getTooltipLineAttributes(scaleKey, margin, key, chartOrientation, blockSize);
                thisClass.setTooltipLineAttributes(tooltipLine, tooltipLineAttributes);
            })
            .on('mouseleave', function(event) {
                tooltipBlock.style('display', 'none');
                tooltipLine.style('display', 'none');
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
            .on('mousemove', function(event, d) {
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(d3.pointer(event, this));
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate); 
            });
    
        elemets.on('mouseleave', event => tooltipBlock.style('display', 'none'));
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

    private static renderTipBox(block: Block, attributes: TipBoxAttributes): d3.Selection<SVGRectElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .append('rect')
            .attr('class', 'tipbox')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height)
            .style('opacity', 0);
    }

    private static renderTooltipLine(block: Block): d3.Selection<SVGLineElement, unknown, HTMLElement, any> {
        return block.getChartBlock()
            .append('line')
            .attr('class', 'tooltip-line')
            .raise();
    }

    private static setTooltipCoordinate(tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, tooltipCoordinate: TooltipCoordinate): void {
        tooltipBlock
            .style('left', tooltipCoordinate.left)
            .style('top', tooltipCoordinate.top)
            .style('right', tooltipCoordinate.right)
            .style('bottom', tooltipCoordinate.bottom);
    }
    
    private static setTooltipLineAttributes(tooltipLine: d3.Selection<SVGLineElement, unknown, HTMLElement, any>, attributes: TooltipLineAttributes): void {
        tooltipLine
            .attr('x1', attributes.x1)
            .attr('x2', attributes.x2)
            .attr('y1', attributes.y1)
            .attr('y2', attributes.y2);
    }

    private static getTooltipContentBlock(tooltipBlock: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        return tooltipBlock.select(`.${this.tooltipContentClass}`);
    }
}