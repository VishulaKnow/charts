import { BarChartSettings, BlockMargin, ChartSettings, DataSource, IntervalChartModel, IntervalOptionsModel, Model, Orient, PolarChartModel, PolarOptionsModel, Size, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../model/model";
import { Area } from "./twoDimensionalNotation/area/area";
import { Axis } from "./features/axis/axis";
import { Bar } from "./twoDimensionalNotation/bar/bar";
import { Donut } from "./polarNotation/donut";
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
            model.chartSettings.bar);        
            
        block.renderSvg(model.blockCanvas.size);
    
        Axis.render(block, Scale.scales, options.scale, options.axis, model.chartBlock.margin, model.blockCanvas.size);    
    
        GridLine.render(block, options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin, options.scale.scaleKey);
        
        this.render2DCharts(block, 
            options.charts,
            Scale.scales,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.chartSettings.bar,
            model.blockCanvas.size,
            options.isSegmented);
    
        Legend.render(block, 
            data,
            options,
            model.legendBlock,
            model.blockCanvas.size);
        
        Tooltip.renderTooltips(block, model, data);
        if(model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount, 'top', options.orient);
    }
    
    public static renderPolar(block: Block, model: Model, data: DataSource) {
        const options = <PolarOptionsModel>model.options;
    
        block.renderSvg(model.blockCanvas.size);
    
        this.renderPolarCharts(block, options.charts,
            data,
            model.chartBlock.margin,
            model.blockCanvas.size);
    
        Legend.render(block, data, options, model.legendBlock, model.blockCanvas.size);
    
        Tooltip.renderTooltips(block, model, data);
        if(model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount, 'bottom');
    }

    public static renderInterval(block: Block, model: Model, data: DataSource): void {
        const options = <IntervalOptionsModel>model.options;
        
        block.renderSvg(model.blockCanvas.size);

        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar);    

        Axis.render(block, Scale.scales, options.scale, options.axis, model.chartBlock.margin, model.blockCanvas.size); 

        GridLine.render(block, options.additionalElements.gridLine.flag, options.axis.keyAxis, options.axis.valueAxis, model.blockCanvas.size, model.chartBlock.margin, options.scale.scaleKey);
        
        this.renderIntervalCharts(block, 
            options.charts,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.chartSettings);

        Legend.render(block, data, options, model.legendBlock, model.blockCanvas.size);
        Tooltip.renderTooltips(block, model, data);
        if(model.dataSettings.scope.hidedRecordsAmount !== 0)
            RecordOverflowAlert.render(block, model.dataSettings.scope.hidedRecordsAmount, 'top', options.orient);
    }

    private static render2DCharts(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, margin: BlockMargin, keyAxisOrient: Orient, barSettings: BarChartSettings, blockSize: Size, isSegmented: boolean) {      
        block.renderClipPath(margin, blockSize);
        block.renderChartBlock();
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.type === 'bar')
                Bar.render(block,
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize,
                    barSettings,
                    isSegmented);
            else if(chart.type === 'line')
                Line.render(block,
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize);  
            else if(chart.type === 'area')
                Area.render(block,
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize,
                    isSegmented);
        });
    }
    
    private static renderPolarCharts(block: Block, charts: PolarChartModel[], data: DataSource, margin: BlockMargin, blockSize: Size) {
        charts.forEach((chart: PolarChartModel) => {
            if(chart.type === 'donut')
                Donut.render(block, 
                    data[chart.data.dataSource],
                    margin,
                    chart,
                    blockSize);
        });
    }

    private static renderIntervalCharts(block: Block, charts: IntervalChartModel[], data: DataSource, margin: BlockMargin, keyAxisOrient: Orient, chartSettings: ChartSettings): void {
        block.renderChartBlock();
        charts.forEach(chart => {
            if(chart.type === 'gantt')
                Gantt.render(block,
                    data[chart.data.dataSource],
                    Scale.scales,
                    margin,
                    keyAxisOrient,
                    chart,
                    chartSettings.bar);
        });
    }

    public static updateByValueAxis(block: Block, model: Model, data: DataSource) {
        const options = <TwoDimensionalOptionsModel>model.options;
    
        Scale.fillScales(options.scale.scaleKey,
            options.scale.scaleValue,
            model.chartSettings.bar);
    
        Axis.updateValueAxisDomain(block, 
            Scale.scales.scaleValue,
            options.scale.scaleValue,
            options.axis.valueAxis);

        GridLine.rerender(block, 
            options.additionalElements.gridLine.flag,
            options.axis.keyAxis, 
            options.axis.valueAxis, 
            model.blockCanvas.size, 
            model.chartBlock.margin,
            options.scale.scaleKey);
        
        this.updateChartsByValueAxis(block, 
            options.charts,
            Scale.scales,
            data,
            model.chartBlock.margin,
            options.axis.keyAxis.orient,
            model.blockCanvas.size);
    }

    private static updateChartsByValueAxis(block: Block, charts: TwoDimensionalChartModel[], scales: Scales, data: DataSource, margin: BlockMargin, keyAxisOrient: Orient, blockSize: Size): void {
        charts.forEach((chart: TwoDimensionalChartModel) => {
            if(chart.type === 'bar')
                Bar.updateBarChartByValueAxis(block, 
                    scales,
                    margin,
                    keyAxisOrient,
                    chart,
                    blockSize);
            else if(chart.type === 'line') {
                Line.updateLineChartByValueAxis(block,
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    keyAxisOrient,
                    chart);
            }   
            else if(chart.type === 'area')
                Area.updateAreaChartByValueAxis(block, 
                    scales,
                    data[chart.data.dataSource],
                    margin,
                    chart,
                    keyAxisOrient,
                    blockSize);
        });
    }
}