import { Axis, Config, PolarChart, PolarOptions, TwoDimensionalChart, TwoDimensionalOptions } from "../config/config";
import { DesignerConfig } from "../designer/designerConfig";
import { AxisModel } from "./axisModel";
import { LegendModel } from "./legendModel/legendModel";
import { BlockMargin, DataRow, DataSource, LegendBlockModel, Orient } from "./model";
import { AxisType, CLASSES } from "./modelOptions";

const AXIS_LABEL_PADDING = 9;

export class MarginModel
{
    static getMargin(designerConfig: DesignerConfig, config: Config, legendBlockModel: LegendBlockModel, data: DataSource): BlockMargin {
        const margin: BlockMargin = {
            top: designerConfig.canvas.chartBlockMargin.top,
            bottom: designerConfig.canvas.chartBlockMargin.bottom,
            left: designerConfig.canvas.chartBlockMargin.left,
            right: designerConfig.canvas.chartBlockMargin.right
        }
        this.recalcMarginWithLegend(margin, config, designerConfig.canvas.legendBlock.maxWidth, legendBlockModel, data);
        if(config.options.type === '2d') {
            this.recalcMarginWithAxisLabelWidth(margin, config.options.charts, designerConfig.canvas.axisLabel.maxSize.main, config.options.axis, data);
            this.recalcMarginWithAxisLabelHeight(margin, config.options.charts, config.options.axis);
        }
        return margin;
    }

    static recalcMarginWithLegend(margin: BlockMargin, config: Config, legendMaxWidth: number, legendBlockModel: LegendBlockModel, data: DataSource): void {
        const positions: Orient[] = ['left', 'right', 'top', 'bottom'];
        positions.forEach(position => {
            let legendSize = 0;
            if(config.options.type === '2d') {
                const charts = config.options.charts.filter((chart: TwoDimensionalChart) => chart.legend.position === position);
                if(charts.length !== 0) {
                    legendSize = LegendModel.getLegendSize(position, charts.map(chart => chart.data.dataSource), legendMaxWidth, config.canvas.size);
                }
            } else {
                const charts = config.options.charts.filter((chart: PolarChart) => chart.legend.position === position);
                if(charts.length !== 0) {
                    legendSize = LegendModel.getLegendSize(position, charts.map(chart => {
                        return data[chart.data.dataSource].map((record: DataRow) => record[chart.data.keyField.name])
                    })[0], legendMaxWidth, config.canvas.size);
                }
            }
            margin[position] += legendSize;
            legendBlockModel[position].size = legendSize;
        });
    }

    static recalcMarginWithAxisLabelWidth(margin: BlockMargin, charts: TwoDimensionalChart[], labelsMaxWidth: number, axis: Axis, data: DataSource): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, charts[0].orientation, axis.keyAxis.position);
        if(keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            const labelTexts = data[charts[0].data.dataSource].map((dataSet: DataRow) => dataSet[charts[0].data.keyField.name]);
            margin[keyAxisOrient] += AxisModel.getLabelTextMaxWidth(labelsMaxWidth, labelTexts) + AXIS_LABEL_PADDING;
        } else {
            const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, charts[0].orientation, axis.valueAxis.position);
            const labelTexts = data[charts[0].data.dataSource].map((dataSet: DataRow) => dataSet[charts[0].data.valueField.name]);
            margin[valueAxisOrient] += AxisModel.getLabelTextMaxWidth(labelsMaxWidth, labelTexts) + AXIS_LABEL_PADDING;
        }
    }
    
    static recalcMarginWithAxisLabelHeight(margin: BlockMargin, charts: TwoDimensionalChart[], axis: Axis): void {
        let horizontalAxisPosition: string;
        if(charts[0].orientation === 'vertical') {
            horizontalAxisPosition = AxisModel.getAxisOrient(AxisType.Key, charts[0].orientation, axis.keyAxis.position);
        } else {
            horizontalAxisPosition = AxisModel.getAxisOrient(AxisType.Value, charts[0].orientation, axis.valueAxis.position);
        }
        if(horizontalAxisPosition === 'top') {        
            margin.top += AxisModel.getLabelHeight(CLASSES.dataLabel) + AXIS_LABEL_PADDING;
        } else if(horizontalAxisPosition === 'bottom') {
            margin.bottom += AxisModel.getLabelHeight(CLASSES.dataLabel) + AXIS_LABEL_PADDING;
        }
    }
}