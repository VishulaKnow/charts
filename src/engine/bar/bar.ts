import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, Size } from "../../model/model";
import { DataHelper, DataRow } from "../dataHelper/dataHelper";
import { Helper } from "../helper/helper";
import { Scales } from "../scale/scale";
import { SvgBlock } from "../svgBlock/svgBlock";

export class Bar
{
    static renderBar(scales: Scales, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, cssClasses: string[], chartPalette: Color[], blockSize: Size, barChartsAmount: number, barDistance: number): void {
        let groups = SvgBlock.getSvg()
            .selectAll('.bar-group');
    
        if(groups.size() === 0)
            groups = SvgBlock.getSvg()
                .selectAll('.bar-group')
                .data(data)
                .enter()
                    .append('g')
                    .attr('class', 'bar-group')
                    .attr('x', d => scales.scaleKey(d[keyField]) + margin.left)
                    .attr('y', margin.top)
                    .attr('width', scales.scaleKey.bandwidth())
                    .attr('height', blockSize.height - margin.top - margin.bottom);
    
        
        const bars = SvgBlock.getSvg()
            .selectAll('.bar-group')
            .data(data)
                .append('rect')
                .attr('class', 'bar-item')
                .style('clip-path', 'url(#chart-block)');
    
        this.fillBarAttrsByKeyOrient(bars,
            keyAxisOrient,
            scales,
            margin,
            keyField,
            valueField,
            blockSize,
            barChartsAmount,
            barDistance);
        
        Helper.setCssClasses(bars, cssClasses);
        Helper.setChartColor(bars, chartPalette, 'bar');
    }

    static fillBarAttrsByKeyOrient(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, axisOrient: string, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, blockSize: Size, barChartsAmount: number, barDistance: number): void {
        const chartIndex = d3.select('.bar-group').selectAll('.bar-item').size() - 1;
        const barSize = (scales.scaleKey.bandwidth() - barDistance * (barChartsAmount - 1)) / barChartsAmount;
        if(axisOrient === 'top')
            bars.attr('x', d => scales.scaleKey(d[keyField]) + margin.left + barSize * chartIndex + barDistance * chartIndex)
                .attr('y', d => margin.top)
                .attr('height', d => DataHelper.getValueOrZero(scales.scaleValue(d[valueField])))
                .attr('width', d => barSize);
        else if(axisOrient === 'bottom')
            bars.attr('x', d => scales.scaleKey(d[keyField]) + margin.left + barSize * chartIndex + barDistance * chartIndex)
                .attr('y', d => scales.scaleValue(d[valueField]) + margin.top)
                .attr('height', d => DataHelper.getValueOrZero(blockSize.height - margin.top - margin.bottom - scales.scaleValue(d[valueField])))
                .attr('width', d => barSize);
        else if(axisOrient === 'left')
            bars.attr('x', d => margin.left)
                .attr('y', d => scales.scaleKey(d[keyField]) + margin.top + barSize * chartIndex + barDistance * chartIndex)
                .attr('height', d => barSize)
                .attr('width', d => DataHelper.getValueOrZero(scales.scaleValue(d[valueField])));
        else if(axisOrient === 'right')
            bars.attr('x', d => scales.scaleValue(d[valueField]) + margin.left)
                .attr('y', d => scales.scaleKey(d[keyField]) + margin.top + barSize * chartIndex + barDistance * chartIndex)
                .attr('height', d => barSize)
                .attr('width', d => DataHelper.getValueOrZero(blockSize.width - margin.left - margin.right - scales.scaleValue(d[valueField])));   
    }

    static updateBarChartByValueAxis(scales: Scales, margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: string, blockSize: Size, cssClasses: string[]): void {
        const bars = SvgBlock.getSvg()
            .selectAll(`.bar-item${Helper.getCssClassesLine(cssClasses)}`) as d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>;
    
        this.fillBarAttrsByKeyOrientWithTransition(bars,
            keyAxisOrient,
            scales.scaleValue,
            margin,
            valueField,
            blockSize,
            1000);
    }
    
    static fillBarAttrsByKeyOrientWithTransition(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, axisOrient: string, scaleValue: d3.ScaleLinear<number, number>, margin: BlockMargin, valueField: string, blockSize: Size, transitionDuration: number): void {
        const barsTran = bars.transition().duration(transitionDuration);
        if(axisOrient === 'top')
            barsTran
                .attr('y', d => margin.top)
                .attr('height', d => DataHelper.getValueOrZero(scaleValue(d[valueField])));
        else if(axisOrient === 'bottom')
            barsTran
                .attr('y', d => scaleValue(d[valueField]) + margin.top)
                .attr('height', d => DataHelper.getValueOrZero(blockSize.height - margin.top - margin.bottom - scaleValue(d[valueField])));
        else if(axisOrient === 'left')
            barsTran.attr('x', d => margin.left)
                .attr('width', d => DataHelper.getValueOrZero(scaleValue(d[valueField])));
        else if(axisOrient === 'right')
            barsTran.attr('x', d => scaleValue(d[valueField]) + margin.left)
                .attr('width', d => DataHelper.getValueOrZero(blockSize.width - margin.left - margin.right - scaleValue(d[valueField]))); 
    }
}