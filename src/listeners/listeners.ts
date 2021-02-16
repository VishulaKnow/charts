import Engine from '../engine/engine';
import { assembleModel, getPreparedData, getUpdatedModel } from '../model/modelOptions';
import { Config, IntervalOptions, PolarChart, PolarOptions, TwoDimensionalChart, TwoDimensionalOptions } from '../config/config'
import { DesignerConfig } from '../designer/designerConfig';
import { DataSource } from '../model/model';

class ListenersHelper
{
    static randInt(min: number, max: number): number {
        return Math.round(Math.random() * (max - min) + min);
    }
    static getCopy(obj: any) {
        const newObj: any = {};
        if(typeof obj === 'object') {
            for(let key in obj) {        
                if(Array.isArray(obj[key])) {
                    newObj[key] = this.getCopyOfArr(obj[key]);
                } else if(typeof obj[key] === 'object') {
                    newObj[key] = this.getCopy(obj[key]);
                } else {
                    newObj[key] = obj[key];
                }
            } 
        } else {
            return obj;
        }
        return newObj;
    }
    static getCopyOfArr(initial: any[]): any[] {
        const newArr: any[] = [];
        initial.forEach(d => newArr.push(this.getCopy(d)));
        return newArr;
    }
    static getInputValue(selector: string): string {
        return (document.querySelector(selector) as HTMLInputElement).value;
    }
    static setInputValue(selector: string, value: any): void {
        (document.querySelector(selector) as HTMLInputElement).value = value.toString();
    }
    static setCheckboxValue(selector: string, value: boolean): void {
        (document.querySelector(selector) as HTMLInputElement).checked = value;
    }
}

export default class Listeners
{
    private engine: Engine;
    private config: Config;
    private designerConfig: DesignerConfig;
    private data: DataSource

    constructor(engine: Engine, config: Config, designerConfig: DesignerConfig, data: DataSource) {
        this.engine = engine;
        this.config = config;
        this.designerConfig = designerConfig;
        this.data = data;

        this.setControlsValues();
        this.showControlsForNotation(this.config.options.type);
        this.setMainListeners();
        this.setDesignerListeners();
        this.setCommonListeners();
        this.setAxisListeners();
        this.set2DListeners();
    }

    private updateFull(): void {
        this.dropAxisDomain(this.config);
        const model = getUpdatedModel(this.config, this.data, this.designerConfig);
        const preparedData = getPreparedData(model, this.data, this.config);
        this.engine.updateFullBlock(model, preparedData);
    }
    private dropAxisDomain(config: Config) {
        if(config.options.type === '2d') {
            config.options.axis.valueAxis.domain.end = -1;
            config.options.axis.valueAxis.domain.start = -1;
        }
    }
    
    private showControlsForNotation(notationType: '2d' | 'polar' | 'interval'): void {
        if(notationType === '2d') {
            (document.querySelector('.block-polar') as HTMLElement).style.display = 'none';
            (document.querySelector('.block-2d') as HTMLElement).style.display = 'block';
            (document.querySelector('.block-axis') as HTMLElement).style.display = 'block';
        }
        else if(notationType === 'polar') {
            (document.querySelector('.block-2d') as HTMLElement).style.display = 'none';
            (document.querySelector('.block-polar') as HTMLElement).style.display = 'block';
            (document.querySelector('.block-axis') as HTMLElement).style.display = 'none';
        } else if(notationType === 'interval') {
            (document.querySelector('.block-polar') as HTMLElement).style.display = 'none';
            (document.querySelector('.block-2d') as HTMLElement).style.display = 'none';
            (document.querySelector('.block-axis') as HTMLElement).style.display = 'block';
        }
    }

    private getDataWithRandomValues(data: any, maxRand: number) {
        if(this.config.options.type === '2d')
            this.config.options.charts.forEach((chart: TwoDimensionalChart) => {
                data[chart.data.dataSource].forEach((row: any) => {
                    row[chart.data.valueFields[0].name] = ListenersHelper.randInt(0, maxRand);
                });
            });
        else if(this.config.options.type === 'polar') {
            this.config.options.charts.forEach((chart: PolarChart) => {
                data[chart.data.dataSource].forEach((row: any) => {
                    row[chart.data.valueField.name] = ListenersHelper.randInt(0, maxRand);
                });
            });
        }
        return data;
    }
    
    private getDataConfig(notationType: '2d' | 'polar' | 'interval'): any {
        if(notationType === '2d') {
            return {
                dataSource: ListenersHelper.getInputValue('#data-size') === 'normal' ? 'dataSet' : 'dataSet_large',
                keyField: {
                    name: 'brand',
                    format: 'string'
                },
                valueFields: [
                    {
                        name: 'price',
                        format: 'money',
                        title: 'Цена автомобилей на рынке'
                    },
                    {
                        name: 'count',
                        format: 'integer',
                        title: 'Количество автомобилей на душу населения'
                    }
                ]
            }
        } else if(notationType === 'interval') {
            return {
                dataSource: 'dataSet_gantt',
                keyField: {
                    name: 'task',
                    format: 'string'
                },
                valueField1: {
                    name: 'start',
                    format: 'date'
                },
                valueField2: {
                    name: 'end',
                    format: 'date'
                }
            }
        } else if(notationType === 'polar') {
            return {
                dataSource: ListenersHelper.getInputValue('#data-size') === 'normal' ? 'dataSet' : 'dataSet_large',
                keyField: {
                    name: 'brand',
                    format: 'string'
                },
                valueField: {
                    name: 'price',
                    format: 'money'
                }
            }
        }
    }
    
    private getTooltipConfig(notationType: '2d' | 'polar' | 'interval'): any {
        if(notationType === '2d' || notationType === 'polar') {
            return {
                data: {
                    fields: [
                        {
                            name: 'price',
                            format: 'money'
                        }
                    ]
                }
            }
        } else if(notationType === 'interval') {
            return {
                data: {
                    fields: [
                        {
                            format: 'date',
                            name: 'start'
                        },
                        {
                            format: 'date',
                            name: 'end'
                        }
                    ]
                }
            }
        }
    }
    
    private changeConfigOptions(notationType: '2d' | 'polar' | 'interval'): void {
        if(notationType === '2d') {
            const options: TwoDimensionalOptions = {
                legend: this.config.options.legend,
                isSegmented: false,
                orientation: ListenersHelper.getInputValue('#chart-orient') as 'horizontal' | 'vertical',
                type: notationType,
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        title: this.config.options.charts[0].title,
                        tooltip: this.getTooltipConfig(notationType),
                        type: ListenersHelper.getInputValue('#chart-2d-type') === 'barLine' ? 'bar' : ListenersHelper.getInputValue('#chart-2d-type') as 'line' | 'bar' | 'area',
                        embeddedLabels: 'none'
                    }
                ],
                axis: {
                    keyAxis: {
                        position: ListenersHelper.getInputValue('#key-axis-orient') as 'start' | 'end',
                        ticks: {
                            flag: false
                        }
                    },
                    valueAxis: {
                        domain: {
                            start: -1,
                            end: -1
                        },
                        position: ListenersHelper.getInputValue('#value-axis-orient') as "start" | "end",
                        ticks: {
                            flag: false
                        }
                    }
                },
                additionalElements: {
                    gridLine: {
                        flag: {
                            value: true,
                            key: false
                        }
                    }
                }
            }
            this.config.options = options;
        } else if(notationType === 'polar') {
            const options: PolarOptions = {
                legend: this.config.options.legend,
                type: notationType,
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        title: this.config.options.charts[0].title,
                        tooltip: this.getTooltipConfig(notationType),
                        type: 'donut'
                    }
                ]
            }
            this.config.options = options;
        } else if(notationType === 'interval') {
            const options: IntervalOptions = {
                legend: this.config.options.legend,
                orientation: ListenersHelper.getInputValue('#chart-orient') as 'horizontal' | 'vertical',
                type: notationType,
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        title: this.config.options.charts[0].title,
                        tooltip: this.getTooltipConfig(notationType),
                        type: 'gantt'
                    }
                ],
                axis: {
                    keyAxis: {
                        position: ListenersHelper.getInputValue('#key-axis-orient') as "start" | "end",
                        ticks: {
                            flag: false
                        }
                    },
                    valueAxis: {
                        position: ListenersHelper.getInputValue('#value-axis-orient') as "start" | "end",
                        ticks: {
                            flag: false
                        }
                    }
                },
                additionalElements: {
                    gridLine: {
                        flag: {
                            value: true,
                            key: false
                        }
                    }
                }
            }
            this.config.options = options;
        }
        this.updateFull();
    }
    
    private change2DChartConfig(chartType: 'bar' | 'line' | 'area' | 'barLine'): void {
        const config = this.config;
        if(chartType === 'barLine' && config.options.charts.length === 1) {
            config.options.charts.push(ListenersHelper.getCopy(config.options.charts[0]));
            config.options.charts[0].type = 'bar';
            config.options.charts[1].type = 'line';
            config.options.charts[1].data.dataSource = config.options.charts[0].data.dataSource + '2';
        } else if(chartType === 'barLine' && config.options.charts.length === 2) {
            config.options.charts[0].type = 'bar';
            config.options.charts[1].type = 'line';
            config.options.charts[1].data.dataSource = config.options.charts[0].data.dataSource + '2';
        } else if(chartType !== 'barLine') {
            config.options.charts.splice(1, 1);
            config.options.charts[0].type = chartType;
        }
    }
    
    private setMainListeners(): void {
        const thisClass = this;
        document.querySelector('#notation').addEventListener('change', function() {
            thisClass.showControlsForNotation(this.value);
            thisClass.changeConfigOptions(this.value);
            thisClass.setControlsValues();
        });
        document.querySelector('#block-width').addEventListener('input', function(e) {
            thisClass.config.canvas.size.width = parseFloat(ListenersHelper.getInputValue('#block-width')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#block-height').addEventListener('input', function(e) {
            thisClass.config.canvas.size.height = parseFloat(ListenersHelper.getInputValue('#block-height')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#wrapper-border').addEventListener('change', function() {
            if(this.checked) {
                thisClass.config.canvas.class += ' outline';
            } else {
                thisClass.config.canvas.class = thisClass.config.canvas.class.replace('outline', '');
            } 
            thisClass.updateFull();
        });
    }
    
    private setDesignerListeners(): void {
        const thisClass = this;
        document.querySelector('#axis-label-width').addEventListener('input', function() {
            thisClass.designerConfig.canvas.axisLabel.maxSize.main = parseFloat(ListenersHelper.getInputValue('#axis-label-width'));
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-margin-top').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartBlockMargin.top = parseFloat(ListenersHelper.getInputValue('#chart-block-margin-top')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-margin-bottom').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartBlockMargin.bottom = parseFloat(ListenersHelper.getInputValue('#chart-block-margin-bottom')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-margin-left').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartBlockMargin.left = parseFloat(ListenersHelper.getInputValue('#chart-block-margin-left')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-margin-right').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartBlockMargin.right = parseFloat(ListenersHelper.getInputValue('#chart-block-margin-right')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#bar-distance').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.bar.barDistance = parseFloat(ListenersHelper.getInputValue('#bar-distance')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#min-bar-group-distance').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.bar.groupMinDistance = parseFloat(ListenersHelper.getInputValue('#min-bar-group-distance'));        
            thisClass.updateFull();
        });
        document.querySelector('#max-bar-group-distance').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.bar.groupMaxDistance = parseFloat(ListenersHelper.getInputValue('#max-bar-group-distance'));        
            thisClass.updateFull();
        });
        document.querySelector('#min-bar-size').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.bar.minBarWidth = parseFloat(ListenersHelper.getInputValue('#min-bar-size')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#max-bar-size').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.bar.maxBarWidth = parseFloat(ListenersHelper.getInputValue('#max-bar-size')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#min-donut-part-size').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.donut.minPartSize = parseFloat(ListenersHelper.getInputValue('#min-donut-part-size')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('.btn-base-color').addEventListener('click', function() {
            // thisClass.designerConfig.chart.style.palette[0] = color(ListenersHelper.getInputValue('#base-color'));
            thisClass.updateFull();
        });
        document.querySelector('#designer-key-grid').addEventListener('change', function() {
            thisClass.designerConfig.additionalElements.gridLine.flag.key = this.checked;
            thisClass.updateFull();
        });
        document.querySelector('#designer-value-grid').addEventListener('change', function() {
            thisClass.designerConfig.additionalElements.gridLine.flag.value = this.checked;
            thisClass.updateFull();
        });
        document.querySelector('#pad-angle').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.donut.padAngle = parseFloat(ListenersHelper.getInputValue('#pad-angle'));
            thisClass.updateFull();
        });
        document.querySelector('#donut-min-thickness').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.donut.minThickness = parseFloat(ListenersHelper.getInputValue('#donut-min-thickness'));
            thisClass.updateFull();
        });
        document.querySelector('#donut-max-thickness').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.donut.maxThickness = parseFloat(ListenersHelper.getInputValue('#donut-max-thickness'));
            thisClass.updateFull();
        });
    }
    
    private setCommonListeners(): void {
        const thisClass = this;
        const config = this.config
        document.querySelector('#data-size').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'polar') {
                config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart, index: number) => {
                    chart.data.dataSource = this.value === 'normal' 
                        ? 'dataSet' + (index === 0 ? '' : index + 1)
                        : 'dataSet_large' + (index === 0 ? '' : index + 1);
                });
                thisClass.updateFull();
            }
        });
        document.querySelector('#legend').addEventListener('change', function() {
            config.options.legend.position = this.value;
            thisClass.updateFull();
        });
        document.querySelector('.btn-random').addEventListener('click', function() {
            if(config.options.type === '2d' || config.options.type === 'polar') {
                const max = parseInt(ListenersHelper.getInputValue('#max-random-value')) || 120;
                const copy = ListenersHelper.getCopy(thisClass.data);
                const newData = thisClass.getDataWithRandomValues(copy, max);
                if(config.options.type === '2d') {
                    config.options.axis.valueAxis.domain.start = -1;
                    config.options.axis.valueAxis.domain.end = max;
                }
                const model = getUpdatedModel(thisClass.config, newData, thisClass.designerConfig);
                const preparedData = getPreparedData(model, newData, config);
                thisClass.engine.updateFullBlock(model, preparedData);
            }
        });
        document.querySelector('#max-random-value').addEventListener('keydown', function(e: KeyboardEvent) {
            if(e.code === 'Enter' && (config.options.type === '2d' || config.options.type === 'polar')) {
                const max = parseInt(ListenersHelper.getInputValue('#max-random-value')) || 120;
                const copy = ListenersHelper.getCopy(thisClass.data);
                const newData = thisClass.getDataWithRandomValues(copy, max);
                if(config.options.type === '2d') {
                    config.options.axis.valueAxis.domain.start = -1;
                    config.options.axis.valueAxis.domain.end = max;
                }
                const model = getUpdatedModel(thisClass.config, newData, thisClass.designerConfig);
                const preparedData = getPreparedData(model, newData, config);
                thisClass.engine.updateFullBlock(model, preparedData);
            }
        });
    }
    
    private set2DListeners(): void {
        const thisClass = this;
        const config = this.config;
        document.querySelector('#chart-2d-type').addEventListener('change', function() {
            if(config.options.type === '2d') {
                thisClass.change2DChartConfig(this.value);
                thisClass.updateFull();
            }
        });
        document.querySelector('#embedded-labels').addEventListener('change', function() {
            if(config.options.type === '2d') {
                config.options.charts.forEach(chart => chart.embeddedLabels = this.value);
                thisClass.updateFull();
            }
        });
        document.querySelector('.btn-domain').addEventListener('click', function() {
            if(config.options.type === '2d') {
                const start = ListenersHelper.getInputValue('#domain-start');
                const end = ListenersHelper.getInputValue('#domain-end');
                config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                thisClass.engine.updateValueAxis(getUpdatedModel(thisClass.config, thisClass.data, thisClass.designerConfig), thisClass.data);
            }
        });
        document.querySelector('#domain-start').addEventListener('keydown', function(e: KeyboardEvent) {
            if(e.code === 'Enter') {
                if(config.options.type === '2d') {
                    const start = ListenersHelper.getInputValue('#domain-start');
                    const end = ListenersHelper.getInputValue('#domain-end');
                    config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                    config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                    thisClass.engine.updateValueAxis(getUpdatedModel(thisClass.config, thisClass.data, thisClass.designerConfig), thisClass.data);
                }
            }
        });
        document.querySelector('#domain-end').addEventListener('keydown', function(e: KeyboardEvent) {
            if(e.code === 'Enter') {
                if(config.options.type === '2d') {
                    const start = ListenersHelper.getInputValue('#domain-start');
                    const end = ListenersHelper.getInputValue('#domain-end');
                    config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                    config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                    thisClass.engine.updateValueAxis(getUpdatedModel(thisClass.config, thisClass.data, thisClass.designerConfig), thisClass.data);
                }
            }
        });
        document.querySelector('#is-segmented').addEventListener('change', function() {
            if(config.options.type === '2d') {
                config.options.isSegmented = this.checked;
                thisClass.updateFull();
            }
        });
    }
    
    private setAxisListeners(): void {
        const thisClass = this;
        const config = this.config;
        document.querySelector('#chart-orient').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'interval') {
                config.options.orientation = this.value; 
                thisClass.updateFull();
            }
        });
        document.querySelector('#key-axis-orient').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.keyAxis.position = this.value;
                thisClass.updateFull();
            }
        });
        document.querySelector('#value-axis-orient').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.valueAxis.position = this.value;
                thisClass.updateFull();
            }
        });
        document.querySelector('#config-key-grid').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'interval') {
                config.options.additionalElements.gridLine.flag.key = this.checked;
                thisClass.updateFull();
            }
        });
        document.querySelector('#config-value-grid').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'interval') {
                config.options.additionalElements.gridLine.flag.value = this.checked;
                thisClass.updateFull();
            }
        });
        document.querySelector('#config-tick-key').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.keyAxis.ticks.flag = this.checked;
                thisClass.updateFull();
            }
        });
        document.querySelector('#config-tick-value').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.valueAxis.ticks.flag = this.checked;
                thisClass.updateFull();
            }
        });
    }
    
    private setControlsValues(): void {
        const config = this.config;
        const designerConfig = this.designerConfig;

        ListenersHelper.setInputValue('#notation', config.options.type);
        ListenersHelper.setInputValue('#block-width', config.canvas.size.width);
        ListenersHelper.setInputValue('#block-height', config.canvas.size.height);
        ListenersHelper.setCheckboxValue('#wrapper-border', config.canvas.class.includes('outline'));
    
        ListenersHelper.setInputValue('#legend', config.options.legend.position);
        ListenersHelper.setInputValue('#data-size', config.options.charts[0].data.dataSource.includes('large') ? 'large' : 'normal');
        ListenersHelper.setInputValue('#axis-label-width', designerConfig.canvas.axisLabel.maxSize.main);
        ListenersHelper.setInputValue('#chart-block-margin-top', designerConfig.canvas.chartBlockMargin.top);
        ListenersHelper.setInputValue('#chart-block-margin-bottom', designerConfig.canvas.chartBlockMargin.bottom);
        ListenersHelper.setInputValue('#chart-block-margin-left', designerConfig.canvas.chartBlockMargin.left);
        ListenersHelper.setInputValue('#chart-block-margin-right', designerConfig.canvas.chartBlockMargin.right);
        ListenersHelper.setInputValue('#min-bar-group-distance', designerConfig.canvas.chartOptions.bar.groupMinDistance);
        ListenersHelper.setInputValue('#max-bar-group-distance', designerConfig.canvas.chartOptions.bar.groupMaxDistance);
        ListenersHelper.setInputValue('#bar-distance', designerConfig.canvas.chartOptions.bar.barDistance);
        ListenersHelper.setInputValue('#min-bar-size', designerConfig.canvas.chartOptions.bar.minBarWidth);
        ListenersHelper.setInputValue('#max-bar-size', designerConfig.canvas.chartOptions.bar.maxBarWidth);
        ListenersHelper.setInputValue('#min-donut-part-size', designerConfig.canvas.chartOptions.donut.minPartSize);
        // ListenersHelper.setInputValue('#base-color', designerConfig.chart.style.palette[0]);
        ListenersHelper.setCheckboxValue('#designer-key-grid', designerConfig.additionalElements.gridLine.flag.key);
        ListenersHelper.setCheckboxValue('#designer-value-grid', designerConfig.additionalElements.gridLine.flag.value);
        ListenersHelper.setInputValue('#pad-angle', designerConfig.canvas.chartOptions.donut.padAngle);
        ListenersHelper.setInputValue('#donut-min-thickness', designerConfig.canvas.chartOptions.donut.minThickness);
        ListenersHelper.setInputValue('#donut-max-thickness', designerConfig.canvas.chartOptions.donut.maxThickness);
        
        if(config.options.type === '2d') {
            ListenersHelper.setInputValue('#chart-2d-type', config.options.charts[0].type);
            ListenersHelper.setInputValue('#chart-orient', config.options.orientation);
            ListenersHelper.setInputValue('#key-axis-orient', config.options.axis.keyAxis.position);
            ListenersHelper.setInputValue('#value-axis-orient', config.options.axis.valueAxis.position);
            ListenersHelper.setCheckboxValue('#config-value-grid', config.options.additionalElements.gridLine.flag.value);
            ListenersHelper.setCheckboxValue('#config-key-grid', config.options.additionalElements.gridLine.flag.key);
            ListenersHelper.setCheckboxValue('#config-tick-key', config.options.axis.keyAxis.ticks.flag);
            ListenersHelper.setCheckboxValue('#config-tick-value', config.options.axis.valueAxis.ticks.flag);
            ListenersHelper.setCheckboxValue('#is-segmented', config.options.isSegmented);
            ListenersHelper.setInputValue('#embedded-labels', config.options.charts[0].embeddedLabels);
        } else if(config.options.type === 'polar') {
            ListenersHelper.setInputValue('#chart-polar-type', config.options.charts[0].type);
        }
    }
}

import '../style/main.css'
import config from '../config/configOptions';
import designerConfig from '../designer/designerConfigOptions';
import { Chart } from '../main';

const data = require('../assets/dataSet.json');

const model = assembleModel(config, data, designerConfig);
const engine = new Engine();
engine.render(model, getPreparedData(model, data, config), document.querySelector('.main-wrapper'));
new Listeners(engine, config, designerConfig, data);

// const chart = new Chart(config, designerConfig, data);
// chart.render(document.querySelector('.main-wrapper'));

const config3 = require('../config/configTest2D.json');
const model3 = assembleModel(config3, data, designerConfig);
const engine3 = new Engine();
engine3.render(model3, getPreparedData(model3, data, config3), document.querySelector('.main-wrapper2'));

const config2 = require('../config/configTestPolar.json');
const model2 = assembleModel(config2, data, designerConfig);
const engine2 = new Engine();
engine2.render(model2, getPreparedData(model2, data, config2), document.querySelector('.main-wrapper2'));
