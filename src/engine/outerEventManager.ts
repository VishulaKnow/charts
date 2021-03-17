import { AxisScale } from "d3-axis";
import { pointer, select } from "d3-selection";
import { ChartOrientation } from "../config/config";
import { BlockMargin, TwoDimensionalChartModel, OptionsModelData, ScaleKeyModel, Size, TwoDimensionalOptionsModel, PolarOptionsModel, Model, DataRow } from "../model/model";
import { Block } from "./block/block";
import { ElementHighlighter } from "./elementHighlighter";
import { TipBox } from "./features/tipBox/tipBox";
import { TipBoxHelper } from "./features/tipBox/tipBoxHelper";
import { NamesManager } from "./namesManager";
import { Donut } from "./polarNotation/donut/donut";
import { DonutHelper } from "./polarNotation/donut/DonutHelper";

export class OuterEventManager {
    private block: Block;
    private selectedKeys: string[];

    constructor(block: Block) {
        this.block = block;
        this.selectedKeys = [];
    }

    public registerEvents(model: Model, options: TwoDimensionalOptionsModel | PolarOptionsModel, scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size): void {
        if (options.type === '2d') {
            this.registerEventFor2D(scaleKey, margin, blockSize, options.charts, options.orient, options.data, options.scale.scaleKey)
        }
        if(options.type === 'polar')
            this.registerEventToDonut(model, margin, blockSize)

    }
    public registerEventToDonut(model: Model, margin: BlockMargin, blockSize: Size): void {
        const thisClass = this
        const arcItems = Donut.getAllArcGroups(this.block);
        const donutThickness = DonutHelper.getThickness(model.chartSettings.donut, model.blockCanvas.size, model.chartBlock.margin)

        arcItems.on('click', function(event, dataRow){
            const keyValue = dataRow.data[Object.keys(dataRow.data)[0]];
            
            if (thisClass.selectedKeys.findIndex(key => key === keyValue) === -1) {
                thisClass.addKey(keyValue);
                ElementHighlighter.changeDonutHighlightAppearance(select(this), margin, blockSize, donutThickness, thisClass.block.transitionManager.durations.donutHover, true);
  
            } else {
                thisClass.removeKey(keyValue);
                // ElementHighlighter.remove2DElementHighlighting(thisClass.block, dataOptions.keyField.name, keyValue, charts, filterId, 0);
            }
        
        })
    }

    public registerEventFor2D(scaleKey: AxisScale<any>, margin: BlockMargin, blockSize: Size, charts: TwoDimensionalChartModel[], chartOrientation: ChartOrientation, dataOptions: OptionsModelData, scaleKeyModel: ScaleKeyModel): void {
        const tipBoxAttributes = TipBox.getTipBoxAttributes(margin, blockSize);
        const tipBox = TipBox.renderTipBox(this.block, tipBoxAttributes);

        //TODO: выделить в отдельную прослойку
        const filterId = NamesManager.getId('shadow', this.block.id);
        ElementHighlighter.renderShadowFilter(this.block, filterId);

        const thisClass = this;

        tipBox.on('click', function (event) {
            const index = TipBoxHelper.getKeyIndex(pointer(event, this), chartOrientation, margin, blockSize, scaleKey, scaleKeyModel.type);
            const keyValue = scaleKey.domain()[index];

            if (thisClass.selectedKeys.findIndex(key => key === keyValue) === -1) {
                thisClass.addKey(keyValue);
                ElementHighlighter.highlightElementsOf2D(thisClass.block, dataOptions.keyField.name, keyValue, charts, filterId, 0);
            } else {
                thisClass.removeKey(keyValue);
                ElementHighlighter.remove2DElementHighlighting(thisClass.block, dataOptions.keyField.name, keyValue, charts, filterId, 0);
            }
        });
    }

    private addKey(keyValue: string): void {
        this.selectedKeys.push(keyValue);
    }

    private removeKey(keyValue: string): void {
        const selectedKeys = this.selectedKeys;
        selectedKeys.splice(selectedKeys.findIndex(key => key === keyValue), 1);
    }
}