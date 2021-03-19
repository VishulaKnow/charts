import { DataSource, IntervalOptionsModel, Model, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Block } from "../../block/block";
import { legendDomHelper } from "./legendDomHelper";
import { LegendHelper } from "./legendHelper";
export class Legend {
    public static render(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, model: Model): void {
        if (options.legend.position !== 'off') {
            const legendItemsContent = LegendHelper.getLegendItemsContent(options, data);
            const chartElementsColor = LegendHelper.getMarksColor(options);
            const legendItemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

            const legendObject = legendDomHelper.renderLegendObject(block, options.legend.position, model.otherComponents.legendBlock, model.blockCanvas.size);

            legendDomHelper.renderLegendContent(legendObject, legendItemsContent, chartElementsColor, legendItemsDirection, options.legend.position);
        }
    }

    public static update(block: Block, data: DataSource, options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel): void {
        if (options.legend.position !== 'off') {
            const legendItemsContent = LegendHelper.getLegendItemsContent(options, data);
            const chartElementsColor = LegendHelper.getMarksColor(options);
            const legendItemsDirection = LegendHelper.getLegendItemsDirection(options.type, options.legend.position);

            const legendObject = legendDomHelper.getLegendObject(block)

            legendDomHelper.removeLegendBlock(legendObject)

            legendDomHelper.renderLegendContent(legendObject, legendItemsContent, chartElementsColor, legendItemsDirection, options.legend.position);
        }
    }




}