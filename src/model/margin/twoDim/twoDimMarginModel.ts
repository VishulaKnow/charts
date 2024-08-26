import { DesignerConfig } from "../../../designer/designerConfig";
import { AxisModel, LabelSize } from "../../featuresModel/axisModel";
import { TwoDimLegendModel } from "../../featuresModel/legendModel/twoDimLegendModel";
import { keyAxisLabelHorizontalLog, keyAxisLabelVerticalLog } from "../../featuresModel/scaleModel/scaleAxisRecalcer";
import { OtherCommonComponents } from "../../model";
import { AxisType } from "../../modelBuilder";
import { CanvasModel } from "../../modelInstance/canvasModel/canvasModel";
import { TwoDimConfigReader } from "../../modelInstance/configReader";
import { ModelInstance } from "../../modelInstance/modelInstance";
import { TwoDimensionalModel } from "../../notations/twoDimensionalModel";

export const AXIS_HORIZONTAL_LABEL_PADDING = 15;
export const AXIS_VERTICAL_LABEL_PADDING = 10;

export class TwoDimMarginModel {
    private twoDimLegendModel = new TwoDimLegendModel(this.configReader);

    constructor(private designerConfig: DesignerConfig, private configReader: TwoDimConfigReader) { }

    recalcMargin(otherComponents: OtherCommonComponents, modelInstance: ModelInstance) {
        const canvasModel = modelInstance.canvasModel;

        this.twoDimLegendModel.recalcMarginWith2DLegend(modelInstance, otherComponents.legendBlock, this.configReader.options.legend);
        const labelSize = this.getMaxLabelSize(modelInstance);
        this.recalcVerticalMarginByAxisLabelHeight(labelSize, canvasModel);

        // Если встроенный лейбл показывает ключи, то лейблы оси ключей не показываются
        // При этом все графики должны иметь: embeddedLabels = 'key'
        // И все графики должны быть типа bar. 
        const showingFlag = this.configReader.options.type === '2d'
            ? !TwoDimensionalModel.getChartsEmbeddedLabelsFlag(this.configReader.options.charts, this.configReader.options.orientation)
            : true;

        this.recalcHorizontalMarginByAxisLabelWidth(labelSize, canvasModel, showingFlag);
    }

    public recalcMarginByVerticalAxisLabel(modelInstance: ModelInstance): void {
        if (this.configReader.options.orientation === 'vertical') {
            const dataModel = modelInstance.dataModel;

            const axisLabelSize = AxisModel.getLabelSize(this.designerConfig.canvas.axisLabel.maxSize.main, dataModel.getAllowableKeys());
            const axisConfig = AxisModel.getKeyAxisLabelPosition(modelInstance.canvasModel, dataModel.getAllowableKeys().length, this.configReader.options.axis.key);

            const marginOrient = this.configReader.options.axis.key.position === 'end' ? 'bottom' : 'top';

            if (axisConfig === 'rotated') {
                modelInstance.canvasModel.decreaseMarginSide(marginOrient, axisLabelSize.height);
                modelInstance.canvasModel.increaseMarginSide(marginOrient, axisLabelSize.width, keyAxisLabelVerticalLog);
            }
        }
    }

    private getMaxLabelSize(modelInstance: ModelInstance): LabelSize {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, this.configReader.options.orientation, this.configReader.options.axis.key.position);
        let labelsTexts: string[];

        if (keyAxisOrient === 'left' || keyAxisOrient === 'right') {
            labelsTexts = modelInstance.dataModel.repository.getValuesByKeyField();
        } else {
            labelsTexts = this.configReader.calculateBiggestValueAndDecremented(modelInstance.dataModel.repository)
                .map(v => this.configReader.getAxisLabelFormatter()(v).toString());
        }

        return AxisModel.getLabelSize(this.designerConfig.canvas.axisLabel.maxSize.main, labelsTexts);
    }

    private recalcVerticalMarginByAxisLabelHeight(labelSize: LabelSize, canvasModel: CanvasModel): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, this.configReader.options.orientation, this.configReader.options.axis.key.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, this.configReader.options.orientation, this.configReader.options.axis.value.position);

        if ((keyAxisOrient === 'bottom' || keyAxisOrient === 'top')) {
            if (this.configReader.options.axis.key.visibility)
                canvasModel.increaseMarginSide(keyAxisOrient, labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING, keyAxisLabelVerticalLog);
        } else if (this.configReader.options.axis.value.visibility)
            canvasModel.increaseMarginSide(valueAxisOrient, labelSize.height + AXIS_HORIZONTAL_LABEL_PADDING);
    }

    private recalcHorizontalMarginByAxisLabelWidth(labelSize: LabelSize, canvasModel: CanvasModel, isShow: boolean): void {
        const keyAxisOrient = AxisModel.getAxisOrient(AxisType.Key, this.configReader.options.orientation, this.configReader.options.axis.key.position);
        const valueAxisOrient = AxisModel.getAxisOrient(AxisType.Value, this.configReader.options.orientation, this.configReader.options.axis.value.position);

        if ((keyAxisOrient === 'left' || keyAxisOrient === 'right') && isShow && this.configReader.options.axis.key.visibility) {
            canvasModel.increaseMarginSide(keyAxisOrient, labelSize.width + AXIS_VERTICAL_LABEL_PADDING, keyAxisLabelHorizontalLog);
        } else if ((valueAxisOrient === 'left' || valueAxisOrient === 'right') && this.configReader.options.axis.value.visibility) {
            canvasModel.increaseMarginSide(valueAxisOrient, labelSize.width + AXIS_VERTICAL_LABEL_PADDING);
        }
    }
}