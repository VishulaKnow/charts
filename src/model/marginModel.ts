import { TwoDimensionalAxis, Config, PolarChart, TwoDimensionalChart,  } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { DataManagerModel } from "./dataManagerModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataRow, DataScope, DataSource, LegendBlockModel, Orient } from "./model";
import { AxisType, CLASSES } from "./modelOptions";

const AXIS_LABEL_PADDING = 9;

export class MarginModel
{
    public static getMargin(designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, data: DataSource): BlockMargin {
        const margin: BlockMargin = { ...designerConfig.canvas.chartBlockMargin }
        this.recalcMarginWithLegend(margin, config, designerConfig.canvas.legendBlock.maxWidth, legendBlockModel, data);
        if(config.options.type === '2d') {
            this.recalcMarginWithAxisLabelWidth(margin, config.options.charts, designerConfig.canvas.axisLabel.maxSize.main, config.options.axis, data);
            // this.recalcMarginWithAxisLabelHeight(margin, config.options.charts, config.options.axis);
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
            const legendSize = LegendModel.getLegendSize(position, dataScope.allowableKeys, designerConfig.canvas.legendBlock.maxWidth, config.canvas.size);
            margin[position] += legendSize
            legendBlockModel[config.options.charts[0].legend.position].size = legendSize;
        }    
    }

    public static recalcMarginWithAxisLabelWidth(margin: BlockMargin, charts: TwoDimensionalChart[], labelsMaxWidth: number, axis: TwoDimensionalAxis, data: DataSource): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, charts[0].orientation, axis.keyAxis.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, charts[0].orientation, axis.valueAxis.position);
        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            const labelTexts = DataManagerModel.getDataValuesByKeyField(data, charts[0]);
            const axisLabelSize = AxisModel.getLabelSize(labelsMaxWidth, labelTexts);
            margin[keyAxisOrient] += axisLabelSize.width + AXIS_LABEL_PADDING;
            margin[valueAxisOrient] += axisLabelSize.height + AXIS_LABEL_PADDING;
        } else {
            // const labelTexts = DataManagerModel.getDataValuesByValueField(data, charts[0]);
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
            
            if(config.options.type === '2d') {
                const charts = config.options.charts.filter((chart: TwoDimensionalChart) => chart.legend.position === position);
                if(charts.length !== 0) {
                    legendSize = LegendModel.getLegendSize(position, charts.map(chart => chart.data.dataSource), legendMaxWidth, config.canvas.size);
                }
            } else if(config.options.type === 'polar') {
                const charts = config.options.charts.filter((chart: PolarChart) => chart.legend.position === position);
                if(charts.length !== 0) {
                    legendSize = LegendModel.getLegendSize(position, charts.map(chart => DataManagerModel.getDataValuesByKeyField(data, chart))[0], legendMaxWidth, config.canvas.size);
                }
            }

            margin[position] += legendSize;
            legendBlockModel[position].size = legendSize;
        });
    }
}