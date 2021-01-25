import { TwoDimensionalAxis, Config, PolarChart, TwoDimensionalChart, IntervalChart, IntervalAxis, TwoDimensionalOptions, PolarOptions, IntervalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { DataManagerModel } from "./dataManagerModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataScope, DataSource, LegendBlockModel, Orient } from "./model";
import { AxisType } from "./modelOptions";

const AXIS_LABEL_PADDING = 15;

export class MarginModel
{
    public static getMargin(designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, data: DataSource): BlockMargin {
        const margin: BlockMargin = { ...designerConfig.canvas.chartBlockMargin }
        this.recalcMarginWithLegend(margin, config, designerConfig.canvas.legendBlock.maxWidth, legendBlockModel, data);
        if(config.options.type === '2d' || config.options.type === 'interval') {
            this.recalcMarginWithAxisLabelWidth(margin, config.options.charts, designerConfig.canvas.axisLabel.maxSize.main, config.options.axis, data);
        }
        return margin;
    }

    public static recalcPolarMarginWithScopedData(margin: BlockMargin, designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, dataScope: DataScope): void {
        margin.top -= legendBlockModel.top.size;
        margin.bottom -= legendBlockModel.bottom.size;
        margin.left -= legendBlockModel.left.size;
        margin.right -= legendBlockModel.right.size;

        if(config.options.charts[0].legend.position !== 'off' && config.options.type === 'polar') {
            const position = config.options.charts[0].legend.position
            const legendSize = LegendModel.getLegendSize(position, dataScope.allowableKeys, designerConfig.canvas.legendBlock.maxWidth, config.canvas.size, legendBlockModel);
            margin[position] += legendSize
            legendBlockModel[config.options.charts[0].legend.position].size = legendSize;
        }    
    }

    public static recalcMargnWitVerticalAxisLabel(margin: BlockMargin, data: DataSource, config: Config, designerConfig: DesignerConfig): void {
        if(config.options.type === '2d' || config.options.type === 'interval') {
            if(config.options.charts[0].orientation === 'vertical') {
                let marginOrient: Orient = 'top';
                if(config.options.axis.keyAxis.position === 'end')
                    marginOrient = 'bottom';
                const labelTexts = DataManagerModel.getDataValuesByKeyField(data, config.options.charts[0]);
                const axisLabelSize = AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, labelTexts).width;

                margin[marginOrient] += axisLabelSize;
            }
        }
    }

    private static recalcMarginWithAxisLabelWidth(margin: BlockMargin, charts: TwoDimensionalChart[] | IntervalChart[], labelsMaxWidth: number, axis: TwoDimensionalAxis | IntervalAxis, data: DataSource): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, charts[0].orientation, axis.keyAxis.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, charts[0].orientation, axis.valueAxis.position);
        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            const labelTexts = DataManagerModel.getDataValuesByKeyField(data, charts[0]);
            const axisLabelSize = AxisModel.getLabelSize(labelsMaxWidth, labelTexts);
            margin[keyAxisOrient] += axisLabelSize.width + AXIS_LABEL_PADDING;
            margin[valueAxisOrient] += axisLabelSize.height + AXIS_LABEL_PADDING;
        } else {
            const labelTexts = ['0000'];
            const axisLabelSize = AxisModel.getLabelSize(labelsMaxWidth, labelTexts);
            margin[valueAxisOrient] += axisLabelSize.width + AXIS_LABEL_PADDING;
            margin[keyAxisOrient] += axisLabelSize.height + AXIS_LABEL_PADDING;
        }
    }

    private static recalcMarginWithLegend(margin: BlockMargin, config: Config, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: DataSource): void {
        const positions: Orient[] = ['left', 'right', 'top', 'bottom'];
        positions.forEach(position => {
            let legendSize = 0;
            const charts = this.getChartsWithLegend(config.options, position);
            
            if(charts.length !== 0) {
                const legendItemsContent = this.getLegendItemsContent(charts, config.options, data);
                legendSize = LegendModel.getLegendSize(position, legendItemsContent, legendMaxWidth, config.canvas.size, legendBlockModel);
            }

            margin[position] += legendSize;
            if(legendSize !== 0)
                this.appendGlobalMarginByLegendMargin(margin, position, legendBlockModel);
            legendBlockModel[position].size = legendSize;
        });
    }

    private static getChartsWithLegend(options: TwoDimensionalOptions | PolarOptions | IntervalOptions, legendPosition: Orient): Array<TwoDimensionalChart | PolarChart | IntervalChart> {
        return (options.charts as Array<TwoDimensionalChart | IntervalChart | PolarChart>).filter((chart: TwoDimensionalChart | IntervalChart | PolarChart) => chart.legend.position === legendPosition);
    }

    private static getLegendItemsContent(charts: Array<TwoDimensionalChart | IntervalChart | PolarChart>, options: TwoDimensionalOptions | PolarOptions | IntervalOptions, data: DataSource): string[] {
        if(options.type === '2d' || options.type === 'interval') {
            return charts.map(chart => chart.title);
        } else {
            return charts.map(chart => DataManagerModel.getDataValuesByKeyField(data, chart))[0]
        }
    }

    private static appendGlobalMarginByLegendMargin(margin: BlockMargin, position: Orient, legendBlockModel: LegendBlockModel): void {
        if(position === 'left' || position === 'right')
            margin[position] += legendBlockModel[position].margin.left + legendBlockModel[position].margin.right;
        else
            margin[position] += legendBlockModel[position].margin.top + legendBlockModel[position].margin.bottom;
    }
}