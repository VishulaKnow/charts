import * as d3 from "d3";
import { BarChartSettings, BlockMargin, DataRow, Orient, Size, TwoDimensionalChartModel } from "../../../model/model";
import { ValueFormatter } from "../../valueFormatter";
import { Helper } from "../../helper";
import { Scale, Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { Color } from "d3";
import { EmbeddedLabels } from "../../features/embeddedLabels/embeddedLabels";
import { MIN_BAR_SIZE_FOR_EMBEDDED_LABELS_DISPLAY } from "../../../model/twoDimensionalModel";

interface BarAttrs {
    x: (dataRow: DataRow) => number;
    y: (dataRow: DataRow) => number;
    width: (dataRow: DataRow) => number;
    height: (dataRow: DataRow) => number;
}

export class Bar
{
    private static barItemClass  = 'bar-item';

    public static render(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barSettings: BarChartSettings, isSegmented: boolean): void {
        if(isSegmented)
            this.renderSegmented(block, scales, data, margin, keyAxisOrient, chart, blockSize, barSettings);
        else
            this.renderGrouped(block, scales, data, margin, keyAxisOrient, chart, blockSize, barSettings);
    }

    public static updateBarChartByValueAxis(block: Block, scales: Scales, margin: BlockMargin, keyAxisOrient: string, chart: TwoDimensionalChartModel, blockSize: Size, isSegmented: boolean): void {
        if(isSegmented) {
            const bars = block.getChartBlock()
                .selectAll(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}`) as d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>;

            this.fillStackedBarAttrsByKeyOrientWithTransition(bars,
                keyAxisOrient,
                scales.scaleValue,
                margin,
                blockSize,
                1000);
        } else {
            chart.data.valueFields.forEach((field, index) => {
                const bars = block.getChartBlock()
                    .selectAll(`.${this.barItemClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${index}`) as d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>;
        
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

    public static getAllBarItems(block: Block): d3.Selection<d3.BaseType, DataRow, d3.BaseType, unknown> {
        return block.getSvg().selectAll(`rect.${this.barItemClass}`);
    }

    private static renderGrouped(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barSettings: BarChartSettings): void {
        this.renderBarGroups(block, data);
        
        chart.data.valueFields.forEach((field, index) => {
            const bars = block.getChartBlock()
                .selectAll('.bar-group')
                .data(data)
                    .append('rect')
                    .attr('class', this.barItemClass)
                    .style('clip-path', `url(${block.getClipPathId()})`);

            const barAttrs = this.getGroupedBarAttrsByKeyOrient(block,
                keyAxisOrient,
                scales,
                margin,
                chart.data.keyField.name,
                field.name,
                blockSize,
                chart.data.valueFields.length,
                barSettings);
        
            this.fillBarAttrsByKeyOrient(bars, barAttrs);
            
            Helper.setCssClasses(bars, Helper.getCssClassesWithElementIndex(chart.cssClasses, index));
            Helper.setChartStyle(bars, chart.style, index, 'fill');

            if(chart.embeddedLabels !== 'none' && parseFloat(bars.attr('height')) >= MIN_BAR_SIZE_FOR_EMBEDDED_LABELS_DISPLAY)
                EmbeddedLabels.render(block, bars, EmbeddedLabels.getLabelField(chart.embeddedLabels, chart.data, index), chart.embeddedLabels, blockSize, margin);
        });
    }

    private static renderSegmented(block: Block, scales: Scales, data: DataRow[], margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size, barSettings: BarChartSettings): void {
        const keys = chart.data.valueFields.map(field => field.name);
        const stackedData = d3.stack().keys(keys)(data);

        const groups = block.getChartBlock()
            .selectAll('g')
            .data(stackedData)
            .enter()
                .append('g');

        const bars = groups
            .selectAll('rect')
            .data(d => d)
            .enter()
                .append('rect')
                .attr('class', this.barItemClass)
                .style('clip-path', `url(${block.getClipPathId()})`);

        const barAttrs = this.getStackedBarAttrByKeyOrient(keyAxisOrient, scales, margin, chart.data.keyField.name, blockSize, barSettings);
       
        bars
            .attr('x', barAttrs.x)
            .attr('y', barAttrs.y)
            .attr('width', barAttrs.width)
            .attr('height', barAttrs.height);

        groups.each(function(d, i) {
            Helper.setCssClasses(d3.select(this).selectAll('rect'), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
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

    private static getGroupedBarAttrsByKeyOrient(block: Block, axisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, valueField: string, blockSize: Size, barsAmount: number, barSettings: BarChartSettings): BarAttrs {
        const chartIndex = block.getSvg().select('.bar-group').selectAll(`.${this.barItemClass}`).size() - 1;
        const barDistance = barSettings.barDistance;
        const barStep = (Scale.getScaleWidth(scales.scaleKey) - barDistance * (barsAmount - 1)) / barsAmount; // Space for one bar
        const barSize = barStep > barSettings.maxBarWidth ? barSettings.maxBarWidth : barStep;
        const barDiff = (barStep - barSize) * barsAmount / 2; // if bar bigger than maxWidth, diff for x coordinate

        const attrs: BarAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        if(axisOrient === 'top' || axisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(d[keyField]) + margin.left + barSize * chartIndex + barDistance * chartIndex + barDiff;
            attrs.width = d => barSize;
        }
        if(axisOrient === 'left' || axisOrient === 'right') {
            attrs.y = d => scales.scaleKey(d[keyField]) + margin.top + barSize * chartIndex + barDistance * chartIndex + barDiff;
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
            attrs.x = d => margin.left + 1;
            attrs.width = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[valueField]));
        }    
        else if(axisOrient === 'right') {
            attrs.x = d => scales.scaleValue(d[valueField]) + margin.left;
            attrs.width = d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scales.scaleValue(d[valueField]));
        }

        return attrs;
    }

    private static getStackedBarAttrByKeyOrient(axisOrient: Orient, scales: Scales, margin: BlockMargin, keyField: string, blockSize: Size, barSettings: BarChartSettings): BarAttrs {
        const barStep = (Scale.getScaleWidth(scales.scaleKey));
        const barSize = barStep > barSettings.maxBarWidth ? barSettings.maxBarWidth : barStep;
        const barDiff = (barStep - barSize) / 2;

        const attrs: BarAttrs = {
            x: null,
            y: null,
            width: null,
            height: null
        }

        if(axisOrient === 'top' || axisOrient === 'bottom') {
            attrs.x = d => scales.scaleKey(d.data[keyField]) + margin.left + barDiff;
            attrs.width = d => barSize;
        }
        if(axisOrient === 'left' || axisOrient === 'right') {
            attrs.y = d => scales.scaleKey(d.data[keyField]) + margin.top + barDiff;
            attrs.height = d => barSize;
        }
        
        if(axisOrient === 'top') {
            attrs.y = d => margin.top + scales.scaleValue(d[0]);
            attrs.height = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[1] - d[0]));
        }
        if(axisOrient === 'bottom') {
            attrs.y = d => scales.scaleValue(d[1]) + margin.top;
            attrs.height = d => blockSize.height - margin.top - margin.bottom - scales.scaleValue(d[1] - d[0]);
        }
        if(axisOrient === 'left') {
            attrs.x = d => margin.left + scales.scaleValue(d[0]) + 1;
            attrs.width = d => ValueFormatter.getValueOrZero(scales.scaleValue(d[1] - d[0]));
        }
        if(axisOrient === 'right') {
            attrs.x = d => scales.scaleValue(d[1]) + margin.left;
            attrs.width = d => ValueFormatter.getValueOrZero(blockSize.width - margin.left - margin.right - scales.scaleValue(d[1] - d[0]));
        }

        return attrs;
    }

    private static fillBarAttrsByKeyOrient(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, barAttrs: BarAttrs): void {
        bars.attr('x', d => barAttrs.x(d))
            .attr('y', d => barAttrs.y(d))
            .attr('height', d => barAttrs.height(d))
            .attr('width', d => barAttrs.width(d));   
    }
    
    private static fillBarAttrsByKeyOrientWithTransition(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, axisOrient: string, scaleValue: d3.AxisScale<any>, margin: BlockMargin, valueField: string, blockSize: Size, transitionDuration: number): void {
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

    private static fillStackedBarAttrsByKeyOrientWithTransition(bars: d3.Selection<SVGRectElement, DataRow, d3.BaseType, unknown>, axisOrient: string, scaleValue: d3.AxisScale<any>, margin: BlockMargin, blockSize: Size, transitionDuration: number): void {
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

    private static setSegmentColor(segments: d3.Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: Color[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length].toString());
    }
}