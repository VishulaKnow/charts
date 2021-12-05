import { TwoDimensionalAxis, MdtChartsConfig, IntervalAxis, TwoDimensionalOptions, PolarOptions, IntervalOptions, ChartOrientation, MdtChartsDataSource } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel, LabelSize } from "./featuresModel/axisModel";
import { DataManagerModel } from "./dataManagerModel";
import { LegendModel, MIN_DONUT_BLOCK_SIZE } from "./featuresModel/legendModel/legendModel";
import { BlockMargin, DataScope, LegendBlockModel, Orient, OtherCommonComponents, PolarOptionsModel, TitleBlockModel } from "./model";
import { AxisType } from "./modelBuilder";
import { TwoDimensionalModel } from "./notations/twoDimensionalModel";
import { Size } from "../config/config";
import { ModelInstance } from "./modelInstance/modelInstance";

export const AXIS_HORIZONTAL_LABEL_PADDING = 15;
export const AXIS_VERTICAL_LABEL_PADDING = 10;

export class MarginModel {
    public static initMargin(designerConfig: DesignerConfig, config: MdtChartsConfig, otherComponents: OtherCommonComponents, data: MdtChartsDataSource, modelInstance: ModelInstance): BlockMargin {
        const canvasModel = modelInstance.canvasModel
        canvasModel.initMargin({ ...designerConfig.canvas.chartBlockMargin });

        this.recalcMarginWithLegend(modelInstance, config, designerConfig.canvas.legendBlock.maxWidth, otherComponents.legendBlock, data);
        this.recalcMarginByTitle(canvasModel.getMargin(), otherComponents.titleBlock);

        if (config.options.type === '2d' || config.options.type === 'interval') {
            const labelSize = this.getHorizontalMarginByAxisLabels(designerConfig.canvas.axisLabel.maxSize.main, config.options.axis, data, config.options);
            this.recalcVerticalMarginByAxisLabelHeight(labelSize, canvasModel.getMargin(), config.options.orientation, config.options.axis);

            // Если встроенный лейбл показывает ключи, то лейблы оси ключей не показываются
            // При этом все графики должны иметь: embeddedLabels = 'key'
            // И все графики должны быть типа bar. 
            const showingFlag = config.options.type === '2d'
                ? !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(config.options.charts, config.options.orientation)
                : true;

            this.recalcHorizontalMarginByAxisLabelWidth(labelSize, canvasModel.getMargin(), config.options.orientation, config.options.axis, showingFlag);
        }

        return canvasModel.getMargin();
    }

    public static recalcPolarMarginWithScopedData(modelInstance: ModelInstance, blockSize: Size, designerConfig: DesignerConfig, config: MdtChartsConfig, legendBlockModel: LegendBlockModel, dataScope: DataScope, options: PolarOptionsModel): void {
        const margin = modelInstance.canvasModel.getMargin();
        let position = LegendModel.getLegendModel(config.options.type, config.options.legend.show, modelInstance.canvasModel).position;

        if (position !== 'off') {
            if (position === 'right' && blockSize.width - margin.left - margin.right < MIN_DONUT_BLOCK_SIZE)
                position = 'bottom';

            this.clearMarginByLegendBlockPosition(margin, legendBlockModel);

            let allowableKeys = [...dataScope.allowableKeys];
            if (dataScope.hidedRecordsAmount !== 0 && position === 'bottom')
                allowableKeys.push('1'); // Если есть спрятанные записи, то в массив добавляется объект, чтобы выделить место в легенде для индикатора переполнения

            const legendSize = LegendModel.getLegendSize(config.options.type, position, allowableKeys, designerConfig.canvas.legendBlock.maxWidth, config.canvas.size, legendBlockModel);
            margin[position] += legendSize + legendBlockModel.coordinate[position].margin[position];
            legendBlockModel.coordinate[position].size = legendSize;
            options.legend.position = position;
        }
    }

    public static recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance, config: MdtChartsConfig, designerConfig: DesignerConfig, dataScope: DataScope): void {
        if ((config.options.type === '2d' || config.options.type === 'interval') && config.options.orientation === 'vertical') {
            const axisLabelSize = AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, dataScope.allowableKeys);
            const axisConfig = AxisModel.getKeyAxisLabelPosition(modelInstance.canvasModel, dataScope.allowableKeys.length);

            const marginOrient = config.options.axis.key.position === 'end' ? 'bottom' : 'top';

            if (axisConfig === 'rotated')
                modelInstance.canvasModel.setMarginSide(marginOrient, modelInstance.canvasModel.getMarginSide(marginOrient) + (axisLabelSize.width - axisLabelSize.height));
        }
    }

    private static getHorizontalMarginByAxisLabels(labelsMaxWidth: number, axis: TwoDimensionalAxis | IntervalAxis, data: MdtChartsDataSource, options: TwoDimensionalOptions | IntervalOptions): LabelSize {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.key.position);
        let labelsTexts: string[];

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            labelsTexts = DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name);
        } else {
            labelsTexts = ['0000'];
        }

        return AxisModel.getLabelSize(labelsMaxWidth, labelsTexts);
    }

    private static recalcVerticalMarginByAxisLabelHeight(labelSize: LabelSize, margin: BlockMargin, orientation: ChartOrientation, axis: TwoDimensionalAxis | IntervalAxis): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, orientation, axis.key.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, orientation, axis.value.position);

        if ((keyAxisOrient === 'bottom' || keyAxisOrient === 'top')) {
            if (axis.key.visibility)
                margin[keyAxisOrient] += labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING;
        } else if (axis.value.visibility) {
            margin[valueAxisOrient] += labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING;
        }
    }

    private static recalcHorizontalMarginByAxisLabelWidth(labelSize: LabelSize, margin: BlockMargin, orientation: ChartOrientation, axis: TwoDimensionalAxis | IntervalAxis, isShow: boolean): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, orientation, axis.key.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, orientation, axis.value.position);

        if ((keyAxisOrient === 'left' || keyAxisOrient === 'right') && isShow && axis.key.visibility) {
            margin[keyAxisOrient] += labelSize.width + AXIS_VERTICAL_LABEL_PADDING;
        } else if ((valueAxisOrient === 'left' || valueAxisOrient === 'right') && axis.value.visibility) {
            margin[valueAxisOrient] += labelSize.width + AXIS_VERTICAL_LABEL_PADDING;
        }
    }

    private static recalcMarginWithLegend(modelInstance: ModelInstance, config: MdtChartsConfig, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: MdtChartsDataSource): void {
        const margin = modelInstance.canvasModel.getMargin();
        const legendPosition = LegendModel.getLegendModel(config.options.type, config.options.legend.show, modelInstance.canvasModel).position;
        if (legendPosition !== 'off') {
            const legendItemsContent = this.getLegendItemsContent(config.options, data);
            const legendSize = LegendModel.getLegendSize(config.options.type, legendPosition, legendItemsContent, legendMaxWidth, config.canvas.size, legendBlockModel);

            margin[legendPosition] += legendSize;

            if (legendSize !== 0)
                this.appendToGlobalMarginValuesLegendMargin(margin, legendPosition, legendBlockModel);

            legendBlockModel.coordinate[legendPosition].size = legendSize;
        }
    }

    private static getLegendItemsContent(options: TwoDimensionalOptions | PolarOptions | IntervalOptions, data: MdtChartsDataSource): string[] {
        if (options.type === '2d') {
            let texts: string[] = [];
            options.charts.forEach(chart => {
                texts = texts.concat(chart.data.valueFields.map(field => field.title))
            });
            return texts;
        } else if (options.type === 'polar') {
            return DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name);
        } else if (options.type === 'interval') {
            return [options.chart.data.valueField1.name];
        }
    }

    private static appendToGlobalMarginValuesLegendMargin(margin: BlockMargin, position: Orient, legendBlockModel: LegendBlockModel): void {
        const legendCoordinate = legendBlockModel.coordinate;
        if (position === 'left' || position === 'right')
            margin[position] += legendCoordinate[position].margin.left + legendCoordinate[position].margin.right;
        else
            margin[position] += legendCoordinate[position].margin.top + legendCoordinate[position].margin.bottom;
    }

    private static clearMarginByLegendBlockPosition(margin: BlockMargin, legendBlockModel: LegendBlockModel): void {
        const legendCoordinate = legendBlockModel.coordinate;
        ['left', 'right', 'top', 'bottom'].forEach((position: Orient) => {
            margin[position] -= legendCoordinate[position].size === 0
                ? 0
                : legendCoordinate[position].size + legendCoordinate[position].margin[position];
        });
    }

    private static recalcMarginByTitle(margin: BlockMargin, titleBlockModel: TitleBlockModel): void {
        margin.top += titleBlockModel.margin.top + titleBlockModel.size;
    }
}