import { TwoDimensionalAxis, Config, PolarChart, TwoDimensionalChart, IntervalChart, IntervalAxis, TwoDimensionalOptions, PolarOptions, IntervalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { DataManagerModel } from "./dataManagerModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataScope, DataSource, LegendBlockModel, Orient } from "./model";
import { AxisType } from "./modelOptions";
import { TwoDimensionalModel } from "./twoDimensionalModel";

const AXIS_HORIZONTAL_LABEL_PADDING = 15;
const AXIS_VERTICAL_LABEL_PADDING = 10;

export class MarginModel
{
    public static getMargin(designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, data: DataSource): BlockMargin {
        const margin: BlockMargin = { ...designerConfig.canvas.chartBlockMargin }
        this.recalcMarginWithLegend(margin, config, designerConfig.canvas.legendBlock.maxWidth, legendBlockModel, data);
        if((config.options.type === '2d' && !TwoDimensionalModel.getChartsEmbededLabelsFlag(config.options.charts, config.options.orientation)) || config.options.type === 'interval') {
            this.recalcXMarginWithAxisLabelWidth(margin, config.options.charts, designerConfig.canvas.axisLabel.maxSize.main, config.options.axis, data, config.options);
        }

        return margin;
    }

    public static recalcPolarMarginWithScopedData(margin: BlockMargin, designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, dataScope: DataScope): void {
        const position = LegendModel.getLegendModel(config.options.type, config.options.legend.position, config.canvas.size).position;
        if(position !== 'off') {
            margin.top -= legendBlockModel.top.size;
            margin.bottom -= legendBlockModel.bottom.size;
            margin.left -= legendBlockModel.left.size;
            margin.right -= legendBlockModel.right.size;
            
            const legendSize = LegendModel.getLegendSize(config.options.type, position, dataScope.allowableKeys, designerConfig.canvas.legendBlock.maxWidth, config.canvas.size, legendBlockModel);
            margin[position] += legendSize;            
            legendBlockModel[position].size = legendSize;
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

    private static recalcXMarginWithAxisLabelWidth(margin: BlockMargin, charts: TwoDimensionalChart[] | IntervalChart[], labelsMaxWidth: number, axis: TwoDimensionalAxis | IntervalAxis, data: DataSource, options: TwoDimensionalOptions | IntervalOptions): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.keyAxis.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, options.orientation, axis.valueAxis.position);
        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            const labelTexts = DataManagerModel.getDataValuesByKeyField(data, charts[0]);
            const axisLabelSize = AxisModel.getLabelSize(labelsMaxWidth, labelTexts);
            margin[keyAxisOrient] += axisLabelSize.width + AXIS_VERTICAL_LABEL_PADDING;
            margin[valueAxisOrient] += axisLabelSize.height + AXIS_HORIZONTAL_LABEL_PADDING;
        } else {
            const labelTexts = ['0000'];
            const axisLabelSize = AxisModel.getLabelSize(labelsMaxWidth, labelTexts);
            margin[valueAxisOrient] += axisLabelSize.width + AXIS_VERTICAL_LABEL_PADDING;
            margin[keyAxisOrient] += axisLabelSize.height + AXIS_HORIZONTAL_LABEL_PADDING;
        }
    }

    private static recalcMarginWithLegend(margin: BlockMargin, config: Config, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: DataSource): void {
        const legendPosition = LegendModel.getLegendModel(config.options.type, config.options.legend.position, config.canvas.size);
        if(legendPosition.position !== 'off') {
            let legendSize = 0;
            const charts = config.options.charts;
            const legendItemsContent = this.getLegendItemsContent(charts, config.options, data);

            legendSize = LegendModel.getLegendSize(config.options.type, legendPosition.position, legendItemsContent, legendMaxWidth, config.canvas.size, legendBlockModel);
            margin[legendPosition.position] += legendSize;

            if(legendSize !== 0)
                this.appendGlobalMarginByLegendMargin(margin, legendPosition.position, legendBlockModel);
            legendBlockModel[legendPosition.position].size = legendSize;
        }
    }

    private static getLegendItemsContent(charts: Array<TwoDimensionalChart | IntervalChart | PolarChart>, options: TwoDimensionalOptions | PolarOptions | IntervalOptions, data: DataSource): string[] {
        if(options.type === '2d') {
            let texts: string[] = [];
            options.charts.forEach(chart => {
                texts = texts.concat(chart.data.valueField.map(field => field.title))
            });  
            return texts;
        } else if(options.type === 'polar') {
            return charts.map(chart => DataManagerModel.getDataValuesByKeyField(data, chart))[0]
        } else if(options.type === 'interval') {
            return charts.map(chart => chart.title);
        }
    }

    private static appendGlobalMarginByLegendMargin(margin: BlockMargin, position: Orient, legendBlockModel: LegendBlockModel): void {
        if(position === 'left' || position === 'right')
            margin[position] += legendBlockModel[position].margin.left + legendBlockModel[position].margin.right;
        else
            margin[position] += legendBlockModel[position].margin.top + legendBlockModel[position].margin.bottom;
    }
}