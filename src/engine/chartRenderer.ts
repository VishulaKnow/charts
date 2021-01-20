import { BarChartSettings, BlockMargin, ChartSettings, DataSource, IntervalChartModel, IntervalOptionsModel, Model, Orient, PolarChartModel, PolarOptionsModel, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../model/model";
import { Area } from "./twoDimensionalNotation/area/area";
import { Axis } from "./features/axis/axis";
import { Bar } from "./twoDimensionalNotation/bar/bar";
import { Donut } from "./polarNotation/donut/donut";
import { GridLine } from "./features/gridLine/gridLine";
import { Legend } from "./features/legend/legend";
import { Line } from "./twoDimensionalNotation/line/line";
import { Scale, Scales } from "./features/scale/scale";
import { Block } from "./block/block";
import { Tooltip } from "./features/tolltip/tooltip";
import { RecordOverflowAlert } from "./features/recordOverflowAlert/recordOverflowAlert";
import { Gantt } from "./intervalNotation/gantt";

export class ChartRenderer
{
    public static render2D(block: Block, model: Model, data: DataSource): void {
        const options = <TwoDimensionalOptionsModel>model.options;
    
        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar.groupDistance);        
            
        block.renderSvg(model.blockCanvas.class, model.blockCanvas.size);
    
        Axis.render(block, Scale.scales.scaleValue, options.scale.scaleValue, options.axis.valueAxis);
        Axis.render(block, Scale.scales.scaleKey, options.scale.scaleKey, options.axis.keyAxis);    
    
        GridLine.render(block, options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin);
        
        this.render2DCharts(block, 
            options.charts,
            Scale.scales,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.chartSettings.bar,
            model.blockCanvas.size);
    
        Legend.render(block, 
            data,
            options,
            model.legendBlock,
            model.blockCanvas.size);
        
        Tooltip.renderTooltips(block, model, data, Scale.scales);
        if(model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount);
    }
    
    public static renderPolar(block: Block, model: Model, data: DataSource) {
        const options = <PolarOptionsModel>model.options;
    
        block.renderSvg(model.blockCanvas.class, model.blockCanvas.size);
    
        this.renderPolarCharts(block, options.charts,
            data,
            model.chartBlock.margin,
            model.blockCanvas.size);
    
        Legend.render(block, data, options, model.legendBlock, model.blockCanvas.size);
    
        Tooltip.renderTooltips(block, model, data, Scale.scales);
        if(model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount);
    }

    public static renderInterval(block: Block, model: Model, data: DataSource): void {
        const options = <IntervalOptionsModel>model.options;
        
        block.renderSvg(model.blockCanvas.class, model.blockCanvas.size);

        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar.groupDistance);    

        Axis.render(block, Scale.scales.scaleValue, options.scale.scaleValue, options.axis.valueAxis);
        Axis.render(block, Scale.scales.scaleKey, options.scale.scaleKey, options.axis.keyAxis);

        GridLine.render(block, options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin);
        
        this.renderIntervalCharts(block, options.charts,
            data,
            model.chartBlock.margin,
            model.blockCanvas.size,
            options.axis.keyAxis.orient,
            model.chartSettings);

        Legend.render(block, data, options, model.legendBlock, model.blockCanvas.size);
        Tooltip.renderTooltips(block, model, data, Scale.scales);
        if(model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount);
    }

    public static updateByValueAxis(block: Block, model: Model, data: DataSource) {
        const options = <TwoDimensionalOptionsModel>model.options;
    
        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar.groupDistance);
    
        Axis.updateValueAxisDomain(block, 
            Scale.scales.scaleValue,
            options.scale.scaleValue,
            options.axis.valueAxis.class,
            options.axis.valueAxis.orient);

        GridLine.rerender(block, 
            options.additionalElements.gridLine.flag,
            options.axis.keyAxis, 
            options.axis.valueAxis, 
            model.blockCanvas.size, 
            model.chartBlock.margin);
        
        this.updateChartsByValueAxis(block, 
            options.charts,
            Scale.scales,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.blockCanvas.size);
    }

    private static render2DCharts(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, margin: BlockMargin, keyAxisOrient: Orient, barSettings: BarChartSettings, blockSize: Size) {      
        block.renderClipPath(margin, blockSize);
        block.renderChartBlock(blockSize, margin);
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.type === 'bar')
                Bar.render(block,
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    chart.cssClasses,
                    chart.elementColors,
                    blockSize,
                    charts.filter(ch => ch.type === 'bar').length,
                    barSettings);
            else if(chart.type === 'line')
                Line.render(block,
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    chart.cssClasses,
                    chart.elementColors);  
            else if(chart.type === 'area')
                Area.render(block,
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    chart.cssClasses,
                    chart.elementColors,
                    blockSize);
        });
        // Line.moveChartsToFront();
    }
    
    private static renderPolarCharts(block: Block, charts: PolarChartModel[], data: DataSource, margin: BlockMargin, blockSize: Size) {
        charts.forEach((chart: PolarChartModel) => {
            if(chart.type === 'donut')
                Donut.render(block, data[chart.data.dataSource],
                    margin,
                    chart.data.valueField.name,
                    chart.data.keyField.name,
                    chart.appearanceOptions,
                    chart.cssClasses,
                    chart.elementColors,
                    blockSize);
        });
    }

    private static renderIntervalCharts(block: Block, charts: IntervalChartModel[], data: DataSource, margin: BlockMargin, blockSize: Size, keyAxisOrient: Orient, chartSettings: ChartSettings): void {
        block.renderChartBlock(blockSize, margin);
        charts.forEach(chart => {
            if(chart.type === 'gantt')
                Gantt.render(block,
                    data[chart.data.dataSource],
                    Scale.scales,
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField1.name,
                    chart.data.valueField2.name,
                    keyAxisOrient,
                    chart.cssClasses,
                    chart.elementColors,
                    blockSize,
                    chartSettings.bar);
        })
    }

    private static updateChartsByValueAxis(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, margin: BlockMargin, keyAxisOrient: string, blockSize: Size): void {
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.type === 'bar')
                Bar.updateBarChartByValueAxis(block, 
                    scales,
                    margin,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    blockSize,
                    chart.cssClasses);
            else if(chart.type === 'line') {
                Line.updateLineChartByValueAxis(block,
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    chart.data.keyField.name,
                    chart.data.valueField.name,
                    keyAxisOrient,
                    chart.cssClasses);
            }   
            else if(chart.type === 'area')
                Area.updateAreaChartByValueAxis(block, 
                    scales,
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