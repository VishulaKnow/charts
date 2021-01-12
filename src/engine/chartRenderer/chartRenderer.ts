import { BlockMargin, Model, PolarChartModel, PolarOptionsModel, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../../model/model";
import { Area } from "../area/area";
import { Axis } from "../axis/axis";
import { Bar } from "../bar/bar";
import { Donut } from "../donut/donut";
import { GridLine } from "../gridLine/gridLine";
import { Legend } from "../legend/legend";
import { Line } from "../line/line";
import { Scale, Scales } from "../scale/scale";
import { SvgBlock } from "../svgBlock/svgBlock";
import { Tooltip } from "../tolltip/tooltip";

export class ChartRenderer
{
    static render2D(model: Model, data: any): void {
        const options = <TwoDimensionalOptionsModel>model.options;
    
        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar.groupDistance);
            
        SvgBlock.renderSvgBlock(model.blockCanvas.class, model.blockCanvas.size);
    
        Axis.renderAxis(Scale.scales.scaleValue, options.axis.valueAxis);
    
        Axis.renderAxis(Scale.scales.scaleKey, options.axis.keyAxis);    
    
        GridLine.render(options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin);
        
        this.render2DCharts(options.charts,
            Scale.scales,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.chartSettings.bar.barDistance,
            model.blockCanvas.size);
    
        Legend.renderLegend(data,
            options,
            model.legendBlock,
            model.chartBlock.margin,
            model.blockCanvas.size);
        
        Tooltip.renderTooltips(model, data, Scale.scales);
    }
    
    static renderPolar(model: Model, data: any) {
        const options = <PolarOptionsModel>model.options;
    
        SvgBlock.renderSvgBlock(model.blockCanvas.class, model.blockCanvas.size);
    
        this.renderPolarCharts(options.charts,
            data,
            model.chartBlock.margin,
            model.blockCanvas.size);
    
        Legend.renderLegend(data,
            options,
            model.legendBlock,
            model.chartBlock.margin,
            model.blockCanvas.size);
    
        Tooltip.renderTooltips(model, data, Scale.scales);
    }

    static render2DCharts(charts: any[], scales: Scales, data: any, margin: BlockMargin, keyAxisOrient: string, barDistance: number, blockSize: Size) {
        SvgBlock.getSvg()
            .append('clipPath')
            .attr('id', 'chart-block')
            .append('rect')
            .attr('x', margin.left)
            .attr('y', margin.top)
            .attr('width', blockSize.width - margin.left - margin.right)
            .attr('height', blockSize.height - margin.top - margin.bottom);
        
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.type === 'bar')
                Bar.renderBar(scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    chart.cssClasses,
                    chart.elementColors,
                    blockSize,
                    charts.filter(ch => ch.type === 'bar').length,
                    barDistance);
            else if(chart.type === 'line')
                Line.render(scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    chart.cssClasses,
                    chart.elementColors);  
            else if(chart.type === 'area')
                Area.renderArea(scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    chart.cssClasses,
                    chart.elementColors,
                    blockSize);
        });
    }
    
    static renderPolarCharts(charts: any[], data: any, margin: BlockMargin, blockSize: Size) {
        charts.forEach((chart: PolarChartModel) => {
            if(chart.type === 'donut')
                Donut.renderDonut(data[chart.data.dataSource],
                    margin,
                    chart.data.valueField.name,
                    chart.appearanceOptions,
                    chart.cssClasses,
                    chart.elementColors,
                    blockSize);
        })
    }

    static updateChartsByValueAxis(charts: any[], scales: Scales, data: any, margin: BlockMargin, keyAxisOrient: string, blockSize: Size): void {
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.type === 'bar')
                Bar.updateBarChartByValueAxis(scales,
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    blockSize,
                    chart.cssClasses);
            else if(chart.type === 'line') {
                Line.updateLineChartByValueAxis(scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    chart.cssClasses);
            }   
            else if(chart.type === 'area')
                Area.updateAreaChartByValueAxis(scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    blockSize,
                    chart.cssClasses);
        });
    }
    
    static updateByValueAxis(model: Model, data: any) {
        const options = <TwoDimensionalOptionsModel>model.options;
    
        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar.groupDistance);
    
        Axis.updateValueAxisDomain(Scale.scales.scaleValue,
            options.axis.valueAxis.class,
            options.axis.valueAxis.orient);
        
        this.updateChartsByValueAxis(options.charts,
            Scale.scales,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.blockCanvas.size);
    }
}