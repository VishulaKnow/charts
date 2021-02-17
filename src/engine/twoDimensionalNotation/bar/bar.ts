import { Color } from "d3-color";
import { stack } from 'd3-shape';
import { select, Selection, BaseType } from 'd3-selection';
import { AxisScale } from 'd3-axis'
import { transition } from "d3-transition";
import { BarChartSettings, BlockMargin, DataRow, Field, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { ValueFormatter } from "../../valueFormatter";
import { Helper } from "../../helper";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { EmbeddedLabels } from "../../features/embeddedLabels/embeddedLabels";
import { EmbeddedLabelsHelper } from "../../features/embeddedLabels/embeddedLabelsHelper";
import { BarAttrs, BarHelper } from "./barHelper";
import { sum } from "d3-array";

select.prototype.transition = transition;

export class Bar
{
    private static barItemClass  = 'bar-item';

    public static render(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barSettings: BarChartSettings, barsAmounts: number[], isSegmented: boolean): void {
        if(isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart, barsAmounts, blockSize, barSettings);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart, barsAmounts, blockSize, barSettings);
    }

    public static updateBarChartByValueAxis(block: Block, scales: Scales, margin: BlockMargin, keyAxisOrient: string, chart: TwoDimensionalChartModel, blockSize: Size, isSegmented: boolean): void {
        if(isSegmented) {
            const bars = block.getChartBlock()
                .selectAll(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}`) as Selection<SVGRectElement, DataRow, BaseType, unknown>;

            this.fillStackedBarAttrsByKeyOrientWithTransition(bars,
                keyAxisOrient,
                scales.scaleValue,
                margin,
                blockSize,
                1000);
        } else {
            chart.data.valueFields.forEach((field, index) => {
                const bars = block.getChartBlock()
                    .selectAll(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`) as Selection<SVGRectElement, DataRow, BaseType, unknown>;
        
                this.fillBarAttrsByKeyOrientWithTransition(bars,
                    keyAxisOrient,
                    scales.scaleValue,
                    margin,
                    field.name,
                    blockSize,
                    1000);
            });
        }
    }

    public static getAllBarItems(block: Block, chartCssClasses: string[]): Selection<BaseType, DataRow, BaseType, unknown> {
        return block.getSvg().selectAll(`rect.${this.barItemClass}${Helper.getCssClassesLine(chartCssClasses)}`);
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], blockSize: Size, barSettings: BarChartSettings): void {
        this.renderBarGroups(block, data);
        
        chart.data.valueFields.forEach((field, index) => {
            const bars = block.getChartBlock()
                .selectAll('.bar-group')
                .data(data)
                    .append('rect')
                    .attr('class', this.barItemClass)
                    // .style('clip-path', `url(${block.getClipPathId()})`);

            const barAttrs = BarHelper.getGroupedBarAttrsByKeyOrient(block,
                keyAxisOrient,
                scales,
                margin,
                keyField.name,
                field.name,
                blockSize,
                sum(barsAmounts),
                barSettings,
                this.barItemClass);
        
            this.fillBarAttrsByKeyOrient(bars, barAttrs);
            
            Helper.setCssClasses(bars, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(bars, chart.style, index, 'fill');

            if(chart.embeddedLabels !== 'none')
                EmbeddedLabels.render(block, bars, EmbeddedLabelsHelper.getLabelField(chart.embeddedLabels, chart.data.valueFields, keyField, index), chart.embeddedLabels, keyAxisOrient, blockSize, margin);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, barsAmounts: number[], blockSize: Size, barSettings: BarChartSettings): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = stack().keys(keys)(data);

        let groups = block.getChartBlock()
            .selectAll<SVGGElement, DataRow>('g')
            .data(stackedData);
        
        if(groups.empty())
            groups = groups
                .data(stackedData)
                .enter()
                    .append<SVGGElement>('g');

        const bars = groups
            .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(d => d)
            .enter()
                .append('rect')
                .attr('class', this.barItemClass)
                // .style('clip-path', `url(${block.getClipPathId()})`);

        const barAttrs = BarHelper.getStackedBarAttrByKeyOrient(keyAxisOrient, scales, margin, keyField.name, blockSize, BarHelper.getBarIndex(barsAmounts, chart.index), sum(barsAmounts), barSettings);
       
        bars
            .attr('x', barAttrs.x)
            .attr('y', barAttrs.y)
            .attr('width', barAttrs.width)
            .attr('height', barAttrs.height);

        Helper.setCssClasses(bars, chart.cssClasses); // Для обозначения принадлежности бара к конкретному чарту
        groups.each(function(d, i) {
            Helper.setCssClasses(select(this).selectAll(`${Helper.getCssClassesLine(chart.cssClasses)}`), Helper.getCssClassesWithElementIndex(chart.cssClasses, i)); // Для обозначения принадлежности бара к конкретной части стака
        });
        
        this.setSegmentColor(groups, chart.style.elementColors);
    }

    private static renderBarGroups(block: Block, data: DataRow[]): void {
        let groups = block.getChartBlock()
            .selectAll('.bar-group');

        if(groups.empty())
            groups = block.getChartBlock()
                .selectAll('.bar-group')
                .data(data)
                .enter()
                    .append('g')
                    .attr('class', 'bar-group');
    }

    private static fillBarAttrsByKeyOrient(bars: Selection<SVGRectElement, DataRow, BaseType, unknown>, barAttrs: BarAttrs): void {
        bars.attr('x', d => barAttrs.x(d))
            .attr('y', d => barAttrs.y(d))
            .attr('height', d => barAttrs.height(d))
            .attr('width', d => barAttrs.width(d));   
    }
    
    private static fillBarAttrsByKeyOrientWithTransition(bars: Selection<SVGRectElement, DataRow, BaseType, unknown>, axisOrient: string, scaleValue: AxisScale<any>, margin: BlockMargin, valueField: string, blockSize: Size, transitionDuration: number): void {
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

    private static fillStackedBarAttrsByKeyOrientWithTransition(bars: Selection<SVGRectElement, DataRow, BaseType, unknown>, axisOrient: string, scaleValue: AxisScale<any>, margin: BlockMargin, blockSize: Size, transitionDuration: number): void {
        const barsTran = bars.transition().duration(transitionDuration);
        
        if(axisOrient === 'bottom') {
            barsTran
                .attr('y', d => scaleValue(d[1]) + margin.top)
                .attr('height', d => blockSize.height - margin.top - margin.bottom - scaleValue(d[1] - d[0]));
        }
        if(axisOrient === 'left') {
            barsTran
                .attr('x', d => margin.left + scaleValue(d[0]) + 1)
                .attr('width', d => ValueFormatter.getValueOrZero(scaleValue(d[1] - d[0])));
        }
        if(axisOrient === 'right') {
            barsTran
                .attr('x', d => scaleValue(d[1]) + margin.left)
                .attr('width', d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scaleValue(d[1] - d[0])));
        } 
        if(axisOrient === 'top') {
            barsTran
                .attr('y', d => margin.top + scaleValue(d[0]))
                .attr('height', d => ValueFormatter.getValueOrZero(scaleValue(d[1] - d[0])));
        }
    } 

    private static setSegmentColor(segments: Selection<SVGGElement, any, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}