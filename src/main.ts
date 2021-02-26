import { Config, TwoDimensionalValueField, TwoDimensionalOptions, TwoDimensionalChartType, TwoDimensionalChart, TwoDimensionalAxis, PolarOptions, PolarChartType, PolarChart, NumberDomain, IntervalOptions, IntervalChartType, IntervalChart, IntervalAxis, EmbeddedLabelType, ChartType, ChartOrientation, ChartNotation, ChartBlockCanvas, AxisPosition } from "./config/config";
import { DesignerConfig, Formatter, DonutOptionsCanvas, DataTypeOptions, DataType, ChartStyleConfig, BarOptionsCanvas, AxisLabelCanvas } from "./designer/designerConfig";
import Engine from "./engine/engine";
import { DataSource, Model, Size } from "./model/model";
import { assembleModel, getPreparedData } from "./model/modelOptions";

class Chart {
    private config: Config;
    private designerConfig: DesignerConfig;
    private model: Model;
    private data: DataSource;
    private parentElement: HTMLElement;
    private isResizable: boolean;

    private resizeHandler = this.resizeListener.bind(this);

    private engine: Engine;

    constructor(config: Config, designerConfig: DesignerConfig, data: DataSource, isResizable: boolean = false) {
        this.config = config;
        this.designerConfig = designerConfig;
        this.data = data;
        this.isResizable = isResizable;

        this.model = assembleModel(this.config, this.data, this.designerConfig);
        this.engine = new Engine();
    }

    /**
     * Рендер графика
     * @param parentElement родительский элемент для графика 
     */
    public render(parentElement: HTMLElement): void {
        this.parentElement = parentElement;
        this.engine.render(this.model, getPreparedData(this.model, this.data, this.config), this.parentElement);

        if(this.isResizable)
            this.registerResizeEvent();
    }

    /**
     * Удаление графика со страницы
     */
    public destroy(): void {
        this.engine.destroy();

        if(this.isResizable)
            this.removeResizeEvent();
    }

    /**
     * Обновление графика для новых данных
     * @param data Новые данные
     */
    public updateData(data: DataSource): void {
        this.model = assembleModel(this.config, data, this.designerConfig);
        this.data = data;
        this.engine.updateData(this.model, getPreparedData(this.model, this.data, this.config));
    }

    /**
     * Изменение размера блока с графиком
     * @param newSize Новый размер
     */
    public updateSize(newSize: Size): void {
        if (newSize.height)
            this.config.canvas.size.height = newSize.height;
        if (newSize.width)
            this.config.canvas.size.width = newSize.width;

        this.model = assembleModel(this.config, this.data, this.designerConfig);
        this.engine.updateFullBlock(this.model, getPreparedData(this.model, this.data, this.config));
    }

    private registerResizeEvent(): void {
		window.addEventListener('resize', this.resizeHandler);
	}

	private removeResizeEvent(): void {
		window.removeEventListener('resize', this.resizeHandler);
	}

	private resizeListener() {
		this.updateSize({
			height: null,
			width: this.parentElement.offsetWidth
		});
	}
}

export{
    Chart,
    Engine,
    Config,
    TwoDimensionalOptions,
    TwoDimensionalChartType,
    TwoDimensionalChart,
    TwoDimensionalAxis,
    TwoDimensionalValueField,
    PolarOptions,
    PolarChartType,
    PolarChart,
    NumberDomain,
    IntervalOptions,
    IntervalChartType,
    IntervalChart,
    IntervalAxis,
    EmbeddedLabelType,
    ChartType,
    ChartOrientation,
    ChartNotation,
    ChartBlockCanvas,
    AxisPosition,
    DesignerConfig,
    Formatter,
    DonutOptionsCanvas,
    DataTypeOptions,
    DataType,
    ChartStyleConfig,
    BarOptionsCanvas,
    AxisLabelCanvas
}