import * as d3 from "d3";
import { BlockMargin, DataRow, DataSource, Field, IntervalChartModel, Model, PolarChartModel, ScaleKeyModel, ScaleKeyType, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../scale/scale";
import { Block } from "../../block/block";
import { TipBoxAttributes, TooltipCoordinate, TooltipHelper, TooltipLineAttributes } from "./tooltipHelper";

export class Tooltip
{
    private static tooltipWrapperClass = 'tooltip-wrapper';
    private static tooltipContentClass = 'tooltip-content';
    private static tooltipBlockClass = 'tooltip-block';

    public static renderTooltips(block: Block, model: Model, data: DataSource, scales: Scales) {
        this.renderTooltipWrapper(block);
        const chartsWithTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel) => chart.tooltip.data.fields.length !== 0);
        if(chartsWithTooltipIndex !== -1) {
            if(model.options.type === '2d') {
                if(model.options.charts.findIndex(chart => chart.type === 'area' || chart.type === 'line') === -1) {
                    this.renderTooltipsForBar(block, model.options.charts, data, model.blockCanvas.size);
                } else {
                    this.renderLineTooltip(block, scales.scaleKey, model.chartBlock.margin, model.blockCanvas.size, model.options.charts, data, model.options.scale.scaleKey);
                }
            } else if(model.options.type === 'polar') {
                this.renderTooltipsForDonut(block, model.options.charts, data, model.blockCanvas.size);
            } else if(model.options.type === 'interval') {
                this.renderTooltipsForGantt(block, model.options.charts, data, model.blockCanvas.size);
            }
        }
    }

    private static renderTooltipsForBar(block: Block, charts: TwoDimensionalChartModel[], data: DataSource, blockSize: Size): void {
        charts.forEach(chart => {
            if(chart.tooltip.data.fields.length !== 0) {
                const bars = block.getSvg()
                    .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`);
                this.renderTooltipForSingleElements(block, bars, chart.tooltip.data.fields, data[chart.data.dataSource], blockSize, charts);
                // this.renderAlternativeTooltipForBar(bars, chart.tooltip.data.fields, data[chart.data.dataSource], blockSize, charts);
            }
        });
    }

    private static renderTooltipsForDonut(block: Block, charts: PolarChartModel[], data: DataSource, blockSize: Size): void {
        charts.forEach(chart => {
            const attrTransform = d3.select('.donut-block').attr('transform');
            const translateNumbers = attrTransform.substring(10, attrTransform.length - 1).split(', ');
            const translateX = parseFloat(translateNumbers[0]);
            const translateY = parseFloat(translateNumbers[1]);
    
            const items = block.getSvg()
                .selectAll(`path${Helper.getCssClassesLine(chart.cssClasses)}`);
            this.renderTooltipForSingleElements(block, items, chart.tooltip.data.fields, data[chart.data.dataSource], blockSize, charts, translateX, translateY);
        })
    }

    private static renderTooltipsForGantt(block: Block, charts: IntervalChartModel[], data: DataSource, blockSize: Size): void {
        charts.forEach(chart => {
            if(chart.tooltip.data.fields.length !== 0) {
                const bars = block.getSvg()
                    .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`);
                this.renderTooltipForSingleElements(block, bars, chart.tooltip.data.fields, data[chart.data.dataSource], blockSize, charts);
            }
        });
    }
    
    private static renderLineTooltip(block: Block, scaleKey: d3.AxisScale<any>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], data: DataSource, scaleKeyModel: ScaleKeyModel): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = tooltipBlock.select('.tooltip-content');
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
                const index = TooltipHelper.getKeyIndex(d3.pointer(event, this), charts[0].orient, margin, bandSize, scaleKeyModel.type);        
                const key = scaleKey.domain()[index];
                tooltipContent.html(`${TooltipHelper.getTooltipTextForMultyCharts(charts, data, key)}`);
                
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(d3.pointer(event, this), tooltipBlock, blockSize);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                tooltipLine.style('display', 'block');
                const tooltipLineAttributes = TooltipHelper.getTooltipLineAttributes(scaleKey, margin, key, charts[0].orient, blockSize);
                thisClass.setTooltipLineAttributes(tooltipLine, tooltipLineAttributes);
            })
            .on('mouseleave', function(event) {
                tooltipBlock.style('display', 'none');
                tooltipLine.style('display', 'none');
            });
    }

    private static renderTooltipForSingleElements(block: Block, elemets: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, fields: Field[], data: DataRow[], blockSize: Size, charts: TwoDimensionalChartModel[] | PolarChartModel[] | IntervalChartModel[], translateX: number = 0, translateY: number = 0): void {
        const tooltipBlock = this.renderTooltipBlock(block, translateX, translateY);
        const tooltipContent = tooltipBlock.select('.tooltip-content');
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
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(d3.pointer(event, this), tooltipBlock, blockSize);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate); 
            });
    
        elemets.on('mouseleave', event => tooltipBlock.style('display', 'none'));
    }

    private static renderTooltipWrapper(block: Block): void {
        block.getWrapper()
            .append('div')
            .attr('class', this.tooltipWrapperClass);
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
            .style('opacity', '0');
    }

    private static renderTooltipLine(block: Block): d3.Selection<SVGLineElement, unknown, HTMLElement, any> {
        return block.getSvg()
            .append('line')
            .attr('class', 'tooltip-line');
    }

    private static setTooltipCoordinate(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, tooltipCoordinate: TooltipCoordinate): void {
        tooltip
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

    // private static renderAlternativeTooltipForBar(elemets: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, fields: Field[], data: DataRow[], blockSize: Size, charts: TwoDimensionalChartModel[] | PolarChartModel[] | IntervalChartModel[], translateX: number = 0, translateY: number = 0): void {
        //     const tooltipBlock = this.renderTooltipBlock(translateX, translateY);
        //     let tooltipContent = tooltipBlock.select(`.${this.tooltipContentClass}`);
        //     let tooltipArrow = tooltipBlock.select('.tooltip-arrow');
        //     if(tooltipArrow.size() === 0)
        //         tooltipArrow = d3.select(`.${this.tooltipBlockClass}`)
        //             .append('div')
        //             .attr('class', 'tooltip-arrow')
        //             .style('position', 'absolute')
        //             .style('left', '14px')
        //             .style('bottom', '-10px');
        //     const thisClass = this;
    
        //     elemets
        //         .data(data)
        //         .on('mouseover', function(event, d) {
        //             tooltipContent.html(TooltipHelper.getTooltipTextForSingleChart(fields, d, charts[0].data.keyField.name));
        //             tooltipBlock.style('display', 'block');
        //         });
    
        //     elemets
        //         .data(data)
        //         .on('mousemove', function(event, d) {
        //             const thisElement = d3.select(this);
        //             const toolltipCoordinate: TooltipCoordinate = {
        //                 left: (thisElement.attr('x') as any) - 14 + 'px',
        //                 top: (thisElement.attr('y') as any) - (tooltipBlock.node() as any).getBoundingClientRect().height - 14 + 'px',
        //                 bottom: null,
        //                 right: null,
        //             }
        //             thisClass.setTooltipCoordinate(tooltipBlock, toolltipCoordinate);
        //         });
    
        //     elemets.on('mouseleave', event => tooltipBlock.style('display', 'none'));
        // }
}