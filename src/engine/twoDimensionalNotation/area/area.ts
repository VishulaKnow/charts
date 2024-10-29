import { Area as IArea } from 'd3-shape';
import { BaseType, select, Selection } from 'd3-selection'
import {
    BlockMargin,
    Field,
    LineLikeChartSettings,
    Orient,
    TwoDimensionalChartModel,
    ValueField
} from "../../../model/model";
import { Scales } from "../../features/scale/scale";
import { Block } from "../../block/block";
import { MarkDot } from "../../features/markDots/markDot";
import { AreaGeneratorFactory } from './areaHelper';
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';
import { MdtChartsDataRow, Size } from '../../../config/config';
import { Transition } from 'd3-transition';
import { getStackedDataWithOwn } from '../bar/stackedData/dataStacker';
import { LineGeneratorFactory } from "../../../engine/twoDimensionalNotation/line/lineHelper";
import { Line } from "../../../engine/twoDimensionalNotation/line/line";

interface AreaOptions {
    staticSettings: LineLikeChartSettings;
}

export class Area {
    public static readonly areaChartClass = 'area';
    public static readonly areaBorderLineClass = 'area-border-line';

    public static get(options: AreaOptions) {
        return new Area(options);
    }

    constructor(private readonly options: AreaOptions) { }

    public render(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel, blockSize: Size): void {
        if (chart.isSegmented)
            this.renderSegmented(block, scales, data, keyField, margin, keyAxisOrient, chart);
        else
            this.renderGrouped(block, scales, data, keyField, margin, keyAxisOrient, chart);
    }

    public update(block: Block, scales: Scales, newData: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size): Promise<any>[] {
        let promises: Promise<any>[];
        if (chart.isSegmented) {
            promises = this.updateSegmented(block, scales, newData, keyField, margin, chart, keyAxisOrient);
        } else {
            promises = this.updateGrouped(block, scales, newData, keyField, margin, chart, keyAxisOrient, blockSize);
        }
        return promises;
    }

    public updateColors(block: Block, chart: TwoDimensionalChartModel): void {
        chart.data.valueFields.forEach((_vf, valueIndex) => {
            const chartGroup = block.svg.getChartGroup(chart.index);

            const areaPath = chartGroup
                .select(`.${Area.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueIndex}`);
            this.setChartFillStyle(chart, areaPath, valueIndex);

            if (chart.areaViewOptions.borderLine.on) {
                const borderLinePath = chartGroup
                    .select(`.${Area.areaBorderLineClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueIndex}`);
                DomHelper.setChartElementColor(borderLinePath, chart.style.elementColors, valueIndex, 'stroke');
            }

            MarkDot.updateColors(block, chart, valueIndex);
        });
    }

    private renderGrouped(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        const areaGeneratorFactory = this.createAreaGeneratorFactory(chart, scales, margin, keyAxisOrient, keyField);
        const lineGeneratorFactory = chart.areaViewOptions.borderLine.on
            && this.createLineGeneratorFactory(chart, scales, margin, keyAxisOrient, keyField);

        chart.data.valueFields.forEach((field, valueIndex) => {
            this.renderArea(areaGeneratorFactory, block, chart, data, field, valueIndex);
            if (lineGeneratorFactory)
                this.renderBorderLine(lineGeneratorFactory, block, chart, data, field, valueIndex);

            MarkDot.render(block, data, keyAxisOrient, scales, margin, keyField.name, valueIndex, field.name, chart);
        });
    }

    private renderSegmented(block: Block, scales: Scales, data: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, keyAxisOrient: Orient, chart: TwoDimensionalChartModel): void {
        const stackedData = getStackedDataWithOwn(data, chart.data.valueFields.map(field => field.name));
        const areaGeneratorFactory = this.createAreaGeneratorFactory(chart, scales, margin, keyAxisOrient, keyField);

        const areaGenerator = areaGeneratorFactory.getSegmentedAreaGenerator();

        const areas = block.svg.getChartGroup(chart.index)
            .selectAll(`.${Area.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData)
            .enter()
            .append('path')
            .attr('d', d => areaGenerator(d))
            .attr('class', Area.areaChartClass)
            .style('clip-path', `url(#${block.svg.getClipPathId()})`)
            .style('pointer-events', 'none');

        areas.each(function (d, i) {
            DomHelper.setCssClasses(select(this), Helper.getCssClassesWithElementIndex(chart.cssClasses, i));
        });

        this.setSegmentColor(areas, chart.style.elementColors);

        stackedData.forEach((dataset, index) => {
            MarkDot.render(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
        });
    }

    private updateGrouped(block: Block, scales: Scales, newData: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient, blockSize: Size): Promise<any>[] {
        const promises: Promise<any>[] = [];

        const areaGeneratorFactory = this.createAreaGeneratorFactory(chart, scales, margin, keyAxisOrient, keyField);
        const lineGeneratorFactory = chart.areaViewOptions.borderLine.on
            && this.createLineGeneratorFactory(chart, scales, margin, keyAxisOrient, keyField);

        chart.data.valueFields.forEach((field, valueIndex) => {
            const chartGroup = block.svg.getChartGroup(chart.index);

            const areaProm = this.updateArea(areaGeneratorFactory, chartGroup, block, field, chart, newData, valueIndex);
            promises.push(areaProm);

            if (lineGeneratorFactory) {
                const lineProm = this.updateBorderLine(lineGeneratorFactory, chartGroup, block, field, chart, newData, valueIndex);
                promises.push(lineProm);
            }

            MarkDot.update(block, newData, keyAxisOrient, scales, margin, keyField.name, valueIndex, field.name, chart);
        });
        return promises;
    }

    private updateSegmented(block: Block, scales: Scales, newData: MdtChartsDataRow[], keyField: Field, margin: BlockMargin, chart: TwoDimensionalChartModel, keyAxisOrient: Orient): Promise<any>[] {
        const stackedData = getStackedDataWithOwn(newData, chart.data.valueFields.map(field => field.name));
        const generatorFactory = this.createAreaGeneratorFactory(chart, scales, margin, keyAxisOrient, keyField);

        const areaGenerator = generatorFactory.getSegmentedAreaGenerator();
        const areas = block.svg.getChartGroup(chart.index)
            .selectAll<SVGRectElement, MdtChartsDataRow[]>(`path.${Area.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}`)
            .data(stackedData);

        const prom = this.updateSegmentedPath(block, areas, areaGenerator);

        areas.each((dataset, index) => {
            // '1' - атрибут, показывающий координаты согласно полю значения
            MarkDot.update(block, dataset, keyAxisOrient, scales, margin, keyField.name, index, '1', chart);
        });
        return [prom];
    }

    private updateGroupedPath(block: Block, areaObject: Selection<BaseType, any, BaseType, any>, areaGenerator: IArea<MdtChartsDataRow>, newData: MdtChartsDataRow[]): Promise<any> {
        return new Promise(resolve => {
            if (areaObject.size() === 0) {
                resolve('');
                return;
            }

            let areaHandler: Selection<BaseType, any, BaseType, any> | Transition<BaseType, any, BaseType, any> = areaObject;

            if (block.transitionManager.durations.chartUpdate > 0)
                areaHandler = areaHandler.interrupt()
                    .transition()
                    .duration(block.transitionManager.durations.chartUpdate)
                    .on('end', () => resolve(''));

            areaHandler
                .attr('d', areaGenerator(newData));

            if (block.transitionManager.durations.chartUpdate <= 0)
                resolve('');
        });
    }

    private updateSegmentedPath(block: Block, areasObjects: Selection<BaseType, any, BaseType, any>, areaGenerator: IArea<MdtChartsDataRow>): Promise<any> {
        return new Promise(resolve => {
            if (areasObjects.size() === 0) {
                resolve('');
                return;
            }

            let areaHandler: Selection<BaseType, any, BaseType, any> | Transition<BaseType, any, BaseType, any> = areasObjects;

            if (block.transitionManager.durations.chartUpdate > 0)
                areaHandler = areaHandler.interrupt()
                    .transition()
                    .duration(block.transitionManager.durations.chartUpdate)
                    .on('end', () => resolve(''));

            areaHandler
                .attr('d', d => areaGenerator(d));

            if (block.transitionManager.durations.chartUpdate <= 0)
                resolve('');
        });
    }

    private setSegmentColor(segments: Selection<SVGGElement, unknown, SVGGElement, unknown>, colorPalette: string[]): void {
        segments.style('fill', (d, i) => colorPalette[i % colorPalette.length]);
    }

    private setChartFillStyle(chart: TwoDimensionalChartModel, path: Selection<BaseType, unknown, BaseType, unknown>, valueIndex: number): void {
        if (chart.areaViewOptions.fill.type === 'gradient')
            DomHelper.setChartGradientStyle(path, chart.index, valueIndex)
        else
            DomHelper.setChartStyle(path, chart.style, valueIndex, 'fill');
    }

    private createAreaGeneratorFactory(chart: TwoDimensionalChartModel, scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, keyField: Field): AreaGeneratorFactory {
        return new AreaGeneratorFactory({ keyAxisOrient, scales, keyFieldName: keyField.name, margin, shouldRender: chart.lineLikeViewOptions.renderForKey, curve: this.options.staticSettings.shape.curve.type });
    }

    private createLineGeneratorFactory(chart: TwoDimensionalChartModel, scales: Scales, margin: BlockMargin, keyAxisOrient: Orient, keyField: Field): LineGeneratorFactory {
        return new LineGeneratorFactory({ keyAxisOrient, scales, keyFieldName: keyField.name, margin, shouldRender: chart.lineLikeViewOptions.renderForKey, curve: this.options.staticSettings.shape.curve.type });
    }

    private renderArea(areaGeneratorFactory: AreaGeneratorFactory, block: Block, chart: TwoDimensionalChartModel, data: MdtChartsDataRow[], field: ValueField, valueIndex: number) {

        const area = areaGeneratorFactory.getAreaGenerator(field.name);
        const path = block.svg.getChartGroup(chart.index)
            .append('path')
            .attr('d', area(data))
            .attr('class', Area.areaChartClass)
            .style('clip-path', `url(#${block.svg.getClipPathId()})`)
            .style('pointer-events', 'none');

        DomHelper.setCssClasses(path, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueIndex));
        this.setChartFillStyle(chart, path, valueIndex)
    }

    private renderBorderLine(lineGeneratorFactory: LineGeneratorFactory, block: Block, chart: TwoDimensionalChartModel, data: MdtChartsDataRow[], field: ValueField, valueIndex: number) {
        const lineGenerator = lineGeneratorFactory.getLineGenerator(field.name);

        const linePath = block.svg.getChartGroup(chart.index)
            .append('path')
            .attr('d', lineGenerator(data))
            .attr('class', `${Area.areaBorderLineClass}`)
            .style('fill', 'none')
            .style('clip-path', `url(#${block.svg.getClipPathId()})`)
            .style('pointer-events', 'none');

        DomHelper.setCssClasses(linePath, Helper.getCssClassesWithElementIndex(chart.cssClasses, valueIndex));
        DomHelper.setChartStyle(linePath, chart.areaViewOptions.borderLine.colorStyle, valueIndex, 'stroke');
    }

    private updateArea(areaGeneratorFactory: AreaGeneratorFactory, chartGroup: Selection<SVGGElement, any, BaseType, any>, block: Block, field: Field, chart: TwoDimensionalChartModel, newData: MdtChartsDataRow[], valueIndex: number): Promise<any> {
        const areaGenerator = areaGeneratorFactory.getAreaGenerator(field.name);
        const areaObject = chartGroup
            .select(`.${Area.areaChartClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueIndex}`);

        return this.updateGroupedPath(block, areaObject, areaGenerator, newData);
    }

    private updateBorderLine(lineGeneratorFactory: LineGeneratorFactory, chartGroup: Selection<SVGGElement, any, BaseType, any>, block: Block, field: Field, chart: TwoDimensionalChartModel, newData: MdtChartsDataRow[], valueIndex: number) {
        const borderLineGenerator = lineGeneratorFactory.getLineGenerator(field.name);
        const borderLineObject = chartGroup
            .select(`.${Area.areaBorderLineClass}${Helper.getCssClassesLine(chart.cssClasses)}.chart-element-${valueIndex}`);

        return Line.updateGroupedPath(block, borderLineObject, borderLineGenerator, newData);
    }
}