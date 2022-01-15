import { AxisPosition, ChartOrientation, DataOptions, MdtChartsDataSource, DiscreteAxisOptions, NumberAxisOptions, TwoDimensionalChart } from "../../config/config";
import { AxisLabelPosition, AxisModelOptions, Orient } from "../model";
import { ModelHelper } from "../modelHelper";
import { AxisType, CLASSES } from "../modelBuilder";
import { DataManagerModel } from "../dataManagerModel/dataManagerModel";
import { TwoDimensionalModel } from "../notations/twoDimensionalModel";
import { AxisLabelCanvas, TooltipSettings } from "../../designer/designerConfig";
import { CanvasModel } from "../modelInstance/canvasModel/canvasModel";

export interface LabelSize {
    width: number;
    height: number
}

export class AxisModel {
    public static getKeyAxis(charts: TwoDimensionalChart[], data: MdtChartsDataSource, dataOptions: DataOptions, orient: ChartOrientation, axisConfig: DiscreteAxisOptions, labelConfig: AxisLabelCanvas, canvasModel: CanvasModel, tooltipSettings: TooltipSettings): AxisModelOptions {
        return {
            type: 'key',
            orient: AxisModel.getAxisOrient(AxisType.Key, orient, axisConfig.position),
            translate: {
                translateX: AxisModel.getAxisTranslateX(AxisType.Key, orient, axisConfig.position, canvasModel),
                translateY: AxisModel.getAxisTranslateY(AxisType.Key, orient, axisConfig.position, canvasModel)
            },
            cssClass: 'key-axis',
            ticks: axisConfig.ticks,
            labels: {
                maxSize: AxisModel.getLabelSize(labelConfig.maxSize.main, data[dataOptions.dataSource].map(d => d[dataOptions.keyField.name])).width,
                position: AxisModel.getKeyAxisLabelPosition(canvasModel, DataManagerModel.getDataValuesByKeyField(data, dataOptions.dataSource, dataOptions.keyField.name).length),
                visible: !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(charts, orient),
                defaultTooltip: tooltipSettings.position === 'fixed'
            },
            visibility: axisConfig.visibility
        }
    }

    public static getValueAxis(orient: ChartOrientation, axisConfig: NumberAxisOptions, labelConfig: AxisLabelCanvas, canvasModel: CanvasModel): AxisModelOptions {
        return {
            type: 'value',
            orient: AxisModel.getAxisOrient(AxisType.Value, orient, axisConfig.position),
            translate: {
                translateX: AxisModel.getAxisTranslateX(AxisType.Value, orient, axisConfig.position, canvasModel),
                translateY: AxisModel.getAxisTranslateY(AxisType.Value, orient, axisConfig.position, canvasModel)
            },
            cssClass: 'value-axis',
            ticks: axisConfig.ticks,
            labels: {
                maxSize: labelConfig.maxSize.main,
                position: 'straight',
                visible: true,
                defaultTooltip: true
            },
            visibility: axisConfig.visibility
        }
    }

    public static getAxisLength(chartOrientation: ChartOrientation, canvasModel: CanvasModel): number {
        if (chartOrientation === 'horizontal') {
            return canvasModel.getChartBlockHeight();
        } else {
            return canvasModel.getChartBlockWidth();
        }
    }

    public static getAxisOrient(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition): Orient {
        if (chartOrientation === 'vertical') {
            if (axisPosition === 'start')
                return axisType === AxisType.Key ? 'top' : 'left';
            return axisType === AxisType.Key ? 'bottom' : 'right'
        }
        if (axisPosition === 'start')
            return axisType === AxisType.Key ? 'left' : 'top';
        return axisType === AxisType.Key ? 'right' : 'bottom'
    }

    public static getAxisTranslateX(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, canvasModel: CanvasModel): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if (orient === 'top' || orient === 'left')
            return canvasModel.getMarginSide("left");
        else if (orient === 'bottom')
            return canvasModel.getMarginSide("left");
        return canvasModel.getBlockSize().width - canvasModel.getMarginSide("right");
    }

    public static getAxisTranslateY(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, canvasModel: CanvasModel): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if (orient === 'top' || orient === 'left')
            return canvasModel.getMarginSide("top");
        else if (orient === 'bottom')
            return canvasModel.getBlockSize().height - canvasModel.getMarginSide("bottom");
        return canvasModel.getMarginSide("top");
    }

    public static getKeyAxisLabelPosition(canvasModel: CanvasModel, scopedDataLength: number): AxisLabelPosition {
        const minBandSize = 50;
        if (canvasModel.getChartBlockWidth() / scopedDataLength < minBandSize)
            return 'rotated';

        return 'straight';
    }

    public static getLabelSize(labelMaxWidth: number, labelTexts: any[]): LabelSize {
        const labelSize = {
            width: 0,
            height: 0
        }
        const textBlock = document.createElement('span');
        textBlock.style.opacity = '0';
        textBlock.style.position = 'absolute';
        textBlock.style.whiteSpace = 'nowrap';
        textBlock.classList.add(CLASSES.dataLabel);
        let maxLabel = '';
        let biggestScore = 0;
        let maxWidth = 0;
        labelTexts.forEach((text: string) => {
            if (ModelHelper.getStringScore(text) > biggestScore) {
                maxLabel = text;
                biggestScore = ModelHelper.getStringScore(text);
            }
        });
        textBlock.textContent = maxLabel === '0000' ? maxLabel : maxLabel + 'D';
        document.body.append(textBlock);
        maxWidth = Math.ceil(textBlock.getBoundingClientRect().width);
        labelSize.height = textBlock.getBoundingClientRect().height;
        labelSize.width = maxWidth > labelMaxWidth ? labelMaxWidth : maxWidth;
        textBlock.remove();
        return labelSize;
    }
}