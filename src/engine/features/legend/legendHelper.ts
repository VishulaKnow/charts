import { Selection, BaseType } from 'd3-selection'
import { ChartNotation } from "../../../config/config";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { Color } from "d3-color";
import { DataRow, DataSource, IntervalOptionsModel, LegendPosition, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';


export class LegendHelper {
    public static getLegendItemsContent(options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel, data: DataSource): string[] {
        if (options.type === '2d') {
            let texts: string[] = [];
            options.charts.forEach(chart => {
                texts = texts.concat(chart.data.valueFields.map(field => field.title));
            });
            return texts;
        } else if (options.type === 'polar') {
            return data[options.data.dataSource].map((record: DataRow) => record[options.data.keyField.name]);
        } else if (options.type === 'interval') {
            return options.charts.map(chart => chart.data.valueField1.name);
        }
    }

    public static getMarksColor(options: TwoDimensionalOptionsModel | PolarOptionsModel | IntervalOptionsModel): Color[] {
        if (options.type === '2d') {
            let colors: Color[] = [];
            options.charts.forEach(chart => {
                colors = colors.concat(chart.style.elementColors);
            });
            return colors;
        } else if (options.type === 'polar') {
            return options.charts.map(chart => chart.style.elementColors)[0];
        } else if (options.type === 'interval') {
            return options.charts.map(chart => chart.style.elementColors[0]);
        }
    }

    public static getMaxItemWidth(legendBlock: Selection<SVGForeignObjectElement, unknown, HTMLElement, any>, items: Selection<HTMLDivElement, string, BaseType, unknown>, itemsDirection: LegendItemsDirection): number {
        if (itemsDirection === 'row') {
            const margins = items.nodes().map(node => DomHelper.getPXValueFromString(DomHelper.getCssPropertyValue(node, 'margin-left')));
            const sumOfMargins = Helper.getSumOfNumeric(margins);
            return (parseFloat(legendBlock.attr('width')) - sumOfMargins) / items.size();
        }
        return parseFloat(legendBlock.attr('width'));
    }

    public static getItemClasses(itemsDirection: LegendItemsDirection, position: LegendPosition, index: number): string {
        let cssClasses = this.getLegendItemClassByDirection(itemsDirection);
        if (itemsDirection === 'column' && index !== 0)
            cssClasses += ` ${this.getLegendItemsMarginClass(position)}`;
        return cssClasses;
    }

    public static getLegendItemClassByDirection(itemsDirection: LegendItemsDirection): string {
        return itemsDirection === 'column' ? 'legend-item-row' : 'legend-item-inline';
    }

    public static getLegendItemsMarginClass(legendPosition: LegendPosition): string {
        return legendPosition === 'right' ? 'mt-15' : 'mt-10';
    }

    public static getLegendLabelClassByPosition(position: LegendPosition): string {
        if (position === 'top' || position === 'bottom')
            return 'legend-label legend-label-nowrap';
        return 'legend-label';
    }

    public static getLegendItemsDirection(chartNotation: ChartNotation, legendPosition: LegendPosition): LegendItemsDirection {
        if (legendPosition === 'right' || legendPosition === 'left')
            return 'column';
        else
            return chartNotation === 'polar' ? 'column' : 'row';
    }

    public static getSumOfItemsWidths(items: Selection<HTMLDivElement, string, BaseType, unknown>): number {
        let sumOfItemsWidth = Helper.getSumOfNumeric(items.nodes().map(node => node.getBoundingClientRect().width));
        sumOfItemsWidth += Helper.getSumOfNumeric(items.nodes().map(node => DomHelper.getPXValueFromString(DomHelper.getCssPropertyValue(node, 'margin-left'))));
        return sumOfItemsWidth;
    }
}