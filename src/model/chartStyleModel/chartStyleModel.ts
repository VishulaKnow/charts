import { Color } from "d3";

export class ChartStyleModel
{
    static getCssClasses(chartType: string, chartIndex: number): string[] {
        const cssClasses = [`chart-${chartIndex}`];
        if(chartType === 'line')
            cssClasses.concat(['line']);
        if(chartType === 'bar')
            cssClasses.concat(['bar']);
        if(chartType === 'area')
            cssClasses.concat(['area']);
        if(chartType === 'donut')
            cssClasses.concat(['donut']);
        return cssClasses
    }
    
    static getElementColorPallete(palette: Color[], notation: '2d' | 'polar', index: number = 0): Color[] {
        if(notation === '2d')
            return [palette[index % palette.length]];
        else
            return palette;
    }
}