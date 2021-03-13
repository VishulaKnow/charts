import { TwoDimensionalAxis, Config, PolarChart, TwoDimensionalChart, IntervalChart, IntervalAxis, TwoDimensionalOptions, PolarOptions, IntervalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel, LabelSize } from "./featuresModel/axisModel";
import { DataManagerModel } from "./dataManagerModel";
import { LegendModel, MIN_DONUT_BLOCK_SIZE } from "./featuresModel/legendModel/legendModel";
import { BlockMargin, DataScope, DataSource, LegendBlockModel, Orient, OtherComponents, PolarOptionsModel, Size, TitleBlockModel } from "./model";
import { AxisType } from "./modelBuilder";
import { TwoDimensionalModel } from "./twoDimensionalModel";

export const AXIS_HORIZONTAL_LABEL_PADDING = 15;
export const AXIS_VERTICAL_LABEL_PADDING = 10;



export class MarginModel {
    public static getMargin(designerConfig: DesignerConfig, config: Config, otherComponents: OtherComponents, data: DataSource): BlockMargin {
        const margin: BlockMargin = { ...designerConfig.canvas.chartBlockMargin }

        this.recalcMarginWithLegend(margin, config, designerConfig.canvas.legendBlock.maxWidth, otherComponents.legendBlock, data);
        this.recalcMarginByTitle(margin, otherComponents.titleBlock);

        if (config.options.type === '2d' || config.options.type === 'interval') {
            const labelSize = this.getHorizontalMarginByAxisLabels(designerConfig.canvas.axisLabel.maxSize.main, config.options.axis, data, config.options);
            this.recalcVerticalMarginByAxisLabelHeight(labelSize, margin, config.options, config.options.axis);

            // Если встроенный лейбл показывает ключи, то лейблы оси ключей не показываются
            // При этом все графики должны иметь: embeddedLabels = 'key'
            // И все графики должны быть типа bar. 
            const showingFlag = config.options.type === '2d'
                ? !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(config.options.charts, config.options.orientation)
                : true;

            this.recalcHorizontalMarginByAxisLabelWidth(labelSize, margin, config.options, config.options.axis, showingFlag);
        }

        return margin;
    }

    public static recalcPolarMarginWithScopedData(margin: BlockMargin, blockSize: Size, designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, dataScope: DataScope, options: PolarOptionsModel): void {
        let position = LegendModel.getLegendModel(config.options.type, config.options.legend.show, config.canvas.size, margin).position;

        if (position !== 'off') {
            if (position === 'right' && blockSize.width - margin.left - margin.right < MIN_DONUT_BLOCK_SIZE)
                position = 'bottom';

            this.clearMarginByLegendBlockPosition(margin, legendBlockModel);

            let allowableKeys = [...dataScope.allowableKeys];
            if (dataScope.hidedRecordsAmount !== 0 && position === 'bottom')
                allowableKeys.push('1'); // Если есть спрятанные записи, то в массив добавляется объект, чтобы выделить место в легенде для индикатора переполнения

            const legendSize = LegendModel.getLegendSize(config.options.type, position, allowableKeys, designerConfig.canvas.legendBlock.maxWidth, config.canvas.size, legendBlockModel);
            margin[position] += legendSize + legendBlockModel[position].margin[position];
            legendBlockModel[position].size = legendSize;
            options.legend.position = position;
        }
    }

    public static recalcMarginByVerticalAxisLabel(margin: BlockMargin, data: DataSource, config: Config, designerConfig: DesignerConfig, dataScope: DataScope): void {
        if ((config.options.type === '2d' || config.options.type === 'interval') && config.options.orientation === 'vertical') {
            const axisLabelSize = AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, dataScope.allowableKeys);
            const axisConfig = AxisModel.getKeyAxisLabelPosition(margin, config.canvas.size, dataScope.allowableKeys.length);

            const marginOrient = config.options.axis.keyAxis.position === 'end' ? 'bottom' : 'top';

            if (axisConfig === 'rotated')
                margin[marginOrient] += (axisLabelSize.width - axisLabelSize.height);
        }
    }

    private static getHorizontalMarginByAxisLabels(labelsMaxWidth: number, axis: TwoDimensionalAxis | IntervalAxis, data: DataSource, options: TwoDimensionalOptions | IntervalOptions): LabelSize {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.keyAxis.position);
        let labelsTexts: string[];

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            labelsTexts = DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name);
        } else {
            labelsTexts = ['0000'];
        }

        return AxisModel.getLabelSize(labelsMaxWidth, labelsTexts);
    }

    private static recalcVerticalMarginByAxisLabelHeight(labelSize: LabelSize, margin: BlockMargin, options: TwoDimensionalOptions | IntervalOptions, axis: TwoDimensionalAxis | IntervalAxis): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.keyAxis.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, options.orientation, axis.valueAxis.position);

        if ((keyAxisOrient === 'bottom' || keyAxisOrient === 'top')) {
            if (axis.keyAxis.visibility)
                margin[keyAxisOrient] += labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING;
        } else if (axis.valueAxis.visibility) {
            margin[valueAxisOrient] += labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING;
        }
    }

    private static recalcHorizontalMarginByAxisLabelWidth(labelSize: LabelSize, margin: BlockMargin, options: TwoDimensionalOptions | IntervalOptions, axis: TwoDimensionalAxis | IntervalAxis, isShow: boolean): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.keyAxis.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, options.orientation, axis.valueAxis.position);

        if ((keyAxisOrient === 'left' || keyAxisOrient === 'right') && isShow && axis.keyAxis.visibility) {
            margin[keyAxisOrient] += labelSize.width + AXIS_VERTICAL_LABEL_PADDING;
        } else if ((valueAxisOrient === 'left' || valueAxisOrient === 'right') && axis.valueAxis.visibility) {
            margin[valueAxisOrient] += labelSize.width + AXIS_VERTICAL_LABEL_PADDING;
        }
    }

    private static recalcMarginWithLegend(margin: BlockMargin, config: Config, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: DataSource): void {
        const legendPosition = LegendModel.getLegendModel(config.options.type, config.options.legend.show, config.canvas.size, margin).position;
        if (legendPosition !== 'off') {
            const legendItemsContent = this.getLegendItemsContent(config.options.charts, config.options, data);
            const legendSize = LegendModel.getLegendSize(config.options.type, legendPosition, legendItemsContent, legendMaxWidth, config.canvas.size, legendBlockModel);

            margin[legendPosition] += legendSize;

            if (legendSize !== 0)
                this.appendToGlobalMarginValuesLegendMargin(margin, legendPosition, legendBlockModel);

            legendBlockModel[legendPosition].size = legendSize;
        }
    }

    private static getLegendItemsContent(charts: Array<TwoDimensionalChart | IntervalChart | PolarChart>, options: TwoDimensionalOptions | PolarOptions | IntervalOptions, data: DataSource): string[] {
        if (options.type === '2d') {
            let texts: string[] = [];
            options.charts.forEach(chart => {
                texts = texts.concat(chart.data.valueFields.map(field => field.title))
            });
            return texts;
        } else if (options.type === 'polar') {
            return DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name);
        } else if (options.type === 'interval') {
            return options.charts.map(chart => chart.data.valueField1.name);
        }
    }

    private static appendToGlobalMarginValuesLegendMargin(margin: BlockMargin, position: Orient, legendBlockModel: LegendBlockModel): void {
        if (position === 'left' || position === 'right')
            margin[position] += legendBlockModel[position].margin.left + legendBlockModel[position].margin.right;
        else
            margin[position] += legendBlockModel[position].margin.top + legendBlockModel[position].margin.bottom;
    }

    private static clearMarginByLegendBlockPosition(margin: BlockMargin, legendBlockModel: LegendBlockModel): void {
        ['left', 'right', 'top', 'bottom'].forEach((position: Orient) => {
            margin[position] -= legendBlockModel[position].size === 0
                ? 0
                : legendBlockModel[position].size + legendBlockModel[position].margin[position];
        });
    }

    private static recalcMarginByTitle(margin: BlockMargin, titleBlockModel: TitleBlockModel): void {
        margin.top += titleBlockModel.margin.top + titleBlockModel.size;
    }
}