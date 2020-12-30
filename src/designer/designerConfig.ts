import { Color } from "d3";

export interface DesignerConfig {
    canvas: Canvas;
    chart: ChartOptions;
    dataFormat: DataFormat;
}

interface BlockMargin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface Canvas {
    axisLabel: AxisLabelCanvas;
    chartBlockMargin: BlockMargin;
    legendBlock: LegendBlockCanvas;
    chartOptions: ChartOptionsCanvas;
}
interface ChartOptionsCanvas {
    bar: BarOptionsCanvas;
}
interface BarOptionsCanvas {
    minBarWidth: number;
    barDistance: number;
}
interface LegendBlockCanvas {
    maxWidth: number;
}
export interface AxisLabelCanvas {
    maxSize: AxisLabelSize;
}
interface AxisLabelSize {
    main: number;
    orthogonal: number;
}

interface ChartOptions {
    style: ChartStyle;
}
interface ChartStyle {
    palette: Color[];
}

interface DataFormat {
    formatters: {
        [field: string]: (value: any) => string
    }
}