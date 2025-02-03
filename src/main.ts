import { MdtChartsConfig, MdtChartsDataSource, NewSize, Size } from "./config/config";
import { DesignerConfig } from "./designer/designerConfig";
import { Engine } from "./engine/engine";
import { FilterCallback } from "./engine/filterManager/filterEventManager";
import { Model } from "./model/model";
import { assembleModel, getPreparedData } from "./model/modelBuilder";
import { PublicOptionsService } from "./optionsServices/publicOptionsService";

export interface IChart {
	/**
	 * Рендер графика
	 * @param parentElement родительский элемент для графика
	 */
	render(parentElement: HTMLElement): void;
	/**
	 * Удаление графика со страницы
	 */
	destroy(): void;
	/**
	 * Обновление графика для новых данных
	 * @param data Новые данные
	 */
	updateData(data: MdtChartsDataSource): void;
	/**
	 * Изменение размера блока с графиком
	 * @param newSize Новый размер
	 */
	updateSize(newSize: Size): void;
	/**
	 * Обновление цветов графиков на основе новых базовых цветов
	 * @param newColors Новые базовые цвета
	 */
	updateColors(newColors: string[]): void;
	/**
	 * Сброс выделения ключей
	 */
	clearSelection(): void;
}

export class Chart implements IChart {
	public static chartCounter = 0;

	private config: MdtChartsConfig;
	private designerConfig: DesignerConfig;
	private model: Model;
	private data: MdtChartsDataSource;
	private parentElement: HTMLElement;
	private isResizable: boolean;
	private readonly id: number;

	private engine: Engine;

	private resizeHandler = this.resizeListener.bind(this);
	/**
	 * @param config Объект конфигуратора
	 * @param designerConfig Объект конфигуратора дизайнера
	 * @param data Данные
	 * @param isResizable Флаг подстройки размера блока графика под родительский элемент
	 * @param filterCallback Функция коллбэк, вызываемая во время клика на элемент графика. Предназначена для обеспечения кросс-фильтрации
	 * @param selectedIds Id выделенных записей
	 */
	constructor(
		config: MdtChartsConfig,
		designerConfig: DesignerConfig,
		data: MdtChartsDataSource,
		isResizable: boolean = false,
		filterCallback: FilterCallback = null,
		selectedIds: number[] = []
	) {
		Chart.chartCounter++;
		this.id = Chart.chartCounter;
		this.config = config;
		this.designerConfig = designerConfig;
		this.data = data;
		this.isResizable = isResizable;

		this.model = assembleModel(this.config, this.data, this.designerConfig, this.id);
		this.engine = new Engine(this.id, filterCallback, selectedIds);
	}

	/**
	 * Рендер графика
	 * @param parentElement родительский элемент для графика
	 */
	public render(parentElement: HTMLElement): void {
		this.parentElement = parentElement;
		this.engine.render(this.model, getPreparedData(this.model, this.data, this.config), this.parentElement);

		if (this.isResizable) this.registerResizeEvent();
	}

	/**
	 * Удаление графика со страницы
	 */
	public destroy(): void {
		this.engine.destroy();

		if (this.isResizable) this.removeResizeEvent();
	}

	/**
	 * Обновление графика для новых данных
	 * @param data Новые данные
	 */
	public updateData(data: MdtChartsDataSource): void {
		this.model = assembleModel(this.config, data, this.designerConfig, this.id);
		this.data = data;
		this.engine.updateData(this.model, getPreparedData(this.model, this.data, this.config));
	}

	/**
	 * Изменение размера блока с графиком
	 * @param newSize Новый размер
	 */
	public updateSize(newSize: Partial<NewSize>): void {
		if (!PublicOptionsService.validateSize(newSize)) return;

		if (newSize.height) this.config.canvas.size.height = newSize.height;
		if (newSize.width) this.config.canvas.size.width = newSize.width;

		this.model = assembleModel(this.config, this.data, this.designerConfig, this.id);
		this.engine.updateFullBlock(this.model, getPreparedData(this.model, this.data, this.config));
	}

	/**
	 * Обновление цветов графиков на основе новых базовых цветов
	 * @param newColors Новые базовые цвета
	 */
	public updateColors(newColors: string[]): void {
		this.designerConfig.chartStyle.baseColors = [...newColors];
		this.model = assembleModel(this.config, this.data, this.designerConfig, this.id);
		this.engine.updateColors(this.model);
	}

	public clearSelection(): void {
		this.engine.clearSelection(this.model);
	}

	private registerResizeEvent(): void {
		window.addEventListener("resize", this.resizeHandler);
	}

	private removeResizeEvent(): void {
		window.removeEventListener("resize", this.resizeHandler);
	}

	private resizeListener(): void {
		this.updateSize({
			height: null,
			width: this.parentElement.offsetWidth
		});
	}
}

export * from "./config/config";
export * from "./designer/designerConfig";
export { FilterCallback } from "./engine/filterManager/filterEventManager";
