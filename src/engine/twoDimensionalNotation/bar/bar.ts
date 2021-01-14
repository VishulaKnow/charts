import * as d3 from "d3";
import { Color } from "d3";
import { BlockMargin, DataRow, Orient, Size } from "../../../model/model";
import { ValueFormatter } from "../../valueFormatter";
import { Helper } from "../../helper";
import { Scales } from "../scale/scale";
import { SvgBlock } from "../../svgBlock/svgBlock";

interface BarAttrs {
    x: (data: DataRow) => number;
    y: (data: DataRow) => number;
    width: (data: DataRow) => number;
    height: (data: DataRow) => number;
}

export class Bar
{
    public static render(scales: Scales, data: DataRow[], margin: BlockMargin, keyField: string, valueField: string, keyAxisOrient: Orient, cssClasses: string[], chartPalette: Color[], blockSize: Size, barChartsAmount: number, barDistance: number): void {
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

        const barAttrs = this.getBarAttrsByKeyOrient(keyAxisOrient,
            scales,
            margin,
            keyField,
            valueField,
            blockSize,
            barChartsAmount,
            barDistance);
    
        this.fillBarAttrsByKeyOrient(bars, barAttrs);
        
        Helper.setCssClasses(bars, cssClasses);
        Helper.setChartColor(bars, chartPalette, 'bar');
    }

    public static updateBarChartByValueAxis(scales: Scales, margin: BlockMargin, valueField: string, keyAxisOrient: string, blockSize: Size, cssClasses: string[]): void {
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

    private static getBarAttrsByKeyOrient(axisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, blockSize: Size, barChartsAmount: number, barDistance: number): BarAttrs {
        const chartIndex = d3.select('.bar-group').selectAll('.bar-item').size() - 1;
        const barSize = (scales.scaleKey.bandwidth() - barDistance * (barChartsAmount - 1)) / barChartsAmount;
        const attrs: BarAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }
        if(axisOrient === 'top' || axisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(d[keyField]) + margin.left + barSize * chartIndex + barDistance * chartIndex;
            attrs.width = d => barSize;
        }
        if(axisOrient === 'left' || axisOrient === 'right') {
            attrs.y = d => scales.scaleKey(d[keyField]) + margin.top + barSize * chartIndex + barDistance * chartIndex;
            attrs.height = d => barSize;
        }
        if(axisOrient === 'top') {
            attrs.y = d => margin.top;
            attrs.height = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[valueField]));
        } 
        else if(axisOrient === 'bottom') {
            attrs.y = d => scales.scaleValue(d[valueField]) + margin.top;
            attrs.height = d => ValueFormatter.getValueOrZero(blockSize.height - margin.top - margin.bottom - scales.scaleValue(d[valueField]));
        }   
        else if(axisOrient === 'left') {
            attrs.x = d => margin.left;
            attrs.width = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[valueField]));
        }    
        else if(axisOrient === 'right') {
            attrs.x = d => scales.scaleValue(d[valueField]) + margin.left;
            attrs.width = d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scales.scaleValue(d[valueField]))
        }
        return attrs;
    }

    private static fillBarAttrsByKeyOrient(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, barAttrs: BarAttrs): void {
        bars.attr('x', d => barAttrs.x(d))
            .attr('y', d => barAttrs.y(d))
            .attr('height', d => barAttrs.height(d))
            .attr('width', d => barAttrs.width(d));   
    }
    
    private static fillBarAttrsByKeyOrientWithTransition(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, axisOrient: string, scaleValue: d3.ScaleLinear<number, number>, margin: BlockMargin, valueField: string, blockSize: Size, transitionDuration: number): void {
        const barsTran = bars.transition().duration(transitionDuration);
        if(axisOrient === 'top')
            barsTran
                .attr('y', d => margin.top)
                .attr('height', d => ValueFormatter.getValueOrZero(scaleValue(d[valueField])));
        else if(axisOrient === 'bottom')
            barsTran
                .attr('y', d => scaleValue(d[valueField]) + margin.top)
                .attr('height', d => ValueFormatter.getValueOrZero(blockSize.height - margin.top - margin.bottom - scaleValue(d[valueField])));
        else if(axisOrient === 'left')
            barsTran
                .attr('x', d => margin.left)
                .attr('width', d => ValueFormatter.getValueOrZero(scaleValue(d[valueField])));
        else if(axisOrient === 'right')
            barsTran
                .attr('x', d => scaleValue(d[valueField]) + margin.left)
                .attr('width', d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scaleValue(d[valueField]))); 
    }
}