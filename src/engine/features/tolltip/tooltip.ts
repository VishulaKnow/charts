import { select, Selection, BaseType } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, DataRow, DataSource, IntervalChartModel, Model, OptionsModelData, PolarChartModel, Size, TwoDimensionalChartModel } from "../../../model/model";
import { Helper } from "../../helper";
import { Block } from "../../block/block";
import { ARROW_DEFAULT_POSITION, ARROW_SIZE, BarHighlighterAttrs, ChartStyleSettings, DotEdgingAttrs, TooltipCoordinate, TooltipHelper } from "./tooltipHelper";
import { Donut } from "../../polarNotation/donut";
import { Bar } from "../../twoDimensionalNotation/bar/bar";
import { Dot } from "../lineDots/dot";
import { ChartOrientation } from "../../../config/config";

export class Tooltip {
    private static tooltipWrapperClass = 'tooltip-wrapper';
    private static tooltipContentClass = 'tooltip-content';
    private static tooltipBlockClass = 'tooltip-block';
    private static tooltipArrowClass = 'tooltip-arrow';

    public static renderTooltips(block: Block, model: Model, data: DataSource): void {
        this.renderTooltipWrapper(block);
        const chartsWithTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel) => chart.tooltip.show);
        if (chartsWithTooltipIndex !== -1) {
            if (model.options.type === '2d') {
                this.rednerTooltipFor2DCharts(block, model.chartBlock.margin, model.options.charts, data, model.options.data, model.blockCanvas.size, model.options.orient);
            } else if (model.options.type === 'polar') {
                this.renderTooltipsForDonut(block, model.options.charts, data, model.options.data, model.blockCanvas.size, model.chartBlock.margin, Donut.getThickness(model.chartSettings.donut, model.blockCanvas.size, model.chartBlock.margin));
            } else if (model.options.type === 'interval') {
                this.renderTooltipsForInterval(block, model.options.charts, data, model.options.data, model.blockCanvas.size, model.options.orient);
            }
        }
    }

    private static rednerTooltipFor2DCharts(block: Block, margin: BlockMargin, charts: TwoDimensionalChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, chartOrientation: ChartOrientation): void {
        charts.forEach(chart => {
            if (chart.type === 'bar') {
                this.renderTooltipForBars(block, Bar.getAllBarItems(block, chart.cssClasses), data, dataOptions, chart, chartOrientation, blockSize, margin, charts.map(ch => TooltipHelper.getChartStyleSettings(ch)));
            } else if (chart.type === 'line' || chart.type === 'area') {
                this.renderTooltipForDots(block, Dot.getAllDots(block, chart.cssClasses), data, dataOptions, chart, blockSize, charts.map(ch => TooltipHelper.getChartStyleSettings(ch)));
            }
        });
    }

    private static renderTooltipsForDonut(block: Block, charts: PolarChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, margin: BlockMargin, chartThickness: number): void {
        charts.forEach(chart => {
            const attrTransform = block.getSvg().select(`.${Donut.donutBlockClass}`).attr('transform');
            const translateNumbers = Helper.getTranslateNumbers(attrTransform);
            const translateX = translateNumbers[0];
            const translateY = translateNumbers[1];

            const arcItems = Donut.getAllArcs(block);
            this.renderTooltipForDonut(block, arcItems, data, dataOptions, chart, blockSize, margin, chartThickness, translateX, translateY);
        });
    }

    private static renderTooltipsForInterval(block: Block, charts: IntervalChartModel[], data: DataSource, dataOptions: OptionsModelData, blockSize: Size, chartOrientation: ChartOrientation): void {
        charts.forEach(chart => {
            const bars = block.getSvg()
                .selectAll(`rect${Helper.getCssClassesLine(chart.cssClasses)}`);
            this.renderTooltipForGantt(block, bars, data, dataOptions, chart, chartOrientation, blockSize);
        });
    }

    private static renderTooltipForDots(block: Block, elemets: Selection<BaseType, DataRow, BaseType, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: TwoDimensionalChartModel, blockSize: Size, chartsStyleSettings: ChartStyleSettings[]): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        const otherChartsElements = TooltipHelper.getOtherChartsElements(block, chart.index, chartsStyleSettings.map(chart => chart.cssClasses));

        elemets
            .on('mouseover', function (_event, d) {
                thisClass.showTooltipBlock(tooltipBlock);
                const keyValue = TooltipHelper.getKeyForTooltip(d, dataOptions.keyField.name, chart.isSegmented);
                const index = TooltipHelper.getElementIndex(elemets, this, keyValue, dataOptions.keyField.name, chart.isSegmented)
                TooltipHelper.fillTooltipFor2DChart(tooltipContent, chart, data, dataOptions, keyValue, index);

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinateByDot(select(this), tooltipBlock, blockSize, tooltipArrow);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                const dotsEdgingAttrs = TooltipHelper.getDotEdgingAttrs(select(this));
                thisClass.renderDotsEdging(block, dotsEdgingAttrs, chart.style.elementColors[index].toString());

                TooltipHelper.setElementsSemiOpacity(otherChartsElements);
            });

        elemets.on('mouseleave', function () {
            thisClass.hideTooltipBlock(tooltipBlock);
            thisClass.removeDotsEdging(block);
            TooltipHelper.setOtherChartsElementsDefaultOpacity(otherChartsElements, chartsStyleSettings);
        });
    }

    private static renderTooltipForBars(block: Block, elemets: Selection<BaseType, DataRow, BaseType, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: TwoDimensionalChartModel, chartOrientation: ChartOrientation, blockSize: Size, margin: BlockMargin, chartsStyleSettings: ChartStyleSettings[]): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);

        const thisClass = this;

        let isGrouped: boolean;
        if (chartOrientation === 'vertical')
            isGrouped = parseFloat(elemets.attr('width')) < 10; // grouping bar by one bar width
        else
            isGrouped = parseFloat(elemets.attr('height')) < 10;

        const otherChartsElements = TooltipHelper.getOtherChartsElements(block, chart.index, chartsStyleSettings.map(ch => ch.cssClasses));

        let barHighlighter: Selection<SVGRectElement, unknown, HTMLElement, any>; // серая линия, проходящая от начала бара до конца чарт-блока

        elemets
            .on('mouseover', function (_event, dataRow) {
                thisClass.showTooltipBlock(tooltipBlock);
                const keyValue = TooltipHelper.getKeyForTooltip(dataRow, dataOptions.keyField.name, chart.isSegmented);

                if (isGrouped) {
                    TooltipHelper.fillMultyFor2DChart(tooltipContent, chart, data, dataOptions, keyValue)
                } else {
                    const index = TooltipHelper.getElementIndex(elemets, this, keyValue, dataOptions.keyField.name, chart.isSegmented)
                    TooltipHelper.fillTooltipFor2DChart(tooltipContent, chart, data, dataOptions, keyValue, index);
                }

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinateByRect(select(this), tooltipBlock, blockSize, tooltipArrow, chartOrientation);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                TooltipHelper.setElementsSemiOpacity(otherChartsElements);

                const highlighterAttrs = TooltipHelper.getBarHighlighterAttrs(select(this), chartOrientation, blockSize, margin);
                barHighlighter = thisClass.renderBarHighlighter(block, highlighterAttrs);
            });

        elemets.on('mouseleave', function () {
            thisClass.hideTooltipBlock(tooltipBlock);
            TooltipHelper.setElementsFullOpacity(elemets);
            TooltipHelper.setOtherChartsElementsDefaultOpacity(otherChartsElements, chartsStyleSettings);
            barHighlighter.remove();
        });
    }

    private static renderTooltipForDonut(block: Block, elemets: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: PolarChartModel, blockSize: Size, margin: BlockMargin, donutThickness: number, translateX: number = 0, translateY: number = 0): void {
        const tooltipBlock = this.renderTooltipBlock(block, translateX, translateY);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        const filter = block.renderDefs()
            .append('filter')
            .attr('id', 'shadow')
            .attr('width', '300%')
            .attr('height', '300%')
            .attr('x', '-100%')
            .attr('y', '-100%')
            .style('outline', '1px solid red');

        filter.append('feDropShadow')
            .attr('dx', 0)
            .attr('dy', 0)
            .attr('flood-color', 'rgba(0, 0, 0, 0.15)')
            .attr('stdDeviation', 20);

        let clone: Selection<BaseType, unknown, BaseType, unknown>;

        elemets
            .on('mouseover', function (_event, dataRow) {
                thisClass.showTooltipBlock(tooltipBlock);
                const key = dataRow.data[dataOptions.keyField.name];
                TooltipHelper.fillTooltipForPolarChart(tooltipContent, chart, data, dataOptions, key, select(this).select('path').style('fill'))

                const coordinatePointer: [number, number] = TooltipHelper.getRecalcedCoordinateByArrow(Donut.getArcCentroid(blockSize, margin, dataRow, donutThickness), tooltipBlock, blockSize, tooltipArrow, translateX, translateY);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                // Выделение выбранного сегмента с помощью тени. Для этого создается копия сегмента, которая отображает поверх оригинального
                // Оригинальный сегмент на оргинальный сегмент вешается фильтр, который преобразовывает его в тень.
                clone = select(this).clone();
                select(this).style('filter', 'url(#shadow)');

                // Задание прозрачности всем сегментам, кроме выделенного
                // TooltipHelper.setElementsSemiOpacity(elemets.filter(d => d.data[dataOptions.keyField.name] !== key));

                // Выезд сегмента наружу
                // select<SVGGElement, PieArcDatum<DataRow>>(this)
                //     .select('path')
                //     .attr('d', (d, i) => Donut.getArcGeneratorObject(blockSize, margin, donutThickness)
                //         .outerRadius(Donut.getOuterRadius(margin, blockSize) + 5)
                //         .innerRadius(Donut.getOuterRadius(margin, blockSize) - donutThickness + 5)
                //         .padAngle(0.025)(d, i));
            });

        elemets.on('mouseleave', function () {
            thisClass.hideTooltipBlock(tooltipBlock);
            TooltipHelper.setElementsFullOpacity(elemets);
            select(this) // удаление тени с оригинального сегмента
                .style('filter', null);
            clone.remove(); // удаление клона
        });
    }

    private static renderTooltipForGantt(block: Block, elemets: Selection<BaseType, DataRow, BaseType, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: IntervalChartModel, chartOrientation: ChartOrientation, blockSize: Size): void {
        const tooltipBlock = this.renderTooltipBlock(block);
        const tooltipContent = this.renderTooltipContentBlock(tooltipBlock);
        const tooltipArrow = this.renderTooltipArrow(tooltipBlock);
        const thisClass = this;

        elemets
            .on('mouseover', function (_event, dataRow) {
                thisClass.showTooltipBlock(tooltipBlock);
                const key = TooltipHelper.getKeyForTooltip(dataRow, dataOptions.keyField.name, false);
                TooltipHelper.fillTooltipForIntervalChart(tooltipContent, chart, data, dataOptions, key, select(this).style('fill'))

                const coordinatePointer: [number, number] = TooltipHelper.getTooltipBlockCoordinateByRect(select(this), tooltipBlock, blockSize, tooltipArrow, chartOrientation);
                const tooltipCoordinate = TooltipHelper.getTooltipCoordinate(coordinatePointer);
                thisClass.setTooltipCoordinate(tooltipBlock, tooltipCoordinate);

                TooltipHelper.setElementsSemiOpacity(TooltipHelper.getFilteredElements(elemets, dataOptions.keyField.name, key, false));
            });

        elemets.on('mouseleave', function () {
            thisClass.hideTooltipBlock(tooltipBlock);
            TooltipHelper.setElementsFullOpacity(elemets);
        });
    }

    private static renderTooltipWrapper(block: Block): void {
        let tooltipWrapper = block.getWrapper()
            .select(`.${this.tooltipWrapperClass}`)

        if(tooltipWrapper.empty())
            block.getWrapper()
                .append('div')
                .attr('class', this.tooltipWrapperClass);
    }

    private static renderTooltipArrow(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): Selection<BaseType, unknown, HTMLElement, any> {
        let tooltipArrow = tooltipBlock.select(`.${this.tooltipArrowClass}`);
        if (tooltipArrow.empty())
            tooltipArrow = tooltipBlock
                .append('div')
                .attr('class', this.tooltipArrowClass)
                .style('position', 'absolute')
                .style('left', `${ARROW_DEFAULT_POSITION}px`)
                .style('bottom', '-6px')
                .style('width', `${ARROW_SIZE}px`)
                .style('height', `${ARROW_SIZE}px`);

        return tooltipArrow;
    }

    private static renderTooltipBlock(block: Block, translateX: number = 0, translateY: number = 0): Selection<BaseType, unknown, HTMLElement, any> {
        const wrapper = block.getWrapper().select(`.${this.tooltipWrapperClass}`);

        let tooltipBlock = wrapper.select(`.${this.tooltipBlockClass}`);
        if (tooltipBlock.empty()) {
            tooltipBlock = wrapper
                .append('div')
                .attr('class', this.tooltipBlockClass)
                .style('position', 'absolute')
                .style('display', 'none');
        }

        if (translateX !== 0 || translateY !== 0)
            tooltipBlock.style('transform', `translate(${translateX}px, ${translateY}px)`);

        return tooltipBlock;
    }

    private static renderTooltipContentBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): Selection<HTMLDivElement, unknown, HTMLElement, any> {
        let tooltipContentBlock = tooltipBlock.select<HTMLDivElement>(`div.${this.tooltipContentClass}`);

        if (tooltipContentBlock.empty())
            tooltipContentBlock = tooltipBlock.append('div')
                .attr('class', this.tooltipContentClass);

        return tooltipContentBlock;
    }

    private static setTooltipCoordinate(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>, tooltipCoordinate: TooltipCoordinate): void {
        tooltipBlock
            .style('left', tooltipCoordinate.left)
            .style('top', tooltipCoordinate.top)
            .style('right', tooltipCoordinate.right)
            .style('bottom', tooltipCoordinate.bottom);
    }

    private static renderDotsEdging(block: Block, attrs: DotEdgingAttrs, color: string): void {
        block.getChartBlock()
            .insert('circle', `.${Dot.dotClass}`)
            .attr('class', 'dot-edging-internal')
            .attr('cx', attrs.cx)
            .attr('cy', attrs.cy)
            .attr('r', 10.5)
            .style('opacity', 0.4)
            .style('fill', color)
            .style('pointer-events', 'none');

        block.getChartBlock()
            .insert('circle', `.${Dot.dotClass}`)
            .attr('class', 'dot-edging-external')
            .attr('cx', attrs.cx)
            .attr('cy', attrs.cy)
            .attr('r', 15.5)
            .style('opacity', 0.2)
            .style('fill', color)
            .style('pointer-events', 'none');
    }

    private static removeDotsEdging(block: Block): void {
        block.getChartBlock()
            .selectAll('.dot-edging-external, .dot-edging-internal')
            .remove();
    }

    private static renderBarHighlighter(block: Block, barAttrs: BarHighlighterAttrs): Selection<SVGRectElement, unknown, HTMLElement, any> {
        const barHighlighter = block.getChartBlock()
            .append('rect')
            .attr('class', 'bar-highlighter')
            .attr('x', barAttrs.x)
            .attr('y', barAttrs.y)
            .attr('width', barAttrs.width)
            .attr('height', barAttrs.height)
            .style('fill', '#8a8a8a')
            .style('pointer-events', 'none')
            .style('opacity', 0.2)
            .lower();

        return barHighlighter;
    }

    private static showTooltipBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): void {
        tooltipBlock.style('display', 'block');
    }

    private static hideTooltipBlock(tooltipBlock: Selection<BaseType, unknown, HTMLElement, any>): void {
        tooltipBlock.style('display', 'none');
    }
}