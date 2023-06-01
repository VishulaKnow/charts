import { MdtChartsDataSource, MdtChartsTwoDimensionalOptions } from "../../../config/config";
import { DesignerConfig } from "../../../designer/designerConfig";
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

    constructor(private designerConfig: DesignerConfig, private options: MdtChartsTwoDimensionalOptions) { }

    recalcMargin(otherComponents: OtherCommonComponents, modelInstance: ModelInstance) {
        const canvasModel = modelInstance.canvasModel;

        this.twoDimLegendModel.recalcMarginWith2DLegend(modelInstance, otherComponents.legendBlock, this.options.legend);
        const labelSize = this.getHorizontalMarginByAxisLabels(modelInstance);
        this.recalcVerticalMarginByAxisLabelHeight(labelSize, canvasModel);

        // Если встроенный лейбл показывает ключи, то лейблы оси ключей не показываются
        // При этом все графики должны иметь: embeddedLabels = 'key'
        // И все графики должны быть типа bar. 
        const showingFlag = this.options.type === '2d'
            ? !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(this.options.charts, this.options.orientation)
            : true;

        this.recalcHorizontalMarginByAxisLabelWidth(labelSize, canvasModel, showingFlag);
    }

    public recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance): void {
        if (this.options.orientation === 'vertical') {
            const dataModel = modelInstance.dataModel;

            const axisLabelSize = AxisModel.getLabelSize(this.designerConfig.canvas.axisLabel.maxSize.main, dataModel.getAllowableKeys());
            const axisConfig = AxisModel.getKeyAxisLabelPosition(modelInstance.canvasModel, dataModel.getAllowableKeys().length, this.options.axis.key);

            const marginOrient = this.options.axis.key.position === 'end' ? 'bottom' : 'top';

            if (axisConfig === 'rotated') {
                modelInstance.canvasModel.decreaseMarginSide(marginOrient, axisLabelSize.height);
                modelInstance.canvasModel.increaseMarginSide(marginOrient, axisLabelSize.width, keyAxisLabelVerticalLog);
            }
        }
    }

    private getHorizontalMarginByAxisLabels(modelInstance: ModelInstance): LabelSize {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, this.options.orientation, this.options.axis.key.position);
        let labelsTexts: string[];

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            labelsTexts = modelInstance.dataModel.getAllKeys();
        } else {
            labelsTexts = ['0000'];
        }

        return AxisModel.getLabelSize(this.designerConfig.canvas.axisLabel.maxSize.main, labelsTexts);
    }

    private recalcVerticalMarginByAxisLabelHeight(labelSize: LabelSize, canvasModel: CanvasModel): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, this.options.orientation, this.options.axis.key.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, this.options.orientation, this.options.axis.value.position);

        if ((keyAxisOrient === 'bottom' || keyAxisOrient === 'top')) {
            if (this.options.axis.key.visibility)
                canvasModel.increaseMarginSide(keyAxisOrient, labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING, keyAxisLabelVerticalLog);
        } else if (this.options.axis.value.visibility)
            canvasModel.increaseMarginSide(valueAxisOrient, labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING);
    }

    private recalcHorizontalMarginByAxisLabelWidth(labelSize: LabelSize, canvasModel: CanvasModel, isShow: boolean): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, this.options.orientation, this.options.axis.key.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, this.options.orientation, this.options.axis.value.position);

        if ((keyAxisOrient === 'left' || keyAxisOrient === 'right') && isShow && this.options.axis.key.visibility) {
            canvasModel.increaseMarginSide(keyAxisOrient, labelSize.width + AXIS_VERTICAL_LABEL_PADDING, keyAxisLabelHorizontalLog);
        } else if ((valueAxisOrient === 'left' || valueAxisOrient === 'right') && this.options.axis.value.visibility) {
            canvasModel.increaseMarginSide(valueAxisOrient, labelSize.width + AXIS_VERTICAL_LABEL_PADDING);
        }
    }
}