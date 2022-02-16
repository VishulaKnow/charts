import { ChartOrientation, MdtChartsDataSource, MdtChartsTwoDimensionalOptions, TwoDimensionalAxis } from "../../../config/config";
import { DesignerConfig } from "../../../designer/designerConfig";
import { DataManagerModel } from "../../dataManagerModel/dataManagerModel";
import { AxisModel, LabelSize } from "../../featuresModel/axisModel";
import { TwoDimLegendModel } from "../../featuresModel/legendModel/twoDimLegendModel";
import { keyAxisLabelHorizontalLog, keyAxisLabelVerticalLog } from "../../featuresModel/scaleModel/scaleAxisRecalcer";
import { OtherCommonComponents } from "../../model";
import { AxisType } from "../../modelBuilder";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { TwoDimensionalModel } from "../../notations/twoDimensionalModel";

export const AXIS_HORIZONTAL_LABEL_PADDING = 15;
export const AXIS_VERTICAL_LABEL_PADDING = 10;

export class TwoDimMarginModel {
    private twoDimLegendModel = new TwoDimLegendModel();

    recalcMargin(designerConfig: DesignerConfig, options: MdtChartsTwoDimensionalOptions, otherComponents: OtherCommonComponents, data: MdtChartsDataSource, modelInstance: ModelInstance) {
        const canvasModel = modelInstance.canvasModel;

        this.twoDimLegendModel.recalcMarginWith2DLegend(modelInstance, otherComponents.legendBlock, options.legend);
        const labelSize = this.getHorizontalMarginByAxisLabels(designerConfig.canvas.axisLabel.maxSize.main, options.axis, data, options);
        this.recalcVerticalMarginByAxisLabelHeight(labelSize, canvasModel, options.orientation, options.axis);

        // Если встроенный лейбл показывает ключи, то лейблы оси ключей не показываются
        // При этом все графики должны иметь: embeddedLabels = 'key'
        // И все графики должны быть типа bar. 
        const showingFlag = options.type === '2d'
            ? !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(options.charts, options.orientation)
            : true;

        this.recalcHorizontalMarginByAxisLabelWidth(labelSize, canvasModel, options.orientation, options.axis, showingFlag);
    }

    public recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance, options: MdtChartsTwoDimensionalOptions, designerConfig: DesignerConfig): void {
        if (options.orientation === 'vertical') {
            const dataModel = modelInstance.dataModel;

            const axisLabelSize = AxisModel.getLabelSize(designerConfig.canvas.axisLabel.maxSize.main, dataModel.getAllowableKeys());
            const axisConfig = AxisModel.getKeyAxisLabelPosition(modelInstance.canvasModel, dataModel.getAllowableKeys().length, options.axis.key);

            const marginOrient = options.axis.key.position === 'end' ? 'bottom' : 'top';

            if (axisConfig === 'rotated') {
                modelInstance.canvasModel.decreaseMarginSide(marginOrient, axisLabelSize.height);
                modelInstance.canvasModel.increaseMarginSide(marginOrient, axisLabelSize.width, keyAxisLabelVerticalLog);
            }
        }
    }

    private getHorizontalMarginByAxisLabels(labelsMaxWidth: number, axis: TwoDimensionalAxis, data: MdtChartsDataSource, options: MdtChartsTwoDimensionalOptions): LabelSize {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, options.orientation, axis.key.position);
        let labelsTexts: string[];

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            labelsTexts = DataManagerModel.getDataValuesByKeyField(data, options.data.dataSource, options.data.keyField.name);
        } else {
            labelsTexts = ['0000'];
        }

        return AxisModel.getLabelSize(labelsMaxWidth, labelsTexts);
    }

    private recalcVerticalMarginByAxisLabelHeight(labelSize: LabelSize, canvasModel: CanvasModel, orientation: ChartOrientation, axis: TwoDimensionalAxis): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, orientation, axis.key.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, orientation, axis.value.position);

        if ((keyAxisOrient === 'bottom' || keyAxisOrient === 'top')) {
            if (axis.key.visibility)
                canvasModel.increaseMarginSide(keyAxisOrient, labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING, keyAxisLabelVerticalLog);
        } else if (axis.value.visibility)
            canvasModel.increaseMarginSide(valueAxisOrient, labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING);
    }

    private recalcHorizontalMarginByAxisLabelWidth(labelSize: LabelSize, canvasModel: CanvasModel, orientation: ChartOrientation, axis: TwoDimensionalAxis, isShow: boolean): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, orientation, axis.key.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, orientation, axis.value.position);

        if ((keyAxisOrient === 'left' || keyAxisOrient === 'right') && isShow && axis.key.visibility) {
            canvasModel.increaseMarginSide(keyAxisOrient, labelSize.width + AXIS_VERTICAL_LABEL_PADDING, keyAxisLabelHorizontalLog);
        } else if ((valueAxisOrient === 'left' || valueAxisOrient === 'right') && axis.value.visibility) {
            canvasModel.increaseMarginSide(valueAxisOrient, labelSize.width + AXIS_VERTICAL_LABEL_PADDING);
        }
    }
}