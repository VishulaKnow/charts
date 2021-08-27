import { AxisPosition, ChartOrientation, DataOptions, MdtChartsDataSource, DiscreteAxisOptions, NumberAxisOptions, Size, TwoDimensionalChart } from "../../config/config";
import { AxisLabelPosition, AxisModelOptions, BlockMargin, Orient } from "../model";
import { ModelHelper } from "../modelHelper";
import { AxisType, CLASSES } from "../modelBuilder";
import { DataManagerModel } from "../dataManagerModel";
import { TwoDimensionalModel } from "../notations/twoDimensionalModel";
import { AxisLabelCanvas, TooltipSettings } from "../../designer/designerConfig";

export interface LabelSize {
    width: number;
    height: number
}

export class AxisModel {
    public static getKeyAxis(charts: TwoDimensionalChart[], data: MdtChartsDataSource, dataOptions: DataOptions, orient: ChartOrientation, axisConfig: DiscreteAxisOptions, labelConfig: AxisLabelCanvas, margin: BlockMargin, blockSize: Size, tooltipSettings: TooltipSettings): AxisModelOptions {
        return {
            type: 'key',
            orient: AxisModel.getAxisOrient(AxisType.Key, orient, axisConfig.position),
            translate: {
                translateX: AxisModel.getAxisTranslateX(AxisType.Key, orient, axisConfig.position, margin, blockSize.width),
                translateY: AxisModel.getAxisTranslateY(AxisType.Key, orient, axisConfig.position, margin, blockSize.height)
            },
            cssClass: 'key-axis',
            ticks: axisConfig.ticks,
            labels: {
                maxSize: AxisModel.getLabelSize(labelConfig.maxSize.main, data[dataOptions.dataSource].map(d => d[dataOptions.keyField.name])).width,
                position: AxisModel.getKeyAxisLabelPosition(margin, blockSize, DataManagerModel.getDataValuesByKeyField(data, dataOptions.dataSource, dataOptions.keyField.name).length),
                visible: !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(charts, orient),
                defaultTooltip: tooltipSettings.position === 'fixed'
            },
            visibility: axisConfig.visibility
        }
    }

    public static getValueAxis(orient: ChartOrientation, axisConfig: NumberAxisOptions, labelConfig: AxisLabelCanvas, margin: BlockMargin, blockSize: Size): AxisModelOptions {
        return {
            type: 'value',
            orient: AxisModel.getAxisOrient(AxisType.Value, orient, axisConfig.position),
            translate: {
                translateX: AxisModel.getAxisTranslateX(AxisType.Value, orient, axisConfig.position, margin, blockSize.width),
                translateY: AxisModel.getAxisTranslateY(AxisType.Value, orient, axisConfig.position, margin, blockSize.height)
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

    public static getAxisLength(chartOrientation: ChartOrientation, margin: BlockMargin, blockSize: Size): number {
        if (chartOrientation === 'horizontal') {
            return blockSize.height - margin.top - margin.bottom;
        } else {
            return blockSize.width - margin.left - margin.right;
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

    public static getAxisTranslateX(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, margin: BlockMargin, blockWidth: number): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if (orient === 'top' || orient === 'left')
            return margin.left;
        else if (orient === 'bottom')
            return margin.left;
        return blockWidth - margin.right;
    }

    public static getAxisTranslateY(axisType: AxisType, chartOrientation: ChartOrientation, axisPosition: AxisPosition, margin: BlockMargin, blockHeight: number): number {
        const orient = AxisModel.getAxisOrient(axisType, chartOrientation, axisPosition);
        if (orient === 'top' || orient === 'left')
            return margin.top;
        else if (orient === 'bottom')
            return blockHeight - margin.bottom;
        return margin.top;
    }

    public static getKeyAxisLabelPosition(margin: BlockMargin, blockSize: Size, scopedDataLength: number): AxisLabelPosition {
        const minBandSize = 50;
        if ((blockSize.width - margin.left - margin.right) / scopedDataLength < minBandSize)
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