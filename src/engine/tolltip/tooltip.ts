import * as d3 from "d3";
import { BlockMargin, DataRow, DataSource, Field, Model, PolarChartModel, Size, TwoDimensionalChartModel } from "../../model/model";
import { Helper } from "../helper";
import { Scales } from "../twoDimensionalNotation/scale/scale";
import { SvgBlock } from "../svgBlock/svgBlock";
import { TooltipHelper } from "./tooltipHelper";

interface TooltipCoordinate {
    left: string;
    top: string;
}

export class Tooltip
{
    static renderTooltips(model: Model, data: DataSource, scales: Scales) {
        d3.select('.wrapper')
            .append('div')
            .attr('class', 'tooltip-wrapper');
        if(model.options.type === '2d') {
            if(model.options.charts.findIndex(chart => chart.type === 'area' || chart.type === 'line') === -1) {
                this.renderTooltipsForBar(model.options.charts, data);
            } else {
                this.renderLineTooltip(scales.scaleKey, model.chartBlock.margin, model.blockCanvas.size, model.options.charts, data);
            }
        } else {
            this.renderTooltipsForDonut(model.options.charts, data);
        }
    }

    static renderTooltipForBar(bars: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, fields: Field[], data: DataRow[]): void {
        const wrapper = d3.select('.tooltip-wrapper');

        let tooltip = wrapper.select('.tooltip');
        if(tooltip.size() === 0)
            tooltip = wrapper
                .append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('display', 'none');
    
        bars
            .data(data)
            .on('mouseover', function(e, d) {
                tooltip.html(TooltipHelper.getTooltipText(fields, d));
                tooltip.style('display', 'block');
            });
    
        bars
            .data(data)
            .on('mousemove', function(event, d) {
                tooltip
                    .style('left', d3.pointer(event, this)[0] + 10 + 'px')
                    .style('top', d3.pointer(event, this)[1] + 10 + 'px'); 
            });
    
        bars.on('mouseleave', event => tooltip.style('display', 'none'));
    }
    
    static renderTooltipsForBar(charts: TwoDimensionalChartModel[], data: DataSource): void {
        charts.forEach(chart => {
            if(chart.tooltip.data.fields.length !== 0) {
                const bars = SvgBlock.getSvg()
                    .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`);
                this.renderTooltipForBar(bars, chart.tooltip.data.fields, data[chart.data.dataSource]);
            }
        })
    }
    
    static renderLineTooltip(scaleKey: d3.ScaleBand<string>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], data: DataSource): void {
        const wrapper = d3.select('.tooltip-wrapper');
        const tooltipClass = this;
    
        let tooltip = wrapper.select('div.tooltip');
        if(tooltip.size() === 0)
            tooltip = wrapper
                .append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('display', 'none');
    
        if(charts.filter(chart => chart.tooltip.data.fields.length !== 0).length !== 0) {
            const tooltipLine = SvgBlock.getSvg()
                .append('line')
                .attr('class', 'tooltip-line');    
        
            const bandSize = scaleKey.step(); 
            SvgBlock.getSvg()
                .append('rect')
                .attr('class', 'tipbox')
                .attr('x', margin.left)
                .attr('y', margin.top)
                .attr('width', blockSize.width - margin.left - margin.right)
                .attr('height', blockSize.height - margin.top - margin.bottom)
                .style('opacity', 0)
                .on('mouseover', function(event) {
                    tooltip.style('display', 'block');
                })
                .on('mousemove', function(event) {
                    const index = TooltipHelper.getKeyIndex(d3.pointer(event, this), this, charts[0].orient, margin, bandSize);        
                    const key = scaleKey.domain()[index];
                    tooltip.html(`${TooltipHelper.getMultplyTooltipText(charts, data, key)}`);
                    
                    const tooltipCoordinate = tooltipClass.getTooltipCoordinate(tooltip, d3.pointer(event, this), blockSize, margin);
                    tooltip
                        .style('left', tooltipCoordinate.left)
                        .style('top', tooltipCoordinate.top);

                    tooltipLine.style('display', 'block');
                    tooltipClass.setTooltipLineAttributes(tooltipLine, scaleKey, margin, key, charts[0].orient, blockSize);
                })
                .on('mouseleave', function(event) {
                    tooltip.style('display', 'none');
                    tooltipLine.style('display', 'none');
                });
        }
    }

    static getTooltipCoordinate(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, pointer: [number, number], blockSize: Size, margin: BlockMargin): TooltipCoordinate {
        let x = pointer[0];
        let y = pointer[1];
        // let tooltipWidth = (tooltip.node() as HTMLElement).getBoundingClientRect().width;
        // if(tooltipWidth >= blockSize.width - margin.left - margin.right) {
        //     return {
        //         left: x + 'px',
        //         top: y + 'px'
        //     }
        // }
        // if(x + tooltipWidth >= blockSize.width) {
        //     while(x + tooltipWidth + 10 > blockSize.width) {
        //         x--;
        //     }
        // }
        return {
            left: x + 'px',
            top: y + 'px'
        }
    }
    
    static setTooltipLineAttributes(tooltipLine: d3.Selection<SVGLineElement, unknown, HTMLElement, any>, scaleKey: d3.ScaleBand<string>, margin: BlockMargin, key: string, orient: 'vertical' | 'horizontal',  blockSize: Size): void {
        if(orient === 'vertical')
            tooltipLine
                .attr('x1', scaleKey(key) + margin.left + scaleKey.bandwidth() / 2)
                .attr('x2', scaleKey(key) + margin.left + scaleKey.bandwidth() / 2)
                .attr('y1', margin.top)
                .attr('y2', blockSize.height - margin.bottom);
        else
            tooltipLine
                .attr('x1', margin.left)
                .attr('x2', blockSize.width - margin.right)
                .attr('y1', scaleKey(key) + margin.top + scaleKey.bandwidth() / 2)
                .attr('y2', scaleKey(key) + margin.top + scaleKey.bandwidth() / 2);
    }
    
    static renderTooltipsForDonut(charts: PolarChartModel[], data: DataSource): void {
        charts.forEach(chart => {
            const attrTransform = d3.select('.donut-block').attr('transform');
            const translateNumbers = attrTransform.substring(10, attrTransform.length - 1).split(', ');
            const translateX = parseFloat(translateNumbers[0]);
            const translateY = parseFloat(translateNumbers[1]);
    
            const items = SvgBlock.getSvg()
                .selectAll(`path${Helper.getCssClassesLine(chart.cssClasses)}`);
            this.renderTooltipForDonut(items, chart.tooltip.data.fields, data[chart.data.dataSource], translateX, translateY);
        })
    }
    
    static renderTooltipForDonut(arcs: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, fields: Field[], data: DataRow[], translateX: number, translateY: number): void {
        const wrapper = d3.select('.tooltip-wrapper');

        const tooltip = wrapper
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('display', 'none')
            .style('transform', `translate(${translateX}px, ${translateY}px)`);
    
        if(fields.length !== 0) {
            arcs
                .data(data)
                .on('mouseover', function(e, d) {
                    tooltip.html(TooltipHelper.getTooltipText(fields, d));
                    tooltip.style('display', 'block');
                });
    
            arcs
                .data(data)
                .on('mousemove', function(event, d) {
                    tooltip
                        .style('left', d3.pointer(event, this)[0] + 10 + 'px')
                        .style('top', d3.pointer(event, this)[1] + 10 + 'px'); 
                });
    
            arcs.on('mouseleave', d => tooltip.style('display', 'none'));
        }
    }
}