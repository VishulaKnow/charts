import { select, Selection, pointer, BaseType, } from 'd3-selection';
import { PieArcDatum } from 'd3-shape'
import { BlockMargin, IntervalChartModel, Model, OptionsModelData, Orient, PolarChartModel, PolarOptionsModel, ScaleKeyModel, TwoDimensionalChartModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { TooltipDomHelper } from "./tooltipDomHelper";
import { Donut } from "../../polarNotation/donut/donut";
import { ChartOrientation, DataRow, DataSource, Size, TooltipOptions } from "../../../config/config";
import { Scales } from '../scale/scale';
import { TooltipComponentsManager } from './tooltipComponentsManager';
import { ElementHighlighter } from '../../elementHighlighter/elementHighlighter';
import { DonutHelper } from '../../polarNotation/donut/DonutHelper';
import { TipBox } from '../tipBox/tipBox';
import { TipBoxHelper } from '../tipBox/tipBoxHelper';
import { Helper } from '../../helpers/helper';
import { TooltipHelper } from './tooltipHelper';
import { TooltipSettings } from '../../../designer/designerConfig';

interface OverDetails {
    pointer: [number, number];
    ignoreTranslate?: boolean;
}

interface TooltipTranslate {
    x: number;
    y: number;
}

export class Tooltip {
    public static readonly tooltipBlockClass = 'tooltip-block';
    public static readonly tooltipLineClass = 'tooltip-line';
    public static readonly tooltipWrapperClass = 'tooltip-wrapper';
    public static readonly tooltipContentClass = 'tooltip-content';
    public static readonly tooltipArrowClass = 'tooltip-arrow';

    public static render(block: Block, model: Model, data: DataSource, tooltipOptions: TooltipSettings, scales?: Scales): void {
        TooltipComponentsManager.renderTooltipWrapper(block);
        const withTooltipIndex = model.options.charts.findIndex((chart: TwoDimensionalChartModel | PolarChartModel | IntervalChartModel) => chart.tooltip.show);
        if (withTooltipIndex !== -1) {
            if (model.options.type === '2d') {
                this.renderTooltipFor2DCharts(block, data, model.blockCanvas.size, model.chartBlock.margin, scales, model.options, tooltipOptions);
            } else if (model.options.type === 'polar') {
                this.renderTooltipForPolar(block,
                    model.options,
                    data,
                    model.blockCanvas.size,
                    model.chartBlock.margin,
                    DonutHelper.getThickness(model.chartSettings.donut, model.blockCanvas.size, model.chartBlock.margin),
                    model.otherComponents.tooltipBlock);
            }
        }
    }

    public static hide(block: Block): void {
        TooltipComponentsManager.hideComponent(block.getWrapper().select(`.${this.tooltipBlockClass}`));
    }

    private static renderTooltipFor2DCharts(block: Block, data: DataSource, blockSize: Size, margin: BlockMargin, scales: Scales, options: TwoDimensionalOptionsModel, tooltipOptions: TooltipSettings): void {
        if (scales.key.domain().length === 0)
            return;

        this.renderLineTooltip(block, scales, margin, blockSize, options.charts, options.orient, options.axis.key.orient, data, options.data, options.scale.key, tooltipOptions, options.tooltip);
    }

    private static renderTooltipForPolar(block: Block, options: PolarOptionsModel, data: DataSource, blockSize: Size, margin: BlockMargin, chartThickness: number, tooltipOptions: TooltipSettings): void {
        const attrTransform = block.getSvg().select(`.${Donut.donutBlockClass}`).attr('transform');
        const translateNums = Helper.getTranslateNumbers(attrTransform);
        const arcItems = Donut.getAllArcGroups(block);
        this.renderTooltipForDonut(block, arcItems, data, options.data, options.charts[0], blockSize, margin, chartThickness, tooltipOptions, options.tooltip, { x: translateNums[0], y: translateNums[1] });
    }

    private static renderLineTooltip(block: Block, scales: Scales, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], chartOrientation: ChartOrientation, keyAxisOrient: Orient, data: DataSource, dataOptions: OptionsModelData, scaleKeyModel: ScaleKeyModel, tooltipSettings: TooltipSettings, tooltipOptions: TooltipOptions): void {
        const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block);
        const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);
        const tooltipLine = TooltipComponentsManager.renderTooltipLine(block);
        const tipBox = TipBox.renderOrGet(block, margin, blockSize);
        ElementHighlighter.renderShadowFilter(block);

        let currentKey: string = null;
        tipBox.on('mousemove', function (e) {
            const keyValue = TipBoxHelper.getKeyValueByPointer(pointer(e, this), chartOrientation, margin, blockSize, scales.key, scaleKeyModel.type, 'hover');

            if (tooltipSettings.position === 'followCursor') {
                const tooltipCoordinate = TooltipHelper.getTooltipCursorCoordinate(pointer(e, this), block.getSvg().node().getBoundingClientRect(), tooltipContent.node().getBoundingClientRect(), window.innerWidth, window.innerHeight);
                TooltipComponentsManager.setLineTooltipCoordinate(tooltipBlock, tooltipCoordinate, chartOrientation, 0);
            }

            if (!currentKey || currentKey !== keyValue) {
                currentKey = keyValue;
                TooltipComponentsManager.showComponent(tooltipBlock);
                TooltipDomHelper.fillForMulty2DCharts(tooltipContent, charts.filter(ch => ch.tooltip.show), data, dataOptions, keyValue, tooltipOptions?.html);

                if (tooltipSettings.position === 'fixed') {
                    const tooltipCoordinate = TooltipHelper.getTooltipFixedCoordinate(scales.key, margin, keyValue, block.getSvg().node().getBoundingClientRect(), tooltipContent.node().getBoundingClientRect(), keyAxisOrient, window.innerWidth, window.innerHeight);
                    TooltipComponentsManager.setLineTooltipCoordinate(tooltipBlock, tooltipCoordinate, chartOrientation, block.transitionManager.durations.tooltipSlide);
                }

                const tooltipLineAttributes = TooltipHelper.getTooltipLineAttributes(scales.key, margin, keyValue, chartOrientation, blockSize);
                TooltipComponentsManager.setTooltipLineAttributes(tooltipLine, tooltipLineAttributes, block.transitionManager.durations.tooltipSlide);
                TooltipComponentsManager.showComponent(tooltipLine);

                ElementHighlighter.highlight2DElementsHover(block, dataOptions.keyField.name, keyValue, charts, block.transitionManager.durations.markerHover);
            }
        })

        tipBox.on('mouseleave', function () {
            TooltipComponentsManager.hideComponent(tooltipBlock);
            TooltipComponentsManager.hideComponent(tooltipLine);
            ElementHighlighter.removeUnselected2DHighlight(block, dataOptions.keyField.name, charts, block.transitionManager.durations.markerHover);
            currentKey = null;
        });
    }

    private static renderTooltipForDonut(block: Block, elements: Selection<SVGGElement, PieArcDatum<DataRow>, SVGGElement, unknown>, data: DataSource, dataOptions: OptionsModelData, chart: PolarChartModel, blockSize: Size, margin: BlockMargin, donutThickness: number, tooltipSettings: TooltipSettings, tooltipOptions: TooltipOptions, translate: TooltipTranslate): void {
        const tooltipBlock = TooltipComponentsManager.renderTooltipBlock(block);
        const tooltipContent = TooltipComponentsManager.renderTooltipContentBlock(tooltipBlock);
        let tooltipArrow: Selection<BaseType, unknown, HTMLElement, any>;
        if (tooltipSettings.position === 'fixed')
            tooltipArrow = TooltipComponentsManager.renderTooltipArrow(tooltipBlock);

        if (tooltipSettings.position === 'followCursor') {
            elements.on('mousemove', function (e: CustomEvent<OverDetails>) {
                const pointerCoordinate = !pointer(e, block.getSvg().node())[0] ? e.detail.pointer : pointer(e, block.getSvg().node());
                const tooltipCoordinate = TooltipHelper.getTooltipCursorCoordinate(pointerCoordinate, block.getSvg().node().getBoundingClientRect(), tooltipContent.node().getBoundingClientRect(), window.innerWidth, window.innerHeight);
                TooltipComponentsManager.setBlockCoordinate(tooltipBlock, tooltipCoordinate);
            });
        }

        elements.on('mouseover', function (e, dataRow: PieArcDatum<DataRow>) {
            TooltipComponentsManager.showComponent(tooltipBlock);
            TooltipDomHelper.fillForPolarChart(tooltipContent, chart, data, dataOptions, dataRow.data[dataOptions.keyField.name], select(this).select('path').style('fill'), tooltipOptions?.html)

            if (tooltipSettings.position === 'fixed') {
                const coordinatePointer = TooltipDomHelper.getRecalcedCoordinateByArrow(DonutHelper.getArcCentroid(blockSize, margin, dataRow, donutThickness), tooltipBlock, blockSize, tooltipArrow, translate.x, translate.y);
                coordinatePointer[0] = coordinatePointer[0] + translate.x;
                coordinatePointer[1] = coordinatePointer[1] + translate.y;
                const tooltipCoordinate = TooltipHelper.getCoordinateByPointer(coordinatePointer);
                TooltipComponentsManager.setBlockCoordinate(tooltipBlock, tooltipCoordinate);
            }

            ElementHighlighter.toggleActivityStyle(select(this), true);
            const clones = Donut.getAllArcClones(block)
                .filter((d: PieArcDatum<DataRow>) => d.data[dataOptions.keyField.name] === dataRow.data[dataOptions.keyField.name]);
            if (clones.nodes().length === 0 && (block.filterEventManager.getSelectedKeys().length === 0 || block.filterEventManager.isSelected(dataRow.data[dataOptions.keyField.name]))) {
                ElementHighlighter.renderArcCloneAndHighlight(block, margin, select(this), blockSize, donutThickness);
            }
        });

        elements.on('mouseleave', function (e, dataRow: PieArcDatum<DataRow>) {
            TooltipComponentsManager.hideComponent(tooltipBlock);
            if (!block.filterEventManager.isSelected(dataRow.data[dataOptions.keyField.name])) {
                ElementHighlighter.removeCloneForElem(block, dataOptions.keyField.name, select(this));
                ElementHighlighter.toggleDonutHighlightState(select(this), margin, blockSize, donutThickness, block.transitionManager.durations.donutHover, false);
                if (block.filterEventManager.getSelectedKeys().length > 0) {
                    ElementHighlighter.toggleActivityStyle(select(this), false);
                }
            }
        });
    }
}