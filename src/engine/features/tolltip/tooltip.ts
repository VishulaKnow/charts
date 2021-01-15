import * as d3 from "d3";
import { BlockMargin, DataRow, DataSource, Field, Model, PolarChartModel, ScaleKeyModel, ScaleKeyType, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../twoDimensionalNotation/scale/scale";
import { Block } from "../../block/svgBlock";
import { TipBoxAttributes, TooltipCoordinate, TooltipHelper, TooltipLineAttributes } from "./tooltipHelper";

export class Tooltip
{
    public static renderTooltips(model: Model, data: DataSource, scales: Scales) {
        this.renderTooltipWrapper();
        const chartsWithTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel) => chart.tooltip.data.fields.length !== 0);
        if(chartsWithTooltipIndex !== -1) {
            if(model.options.type === '2d') {
                if(model.options.charts.findIndex(chart => chart.type === 'area' || chart.type === 'line') === -1) {
                    this.renderTooltipsForBar(model.options.charts, data, model.blockCanvas.size);
                } else {
                    this.renderLineTooltip(scales.scaleKey, model.chartBlock.margin, model.blockCanvas.size, model.options.charts, data, model.options.scale.scaleKey);
                }
            } else {
                this.renderTooltipsForDonut(model.options.charts, data, model.blockCanvas.size);
            }
        }
    }

    private static renderTooltipsForBar(charts: TwoDimensionalChartModel[], data: DataSource, blockSize: Size): void {
        charts.forEach(chart => {
            if(chart.tooltip.data.fields.length !== 0) {
                const bars = Block.getSvg()
                    .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`);
                this.renderTooltipForSingleElements(bars, chart.tooltip.data.fields, data[chart.data.dataSource], blockSize);
            }
        })
    }

    private static renderTooltipsForDonut(charts: PolarChartModel[], data: DataSource, blockSize: Size): void {
        charts.forEach(chart => {
            const attrTransform = d3.select('.donut-block').attr('transform');
            const translateNumbers = attrTransform.substring(10, attrTransform.length - 1).split(', ');
            const translateX = parseFloat(translateNumbers[0]);
            const translateY = parseFloat(translateNumbers[1]);
    
            const items = Block.getSvg()
                .selectAll(`path${Helper.getCssClassesLine(chart.cssClasses)}`);
            this.renderTooltipForSingleElements(items, chart.tooltip.data.fields, data[chart.data.dataSource], blockSize, translateX, translateY);
        })
    }
    
    private static renderLineTooltip(scaleKey: d3.AxisScale<any>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], data: DataSource, scaleKeyModel: ScaleKeyModel): void {
        const tooltip = this.renderTooltipBlock();
        const thisClass = this;
    
        const tooltipLine = this.renderTooltipLine();    
        const bandSize = Scale.getScaleStep(scaleKey); 
        const tipBoxAttributes = TooltipHelper.getTipBoxAttributes(margin, blockSize);
        const tipBox = this.renderTipBox(tipBoxAttributes);

        tipBox
            .on('mouseover', function(event) {
                tooltip.style('display', 'block');
            })
            .on('mousemove', function(event) {
                const index = TooltipHelper.getKeyIndex(d3.pointer(event, this), charts[0].orient, margin, bandSize, scaleKeyModel.type);        
                const key = scaleKey.domain()[index];
                tooltip.html(`${TooltipHelper.getTooltipMultyText(charts, data, key)}`);
                
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(d3.pointer(event, this), tooltip, blockSize);
                thisClass.setTooltipCoordinate(tooltip, tooltipCoordinate);

                tooltipLine.style('display', 'block');
                const tooltipLineAttributes = TooltipHelper.getTooltipLineAttributes(scaleKey, margin, key, charts[0].orient, blockSize);
                thisClass.setTooltipLineAttributes(tooltipLine, tooltipLineAttributes);
            })
            .on('mouseleave', function(event) {
                tooltip.style('display', 'none');
                tooltipLine.style('display', 'none');
            });
    }

    private static renderTooltipForSingleElements(elemets: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>, fields: Field[], data: DataRow[], blockSize: Size, translateX: number = 0, translateY: number = 0): void {
        const tooltip = this.renderTooltipBlock(translateX, translateY);
        const thisClass = this;
    
        elemets
            .data(data)
            .on('mouseover', function(event, d) {
                tooltip.html(TooltipHelper.getTooltipText(fields, d));
                tooltip.style('display', 'block');
            });
    
        elemets
            .data(data)
            .on('mousemove', function(event, d) {
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(d3.pointer(event, this), tooltip, blockSize);
                thisClass.setTooltipCoordinate(tooltip, tooltipCoordinate); 
            });
    
        elemets.on('mouseleave', event => tooltip.style('display', 'none'));
    }

    private static renderTooltipWrapper(): void {
        d3.select('.wrapper')
            .append('div')
            .attr('class', 'tooltip-wrapper');
    }

    private static renderTooltipBlock(translateX: number = 0, translateY: number = 0): d3.Selection<d3.BaseType, unknown, HTMLElement, any> {
        const wrapper = d3.select('.tooltip-wrapper');

        let tooltip = wrapper.select('.tooltip');
        if(tooltip.size() === 0)
            tooltip = wrapper
                .append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('display', 'none');

        if(translateX !== 0 || translateY !== 0)
            tooltip.style('transform', `translate(${translateX}px, ${translateY}px)`);

        return tooltip;
    }

    private static renderTipBox(attributes: TipBoxAttributes): d3.Selection<SVGRectElement, unknown, HTMLElement, any> {
        return Block.getSvg()
            .append('rect')
            .attr('class', 'tipbox')
            .attr('x', attributes.x)
            .attr('y', attributes.y)
            .attr('width', attributes.width)
            .attr('height', attributes.height)
            .style('opacity', 0);
    }

    private static renderTooltipLine(): d3.Selection<SVGLineElement, unknown, HTMLElement, any> {
        return Block.getSvg()
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
}