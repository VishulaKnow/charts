import { ChartNotation, Size } from "../../../config/config";
import { LegendItemsDirection } from "../../../model/featuresModel/legendModel/legendCanvasModel";
import { Color } from "d3-color";
import { DataRow, DataSource, IntervalOptionsModel, LegendBlockModel, LegendPosition, Orient, PolarOptionsModel, TwoDimensionalOptionsModel } from "../../../model/model";
import { Helper } from '../../helpers/helper';
import { legendClasses } from './legendDomHelper';

export interface LegendCoordinate {
    x: number;
    y: number;
    height: number;
    width: number;
}
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

    public static getMaxItemWidth(legendBlockWidth: string, marginsLeft: number[], itemsDirection: LegendItemsDirection): number {
        if (itemsDirection === 'row') {

            const sumOfMargins = Helper.getSumOfNumeric(marginsLeft);
            return (parseFloat(legendBlockWidth) - sumOfMargins) / marginsLeft.length;
        }
        return parseFloat(legendBlockWidth);
        
    }

    public static getItemClasses(itemsDirection: LegendItemsDirection, position: LegendPosition, index: number): string {
        let cssClasses = this.getLegendItemClassByDirection(itemsDirection);
        if (itemsDirection === 'column' && index !== 0)
            cssClasses += ` ${this.getLegendItemsMarginClass(position)}`;
        return cssClasses;
    }

    public static getLegendItemClassByDirection(itemsDirection: LegendItemsDirection): string {
        return legendClasses.combineLegendClassWithAddition(legendClasses.legendItemClass,
            itemsDirection === 'column' ?  legendClasses.RowClassAddition : legendClasses.inlineClassAddition);
    }

    public static getLegendItemsMarginClass(legendPosition: LegendPosition): string {
        return legendPosition === 'right' ? 'mt-15' : 'mt-10';
    }

    public static getLegendLabelClassByPosition(position: LegendPosition): string {
        if (position === 'top' || position === 'bottom')
            return legendClasses.legendLabelClass + ' ' + 
            legendClasses.combineLegendClassWithAddition(legendClasses.legendLabelClass, legendClasses.nowrapClassAddition);
        return legendClasses.legendLabelClass;
    }

    public static getLegendItemsDirection(chartNotation: ChartNotation, legendPosition: LegendPosition): LegendItemsDirection {
        if (legendPosition === 'right' || legendPosition === 'left')
            return 'column';
        else
            return chartNotation === 'polar' ? 'column' : 'row';
    }


    public static getSumOfItemsWidths(itemsWidth: number[], marginsLeft: number[]): number {
        let sumOfItemsWidth = Helper.getSumOfNumeric(itemsWidth);
        sumOfItemsWidth += Helper.getSumOfNumeric(marginsLeft);

        return sumOfItemsWidth;
    }
    
    public static getLegendCoordinateByPosition(legendPosition: Orient, legendBlockModel: LegendBlockModel, blockSize: Size): LegendCoordinate {
        const legendModel = legendBlockModel[legendPosition];
        
        const coordinate: LegendCoordinate = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }

        if (legendPosition === 'left' || legendPosition === 'right') {
            coordinate.y = legendModel.margin.top + legendModel.pad;
            coordinate.width = legendModel.size;
            coordinate.height = blockSize.height - legendModel.margin.top - legendModel.margin.bottom;
        } else if (legendPosition === 'bottom' || legendPosition === 'top') {
            coordinate.x = legendModel.margin.left;
            coordinate.width = blockSize.width - legendModel.margin.left - legendModel.margin.right;
            coordinate.height = legendModel.size;
        }

        if (legendPosition === 'left')
            coordinate.x = legendModel.margin.left;
        else if (legendPosition === 'right')
            coordinate.x = blockSize.width - legendModel.size - legendModel.margin.right;
        else if (legendPosition === 'top')
            coordinate.y = legendModel.margin.top + legendModel.pad;
        else if (legendPosition === 'bottom')
            coordinate.y = blockSize.height - legendModel.size - legendModel.margin.bottom;

        return coordinate;
    }
}