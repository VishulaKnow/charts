import Engine from '../engine/engine';
import { getPreparedData, getUpdatedModel } from '../model/modelOptions';
import { Config, IntervalChart, IntervalOptions, PolarChart, PolarOptions, TwoDimensionalChart, TwoDimensionalOptions } from '../config/config'
import { color } from 'd3';
import { DesignerConfig } from '../designer/designerConfig';
const data = require('../assets/dataSet.json');

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

export class Listeners
{
    private engine: Engine;
    private config: Config;
    private designerConfig: DesignerConfig;

    constructor(engine: Engine, config: Config, designerConfig: DesignerConfig) {
        this.engine = engine;
        this.config = config;
        this.designerConfig = designerConfig;

        this.setControlsValues();
        this.showControlsForNotation(config.options.type);
        this.setMainListeners();
        this.setDesignerListeners();
        this.setCommonListeners();
        this.setAxisListeners();
        this.set2DListeners();
        this.setPolarListeners();
    }

    public updateFull(): void {
        this.dropAxisDomain(this.config);
        const model = getUpdatedModel(this.config);
        const preparedData = getPreparedData(model, data, this.config);
        this.engine.updateFullBlock(model, preparedData);
    }
    public dropAxisDomain(config: Config) {
        if(config.options.type === '2d') {
            config.options.axis.valueAxis.domain.end = -1;
            config.options.axis.valueAxis.domain.start = -1;
        }
    }
    
    public showControlsForNotation(notationType: '2d' | 'polar' | 'interval'): void {
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

    public getDataWithRandomValues(data: any, maxRand: number) {
        if(this.config.options.type === 'polar' || this.config.options.type === '2d')
            this.config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart) => {
                data[chart.data.dataSource].forEach((row: any) => {
                    row[chart.data.valueField.name] = ListenersHelper.randInt(0, maxRand);
                });
            });
        return data;
    }
    
    public getDataConfig(notationType: '2d' | 'polar' | 'interval'): any {
        if(notationType === '2d' || notationType === 'polar') {
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
        } else {
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
        }
    }
    
    public getTooltipConfig(notationType: '2d' | 'polar' | 'interval'): any {
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
    
    public changeConfigOptions(notationType: '2d' | 'polar' | 'interval'): void {
        if(notationType === '2d') {
            const options: TwoDimensionalOptions = {
                type: notationType,
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        legend: this.config.options.charts[0].legend,
                        title: this.config.options.charts[0].title,
                        tooltip: this.getTooltipConfig(notationType),
                        orientation: ListenersHelper.getInputValue('#chart-orient') as 'horizontal' | 'vertical',
                        type: ListenersHelper.getInputValue('#chart-2d-type') as "area" | "line" | "bar"
                    }
                ],
                axis: {
                    keyAxis: {
                        position: ListenersHelper.getInputValue('#key-axis-orient') as "start" | "end",
                        ticks: {
                            flag: true
                        }
                    },
                    valueAxis: {
                        domain: {
                            start: -1,
                            end: -1
                        },
                        position: ListenersHelper.getInputValue('#value-axis-orient') as "start" | "end",
                        ticks: {
                            flag: true
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
            if((options.charts[0].type === 'line' || options.charts[0].type === 'bar') && options.charts.length === 1) {
                options.charts.push(ListenersHelper.getCopy(options.charts[0]));
                options.charts[1].data.dataSource = options.charts[0].data.dataSource + '2';
            } else if((options.charts[0].type === 'line' || options.charts[0].type === 'bar') && options.charts.length === 2) {
                options.charts[1] = ListenersHelper.getCopy(options.charts[0]);
                options.charts[1].data.dataSource = options.charts[0].data.dataSource + '2';
            }
            this.config.options = options;
        } else if(notationType === 'polar') {
            const options: PolarOptions = {
                type: notationType,
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        legend: this.config.options.charts[0].legend,
                        title: this.config.options.charts[0].title,
                        tooltip: this.getTooltipConfig(notationType),
                        type: 'donut',
                        appearanceOptions: {
                            innerRadius: parseFloat(ListenersHelper.getInputValue('#inner-radius')) || 0,
                            padAngle: parseFloat(ListenersHelper.getInputValue('#pad-angle')) || 0
                        }
                    }
                ]
            }
            this.config.options = options;
        } else if(notationType === 'interval') {
            const options: IntervalOptions = {
                type: notationType,
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        legend: this.config.options.charts[0].legend,
                        title: this.config.options.charts[0].title,
                        tooltip: this.getTooltipConfig(notationType),
                        orientation: ListenersHelper.getInputValue('#chart-orient') as 'horizontal' | 'vertical',
                        type: 'gantt'
                    }
                ],
                axis: {
                    keyAxis: {
                        position: ListenersHelper.getInputValue('#key-axis-orient') as "start" | "end",
                        ticks: {
                            flag: true
                        }
                    },
                    valueAxis: {
                        position: ListenersHelper.getInputValue('#value-axis-orient') as "start" | "end",
                        ticks: {
                            flag: true
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
        this.updateFull()
    }
    
    public change2DChartConfig(chartType: 'bar' | 'line' | 'area'): void {
        const config = this.config;
        if(chartType === 'area') {
            if(config.options.charts.length !== 1)
                config.options.charts.splice(1, config.options.charts.length - 1);
            config.options.charts[0].type = chartType;
        } else if((chartType === 'bar' || chartType === 'line') && config.options.charts.length === 1) {
            config.options.charts.push(ListenersHelper.getCopy(config.options.charts[0]));
            config.options.charts.forEach((chart: any) => chart.type = chartType);
            config.options.charts[1].data.dataSource = config.options.charts[0].data.dataSource + '2';
        } else if((chartType === 'bar' || chartType === 'line') && config.options.charts.length === 2) {
            config.options.charts.forEach((chart: any) => chart.type = chartType);
            config.options.charts[1].data.dataSource = config.options.charts[0].data.dataSource + '2';
        }
    }
    
    public setMainListeners(): void {
        const thisClass = this;
        document.querySelector('#notation').addEventListener('change', function() {
            thisClass.showControlsForNotation(this.value);
            thisClass.changeConfigOptions(this.value);
            thisClass.setControlsValues();
        });
        document.querySelector('#block-width').addEventListener('input', function(e: KeyboardEvent) {
            thisClass.config.canvas.size.width = parseFloat(ListenersHelper.getInputValue('#block-width')) || 0;
            thisClass.updateFull()
        });
        document.querySelector('#block-height').addEventListener('input', function(e: KeyboardEvent) {
            thisClass.config.canvas.size.height = parseFloat(ListenersHelper.getInputValue('#block-height')) || 0;
            thisClass.updateFull()
        });
        // document.querySelector('#wrapper-border').addEventListener('change', function() {
        //     if(this.checked)
        //         thisClass.config.canvas.class = 'svg-chart outline';
        //     else 
        //         thisClass.config.canvas.class = 'svg-chart';
        //     thisClass.updateFull()
        // });
    }
    
    public setDesignerListeners(): void {
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
        document.querySelector('#bar-group-distance').addEventListener('input', function() {
            thisClass.designerConfig.canvas.chartOptions.bar.groupDistance = parseFloat(ListenersHelper.getInputValue('#bar-group-distance'));        
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
            thisClass.designerConfig.chart.style.palette[0] = color(ListenersHelper.getInputValue('#base-color'));
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
    }
    
    public setCommonListeners(): void {
        const thisClass = this;
        const config = this.config
        document.querySelector('#data-size').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'polar') {
                config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart, index: number) => {
                    chart.data.dataSource = this.value === 'normal' 
                        ? 'dataSet' + (index === 0 ? '' : `${index + 1}`)
                        : 'dataSet_large' + (index === 0 ? '' : `${index + 1}`);
                });
                thisClass.updateFull()
            }
        });
        document.querySelector('#legend').addEventListener('change', function() {
            config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart | IntervalChart) => {
                chart.legend.position = this.value;
            });
            thisClass.updateFull()
        });
        document.querySelector('.btn-random').addEventListener('click', function() {
            const max = parseInt(ListenersHelper.getInputValue('#max-random-value')) || 120;
            const copy = ListenersHelper.getCopy(data);
            const newData = thisClass.getDataWithRandomValues(copy, max);
            if(config.options.type === '2d') {
                config.options.axis.valueAxis.domain.start = -1;
                config.options.axis.valueAxis.domain.end = max;
            }
            const model = getUpdatedModel(newData);
            const preparedData = getPreparedData(model, newData, config);
            thisClass.engine.updateFullBlock(model, preparedData);
        });
        document.querySelector('#max-random-value').addEventListener('keydown', function(e: KeyboardEvent) {
            if(e.code === 'Enter') {
                const max = parseInt(ListenersHelper.getInputValue('#max-random-value')) || 120;
                const copy = ListenersHelper.getCopy(data);
                const newData = thisClass.getDataWithRandomValues(copy, max);
                if(config.options.type === '2d') {
                    config.options.axis.valueAxis.domain.start = -1;
                    config.options.axis.valueAxis.domain.end = max;
                }
                const model = getUpdatedModel(newData);
                const preparedData = getPreparedData(model, newData, config);
                thisClass.engine.updateFullBlock(model, preparedData);
            }
        });
    }
    
    public set2DListeners(): void {
        const thisClass = this;
        const config = this.config;
        document.querySelector('#chart-2d-type').addEventListener('change', function() {
            if(config.options.type === '2d') {
                thisClass.change2DChartConfig(this.value);
                thisClass.updateFull()
            }
        });
        document.querySelector('.btn-domain').addEventListener('click', function() {
            if(config.options.type === '2d') {
                const start = ListenersHelper.getInputValue('#domain-start');
                const end = ListenersHelper.getInputValue('#domain-end');
                config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                thisClass.engine.updateValueAxis(getUpdatedModel(thisClass.config), data);
            }
        });
        document.querySelector('#domain-start').addEventListener('keydown', function(e: KeyboardEvent) {
            if(e.code === 'Enter') {
                if(config.options.type === '2d') {
                    const start = ListenersHelper.getInputValue('#domain-start');
                    const end = ListenersHelper.getInputValue('#domain-end');
                    config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                    config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                    thisClass.engine.updateValueAxis(getUpdatedModel(thisClass.config), data);
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
                    thisClass.engine.updateValueAxis(getUpdatedModel(thisClass.config), data);
                }
            }
        });
    }
    
    public setAxisListeners(): void {
        const thisClass = this;
        const config = this.config;
        document.querySelector('#chart-orient').addEventListener('change', function() {
            if(config.options.type === '2d' || config.options.type === 'interval') {
                config.options.charts.forEach((chart: TwoDimensionalChart | IntervalChart) => {
                    chart.orientation = this.value; 
                }); 
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
    
    public setPolarListeners(): void {
        const thisClass = this;
        const config = this.config;
        document.querySelector('#inner-radius').addEventListener('input', function() {
            if(config.options.type === 'polar') {
                const innerRadius = ListenersHelper.getInputValue('#inner-radius');
                config.options.charts[0].appearanceOptions.innerRadius = parseInt(innerRadius) || 0;
                thisClass.updateFull();
            }
        });
        document.querySelector('#pad-angle').addEventListener('input', function() {
            if(config.options.type === 'polar') {
                const padAngle = ListenersHelper.getInputValue('#pad-angle');
                config.options.charts[0].appearanceOptions.padAngle = parseFloat(padAngle) || 0;
                thisClass.updateFull();
            }
        });
    }
    
    public setControlsValues(): void {
        const config = this.config;
        const designerConfig = this.designerConfig;

        ListenersHelper.setInputValue('#notation', config.options.type);
        ListenersHelper.setInputValue('#block-width', config.canvas.size.width);
        ListenersHelper.setInputValue('#block-height', config.canvas.size.height);
        ListenersHelper.setCheckboxValue('#wrapper-border', config.canvas.class === 'svg-chart outline');
    
        ListenersHelper.setInputValue('#legend', config.options.charts[0].legend.position);
        ListenersHelper.setInputValue('#data-size', config.options.charts[0].data.dataSource.includes('large') ? 'large' : 'normal');
        ListenersHelper.setInputValue('#axis-label-width', designerConfig.canvas.axisLabel.maxSize.main);
        ListenersHelper.setInputValue('#chart-block-margin-top', designerConfig.canvas.chartBlockMargin.top);
        ListenersHelper.setInputValue('#chart-block-margin-bottom', designerConfig.canvas.chartBlockMargin.bottom);
        ListenersHelper.setInputValue('#chart-block-margin-left', designerConfig.canvas.chartBlockMargin.left);
        ListenersHelper.setInputValue('#chart-block-margin-right', designerConfig.canvas.chartBlockMargin.right);
        ListenersHelper.setInputValue('#bar-group-distance', designerConfig.canvas.chartOptions.bar.groupDistance);
        ListenersHelper.setInputValue('#bar-distance', designerConfig.canvas.chartOptions.bar.barDistance);
        ListenersHelper.setInputValue('#min-bar-size', designerConfig.canvas.chartOptions.bar.minBarWidth);
        ListenersHelper.setInputValue('#max-bar-size', designerConfig.canvas.chartOptions.bar.maxBarWidth);
        ListenersHelper.setInputValue('#min-donut-part-size', designerConfig.canvas.chartOptions.donut.minPartSize);
        ListenersHelper.setInputValue('#base-color', designerConfig.chart.style.palette[0].hex());
        ListenersHelper.setCheckboxValue('#designer-key-grid', designerConfig.additionalElements.gridLine.flag.key);
        ListenersHelper.setCheckboxValue('#designer-value-grid', designerConfig.additionalElements.gridLine.flag.value);
        
        if(config.options.type === '2d') {
            ListenersHelper.setInputValue('#chart-2d-type', config.options.charts[0].type);
            ListenersHelper.setInputValue('#chart-orient', config.options.charts[0].orientation);
            ListenersHelper.setInputValue('#key-axis-orient', config.options.axis.keyAxis.position);
            ListenersHelper.setInputValue('#value-axis-orient', config.options.axis.valueAxis.position);
            ListenersHelper.setCheckboxValue('#config-value-grid', config.options.additionalElements.gridLine.flag.value);
            ListenersHelper.setCheckboxValue('#config-key-grid', config.options.additionalElements.gridLine.flag.key);
            ListenersHelper.setCheckboxValue('#config-tick-key', config.options.axis.keyAxis.ticks.flag);
            ListenersHelper.setCheckboxValue('#config-tick-value', config.options.axis.valueAxis.ticks.flag);
        } else if(config.options.type === 'polar') {
            ListenersHelper.setInputValue('#chart-polar-type', config.options.charts[0].type);
            ListenersHelper.setInputValue('#inner-radius', config.options.charts[0].appearanceOptions.innerRadius.toString());
            ListenersHelper.setInputValue('#pad-angle', config.options.charts[0].appearanceOptions.padAngle.toString());
        }
    }
}
