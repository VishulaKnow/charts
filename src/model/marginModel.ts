import { TwoDimensionalAxis, Config, PolarChart, TwoDimensionalChart, IntervalChart, IntervalAxis, TwoDimensionalOptions, PolarOptions, IntervalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel, LabelSize } from "./axisModel";
import { DataManagerModel } from "./dataManagerModel";
import { LegendModel, MIN_DONUT_BLOCK_SIZE } from "./legendModel/legendModel";
import { BlockMargin, DataScope, DataSource, LegendBlockModel, Orient, PolarOptionsModel, Size } from "./model";
import { AxisType } from "./modelOptions";
import { TwoDimensionalModel } from "./twoDimensionalModel";

export const AXIS_HORIZONTAL_LABEL_PADDING = 15;
export const AXIS_VERTICAL_LABEL_PADDING = 10;

export class MarginModel
{
    public static getMargin(designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, data: DataSource): BlockMargin {
        const margin: BlockMargin = { ...designerConfig.canvas.chartBlockMargin }
        this.recalcMarginWithLegend(margin, config, designerConfig.canvas.legendBlock.maxWidth, legendBlockModel, data);

        if(config.options.type === '2d' || config.options.type === 'interval') {
            const labelSize = this.getMarginValuesByAxisLabels(config.options.charts, designerConfig.canvas.axisLabel.maxSize.main, config.options.axis, data, config.options);
            this.recalcMarginWithAxisLabelHeight(labelSize, margin, config.options, config.options.axis);

            const showingFlag = config.options.type === '2d' 
                ? !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(config.options.charts, config.options, data, config.options.orientation, config.canvas.size, margin, designerConfig.canvas.chartOptions.bar, config.options.isSegmented)
                : true; // If embedded labels displays, axis key labels doesn't show
            this.recalcMarginWithAxisLabelWidth(labelSize, margin, config.options, config.options.axis, showingFlag);
        }

        return margin;
    }

    public static recalcPolarMarginWithScopedData(margin: BlockMargin, blockSize: Size, designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, dataScope: DataScope, options: PolarOptionsModel): void {
        let position = LegendModel.getLegendModel(config.options.type, config.options.legend.position, config.canvas.size, margin).position;

        if(position !== 'off') {
            this.clearMarginByLegendBlockPosition(margin, legendBlockModel);

            if(position === 'right' && blockSize.width - margin.left - margin.right - legendBlockModel[position].size < MIN_DONUT_BLOCK_SIZE)
                position = 'bottom';
            
            const legendSize = LegendModel.getLegendSize(config.options.type, position, dataScope.allowableKeys, designerConfig.canvas.legendBlock.maxWidth, config.canvas.size, legendBlockModel);
            margin[position] += legendSize + legendBlockModel[position].margin[position];            
            legendBlockModel[position].size = legendSize;
            options.legend.position = position;
        }
    }

    public static recalcMargnWitVerticalAxisLabel(margin: BlockMargin, data: DataSource, config: Config, designerConfig: DesignerConfig): void {
        if((config.options.type === '2d' || config.options.type === 'interval') && config.options.orientation === 'vertical' && config.options.axis.keyAxis.position === 'end') {
            const labelTexts = DataManagerModel.getDataValuesByKeyField(data, config.options.charts[0]);
            const axisLabelSize = AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, labelTexts);
            const axisConfig = AxisModel.getKeyAxisLabelPosition(margin, config.canvas.size, labelTexts.length);

            if(axisConfig === 'rotated')
                margin.bottom += (axisLabelSize.width - axisLabelSize.height);
        }
    }

    private static getMarginValuesByAxisLabels(charts: TwoDimensionalChart[] | IntervalChart[], labelsMaxWidth: number, axis: TwoDimensionalAxis | IntervalAxis, data: DataSource, options: TwoDimensionalOptions | IntervalOptions): LabelSize {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.keyAxis.position);
        let labelsTexts: string[];

        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            labelsTexts = DataManagerModel.getDataValuesByKeyField(data, charts[0]);
        } else {
            labelsTexts = ['0000'];
        }

        return AxisModel.getLabelSize(labelsMaxWidth, labelsTexts);
    }

    private static recalcMarginWithAxisLabelHeight(labelSize: LabelSize, margin: BlockMargin, options: TwoDimensionalOptions | IntervalOptions, axis: TwoDimensionalAxis | IntervalAxis): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.keyAxis.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, options.orientation, axis.valueAxis.position);

        if(keyAxisOrient === 'bottom' || keyAxisOrient === 'top') {
            margin[keyAxisOrient] += labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING;
        } else {
            margin[valueAxisOrient] += labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING;
        }
    }

    private static recalcMarginWithAxisLabelWidth(labelSize: LabelSize, margin: BlockMargin, options: TwoDimensionalOptions | IntervalOptions, axis: TwoDimensionalAxis | IntervalAxis, isShow: boolean): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.keyAxis.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, options.orientation, axis.valueAxis.position);

        if((keyAxisOrient === 'left' || keyAxisOrient === 'right') && isShow) {
            margin[keyAxisOrient] += labelSize.width + AXIS_VERTICAL_LABEL_PADDING;
        } else if(valueAxisOrient === 'left' || valueAxisOrient === 'right') {
            margin[valueAxisOrient] += labelSize.width + AXIS_VERTICAL_LABEL_PADDING;
        }
    }

    private static recalcMarginWithLegend(margin: BlockMargin, config: Config, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: DataSource): void {
        const legendPosition = LegendModel.getLegendModel(config.options.type, config.options.legend.position, config.canvas.size, margin).position;
        if(legendPosition !== 'off') {
            const legendItemsContent = this.getLegendItemsContent(config.options.charts, config.options, data);
            const legendSize = LegendModel.getLegendSize(config.options.type, legendPosition, legendItemsContent, legendMaxWidth, config.canvas.size, legendBlockModel);
            
            margin[legendPosition] += legendSize;

            if(legendSize !== 0)
                this.appendToGlobalMarginValuesLegendMargin(margin, legendPosition, legendBlockModel);

            legendBlockModel[legendPosition].size = legendSize;
        }
    }

    private static getLegendItemsContent(charts: Array<TwoDimensionalChart | IntervalChart | PolarChart>, options: TwoDimensionalOptions | PolarOptions | IntervalOptions, data: DataSource): string[] {
        if(options.type === '2d') {
            let texts: string[] = [];
            options.charts.forEach(chart => {
                texts = texts.concat(chart.data.valueFields.map(field => field.title))
            });  
            return texts;

        } else if(options.type === 'polar') {
            return charts.map(chart => DataManagerModel.getDataValuesByKeyField(data, chart))[0]
        } else if(options.type === 'interval') {
            return charts.map(chart => chart.title);
        }
    }

    private static appendToGlobalMarginValuesLegendMargin(margin: BlockMargin, position: Orient, legendBlockModel: LegendBlockModel): void {
        if(position === 'left' || position === 'right')
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
}