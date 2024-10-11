import { Line as ILine, SeriesPoint } from 'd3-shape';
import { BaseType, select, Selection } from 'd3-selection';
import { BlockMargin, Field, LineLikeChartSettings, Orient, TwoDimensionalChartModel } from "../../../model/model";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { MarkDot } from "../../features/markDots/markDot";
import { getStackedData, LineGeneratorFactory, onLineChartInit } from './lineHelper';
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';
import { MdtChartsDataRow } from '../../../config/config';
import { Transition } from 'd3-transition';
import { Pipeline } from '../../helpers/pipeline/Pipeline';

interface LineChartOptions {
    staticSettings: LineLikeChartSettings;
}

export class Line {
    public static readonly lineChartClass = 'line';

    readonly creatingPipeline = new Pipeline<Selection<SVGPathElement, any, BaseType, any>, TwoDimensionalChartModel>();

    private readonly lineChartClass = Line.lineChartClass; //TODO: remove after refactor

    public static get(options: LineChartOptions) {
        return new Line(options);
    }

    constructor(private options: LineChartOptions) {
        onLineChartInit(this.creatingPipeline);
    }

    public render(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        if (chart.isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart);
    }

    public update(block: Block, scales: Scales, newData: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): Promise<any>[] {
        let promises: Promise<any>[];
        if (chart.isSegmented) {
            promises = this.updateSegmented(block, scales, newData, keyField, margin, keyAxisOrient, chart);
        } else {
            promises = this.updateGrouped(block, scales, newData, keyField, margin, keyAxisOrient, chart);
        }
        return promises;
    }

    public updateColors(block: Block, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((_vf, valueIndex) => {
            const path = block.svg.getChartGroup(chart.index)
                .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueIndex}`);
            DomHelper.setChartStyle(path, chart.style, valueIndex, 'stroke');
            MarkDot.updateColors(block, chart, valueIndex);
        });
    }

    private renderGrouped(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        const generatorFactory = new LineGeneratorFactory({ keyAxisOrient, scales, keyFieldName: keyField.name, margin, curve: this.options.staticSettings.shape.curve.type, shouldRender: chart.lineViewOptions.renderForKey });
        chart.data.valueFields.forEach((valueField, valueIndex) => {
            const lineGenerator = generatorFactory.getLineGenerator(valueField.name);

            let path = block.svg.getChartGroup(chart.index)
                .append('path')
                .attr('d', lineGenerator(data))
                .attr('class', this.lineChartClass)
                .style('fill', 'none')
                .style('clip-path', `url(#${block.svg.getClipPathId()})`)
                .style('pointer-events', 'none');

            path = this.creatingPipeline.execute(path, chart);

            DomHelper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueIndex));
            DomHelper.setChartStyle(path, chart.style, valueIndex, 'stroke');

            MarkDot.render(block, data, keyAxisOrient, scales, margin, keyField.name, valueIndex, valueField.name, chart);
        });
    }

    private renderSegmented(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        let stackedData = getStackedData(data, chart);
        const generatorFactory = new LineGeneratorFactory({ keyAxisOrient, scales, keyFieldName: keyField.name, margin, curve: this.options.staticSettings.shape.curve.type, shouldRender: chart.lineViewOptions.renderForKey });
        const lineGenerator = generatorFactory.getSegmentedLineGenerator();

        let lines = block.svg.getChartGroup(chart.index)
            .selectAll(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData)
            .enter()
            .append('path')
            .attr('d', d => lineGenerator(d))
            .attr('class', this.lineChartClass)
            .style('fill', 'none')
            .style('clip-path', `url(#${block.svg.getClipPathId()})`)
            .style('pointer-events', 'none');

        lines = this.creatingPipeline.execute(lines, chart);

        lines.each(function (d, i) {
            DomHelper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });

        this.setSegmentColor(lines, chart.style.elementColors);

        stackedData.forEach((dataset, stackIndex) => {
            MarkDot.render(block, dataset, keyAxisOrient, scales, margin, keyField.name, stackIndex, '1', chart);
        });
    }

    private updateGrouped(block: Block, scales: Scales, newData: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): Promise<any>[] {
        const promises: Promise<any>[] = [];
        const generatorFactory = new LineGeneratorFactory({ keyAxisOrient, scales, keyFieldName: keyField.name, margin, curve: this.options.staticSettings.shape.curve.type, shouldRender: chart.lineViewOptions.renderForKey });
        chart.data.valueFields.forEach((valueField, valueFieldIndex) => {
            const lineGenerator = generatorFactory.getLineGenerator(valueField.name);

            const lineObject = block.svg.getChartGroup(chart.index)
                .select(`.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueFieldIndex}`);

            const prom = this.updateGroupedPath(block, lineObject, lineGenerator, newData);
            promises.push(prom);

            MarkDot.update(block, newData, keyAxisOrient, scales, margin, keyField.name, valueFieldIndex, valueField.name, chart);
        });
        return promises;
    }

    private updateSegmented(block: Block, scales: Scales, newData: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): Promise<any>[] {
        let stackedData = getStackedData(newData, chart);
        const generatorFactory = new LineGeneratorFactory({ keyAxisOrient, scales, keyFieldName: keyField.name, margin, curve: this.options.staticSettings.shape.curve.type, shouldRender: chart.lineViewOptions.renderForKey });
        const lineGenerator = generatorFactory.getSegmentedLineGenerator();
        const lines = block.svg.getChartGroup(chart.index)
            .selectAll<SVGPathElement, MdtChartsDataRow[]>(`path.${this.lineChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData);

        const prom = this.updateSegmentedPath(block, lines, lineGenerator);

        lines.each((dataset, index) => {
            MarkDot.update(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
        });
        return [prom];
    }

    private updateGroupedPath(block: Block, lineObject: Selection<BaseType, any, BaseType, any>, lineGenerator: ILine<MdtChartsDataRow>, newData: MdtChartsDataRow[]): Promise<any> {
        return new Promise(resolve => {
            if (lineObject.size() === 0) {
                resolve('');
                return;
            }

            let lineHandler: Selection<BaseType, any, BaseType, any> | Transition<BaseType, any, BaseType, any> = lineObject;
            if (block.transitionManager.durations.chartUpdate > 0)
                lineHandler = lineHandler.interrupt()
                    .transition()
                    .duration(block.transitionManager.durations.chartUpdate)
                    .on('end', () => resolve(''));

            lineHandler
                .attr('d', lineGenerator(newData));

            if (block.transitionManager.durations.chartUpdate <= 0)
                resolve('');
        });
    }

    private updateSegmentedPath(block: Block, linesObjects: Selection<BaseType, any, BaseType, any>, lineGenerator: ILine<MdtChartsDataRow>): Promise<any> {
        return new Promise(resolve => {
            if (linesObjects.size() === 0) {
                resolve('');
                return;
            }

            let linesHandler: Selection<BaseType, any, BaseType, any> | Transition<BaseType, any, BaseType, any> = linesObjects;
            if (block.transitionManager.durations.chartUpdate > 0)
                linesHandler = linesHandler.interrupt()
                    .transition()
                    .duration(block.transitionManager.durations.chartUpdate)
                    .on('end', () => resolve(''));

            linesHandler
                .attr('d', d => lineGenerator(d));

            if (block.transitionManager.durations.chartUpdate <= 0)
                resolve('');
        });
    }

    private setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: string[]): void {
        segments.style('stroke', (d, i) => colorPalette[i % colorPalette.length]);
    }
}