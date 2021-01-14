import { BlockMargin, DataSource, Model, Orient, PolarChartModel, PolarOptionsModel, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../model/model";
import { Area } from "./twoDimensionalNotation/area/area";
import { Axis } from "./twoDimensionalNotation/axis/axis";
import { Bar } from "./twoDimensionalNotation/bar/bar";
import { Donut } from "./polarNotation/donut/donut";
import { GridLine } from "./twoDimensionalNotation/gridLine/gridLine";
import { Legend } from "./features/legend/legend";
import { Line } from "./twoDimensionalNotation/line/line";
import { Scale, Scales } from "./twoDimensionalNotation/scale/scale";
import { SvgBlock } from "./svgBlock/svgBlock";
import { Tooltip } from "./features/tolltip/tooltip";
import { RecordOverflowAlert } from "./recordOverflowAlert/recordOverflowAlert";
import config from "../config/configOptions";

export class ChartRenderer
{
    public static render2D(model: Model, data: DataSource): void {
        const options = <TwoDimensionalOptionsModel>model.options;
    
        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar.groupDistance);
            
        SvgBlock.render(model.blockCanvas.class, model.blockCanvas.size);
    
        Axis.render(Scale.scales.scaleValue, options.axis.valueAxis);
        Axis.render(Scale.scales.scaleKey, options.axis.keyAxis);    
    
        GridLine.render(options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin);
        
        this.render2DCharts(options.charts,
            Scale.scales,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.chartSettings.bar.barDistance,
            model.blockCanvas.size);
    
        Legend.render(data,
            options,
            model.legendBlock,
            model.blockCanvas.size);
        
        Tooltip.renderTooltips(model, data, Scale.scales);
        if(model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(model.dataSettings.scope.hidedRecordsAmount);
    }
    
    public static renderPolar(model: Model, data: DataSource) {
        const options = <PolarOptionsModel>model.options;
    
        SvgBlock.render(model.blockCanvas.class, model.blockCanvas.size);
    
        this.renderPolarCharts(options.charts,
            data,
            model.chartBlock.margin,
            model.blockCanvas.size);
    
        Legend.render(data,
            options,
            model.legendBlock,
            model.blockCanvas.size);
    
        Tooltip.renderTooltips(model, data, Scale.scales);
        if(model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(model.dataSettings.scope.hidedRecordsAmount);
    }

    public static updateByValueAxis(model: Model, data: DataSource) {
        const options = <TwoDimensionalOptionsModel>model.options;
    
        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar.groupDistance);
    
        Axis.updateValueAxisDomain(Scale.scales.scaleValue,
            options.axis.valueAxis.class,
            options.axis.valueAxis.orient);

        GridLine.rerender(options.additionalElements.gridLine.flag,
            options.axis.keyAxis, 
            options.axis.valueAxis, 
            config.canvas.size, 
            model.chartBlock.margin);
        
        this.updateChartsByValueAxis(options.charts,
            Scale.scales,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.blockCanvas.size);
    }

    private static render2DCharts(charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, margin: BlockMargin, keyAxisOrient: Orient, barDistance: number, blockSize: Size) {
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
                Bar.render(scales,
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
                Area.render(scales,
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
    
    private static renderPolarCharts(charts: PolarChartModel[], data: DataSource, margin: BlockMargin, blockSize: Size) {
        charts.forEach((chart: PolarChartModel) => {
            if(chart.type === 'donut')
                Donut.render(data[chart.data.dataSource],
                    margin,
                    chart.data.valueField.name,
                    chart.appearanceOptions,
                    chart.cssClasses,
                    chart.elementColors,
                    blockSize);
        });
    }

    private static updateChartsByValueAxis(charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, margin: BlockMargin, keyAxisOrient: string, blockSize: Size): void {
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.type === 'bar')
                Bar.updateBarChartByValueAxis(scales,
                    margin,
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
}