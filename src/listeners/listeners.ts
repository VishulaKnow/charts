import engine from '../engine/engine';
import config from '../config/configOptions';
import designerConfig from '../designer/designerConfigOptions';
import { getPreparedData, getUpdatedModel } from '../model/modelOptions';
import { Config, PolarChart, PolarOptions, TwoDimensionalChart, TwoDimensionalOptions } from '../config/config'
import { color } from 'd3';
const data = require('../assets/dataSet.json');

function randInt(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
}
function getCopy(obj: any) {
    const newObj: any = {};
    if(typeof obj === 'object') {
        for(let key in obj) {        
            if(Array.isArray(obj[key])) {
                newObj[key] = getCopyOfArr(obj[key]);
            } else if(typeof obj[key] === 'object') {
                newObj[key] = getCopy(obj[key]);
            } else {
                newObj[key] = obj[key];
            }
        } 
    } else {
        return obj;
    }
    return newObj;
}
function getDataWithRandomValues(data: any, maxRand: number) {
    config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart) => {
        data[chart.data.dataSource].forEach((row: any) => {
            row[chart.data.valueField.name] = randInt(0, maxRand);
        });
    });
    return data;
}
function getCopyOfArr(initial: any[]): any[] {
    const newArr: any[] = [];
    initial.forEach(d => newArr.push(getCopy(d)));
    return newArr;
}
function getInputValue(selector: string): string {
    return (document.querySelector(selector) as HTMLInputElement).value;
}
function setInputValue(selector: string, value: any): void {
    (document.querySelector(selector) as HTMLInputElement).value = value.toString();
}
function setCheckboxValue(selector: string, value: boolean): void {
    (document.querySelector(selector) as HTMLInputElement).checked = value;
}

function updateFull(): void {
    dropAxisDomain(config);
    const model = getUpdatedModel();
    const preparedData = getPreparedData(model, getCopy(data));
    engine.updateFullBlock(model, preparedData);
}
function dropAxisDomain(config: Config) {
    if(config.options.type === '2d') {
        config.options.axis.valueAxis.domain.end = -1;
        config.options.axis.valueAxis.domain.start = -1;
    }
}

function showControlsForNotation(notationType: '2d' | 'polar'): void {
    if(notationType === '2d') {
        (document.querySelector('.block-polar') as HTMLElement).style.display = 'none';
        (document.querySelector('.block-2d') as HTMLElement).style.display = 'block';
    }
    else {
        (document.querySelector('.block-2d') as HTMLElement).style.display = 'none';
        (document.querySelector('.block-polar') as HTMLElement).style.display = 'block';
    }
}

function changeConfigOptions(notationType: '2d' | 'polar'): void {
    if(notationType === '2d') {
        const options: TwoDimensionalOptions = {
            type: notationType,
            charts: [
                {
                    data: config.options.charts[0].data,
                    legend: config.options.charts[0].legend,
                    title: config.options.charts[0].title,
                    tooltip: config.options.charts[0].tooltip,
                    orientation: getInputValue('#chart-orient') as 'horizontal' | 'vertical',
                    type: getInputValue('#chart-2d-type') as "area" | "line" | "bar"
                }
            ],
            axis: {
                keyAxis: {
                    domain: {
                        start: -1,
                        end: -1
                    },
                    position: getInputValue('#key-axis-orient') as "start" | "end"
                },
                valueAxis: {
                    domain: {
                        start: -1,
                        end: -1
                    },
                    position: getInputValue('#value-axis-orient') as "start" | "end"
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
            options.charts.push(getCopy(options.charts[0]));
            options.charts[1].data.dataSource = options.charts[0].data.dataSource + '2';
        } else if((options.charts[0].type === 'line' || options.charts[0].type === 'bar') && options.charts.length === 2) {
            options.charts[1] = getCopy(options.charts[0]);
            options.charts[1].data.dataSource = options.charts[0].data.dataSource + '2';
        }
        config.options = options;
    } else {
        const options: PolarOptions = {
            type: notationType,
            charts: [
                {
                    data: config.options.charts[0].data,
                    legend: config.options.charts[0].legend,
                    title: config.options.charts[0].title,
                    tooltip: config.options.charts[0].tooltip,
                    type: 'donut',
                    appearanceOptions: {
                        innerRadius: parseFloat(getInputValue('#inner-radius')) || 0,
                        padAngle: parseFloat(getInputValue('#pad-angle')) || 0
                    }
                }
            ]
        }
        config.options = options;
    }
    updateFull();
}

function change2DChartConfig(chartType: 'bar' | 'line' | 'area'): void {
    if(chartType === 'area') {
        if(config.options.charts.length !== 1)
            config.options.charts.splice(1, config.options.charts.length - 1);
        config.options.charts[0].type = chartType;
    } else if((chartType === 'bar' || chartType === 'line') && config.options.charts.length === 1) {
        config.options.charts.push(getCopy(config.options.charts[0]));
        config.options.charts.forEach((chart: any) => chart.type = chartType);
        config.options.charts[1].data.dataSource = config.options.charts[0].data.dataSource + '2';
    } else if((chartType === 'bar' || chartType === 'line') && config.options.charts.length === 2) {
        // config.options.charts[1] = getCopy(config.options.charts[0]);
        config.options.charts.forEach((chart: any) => chart.type = chartType);
        config.options.charts[1].data.dataSource = config.options.charts[0].data.dataSource + '2';
    }
}

function setMainListeners(): void {
    document.querySelector('#notation').addEventListener('change', function() {
        showControlsForNotation(this.value);
        changeConfigOptions(this.value);
        setControlsValues();
    });
    document.querySelector('#block-width').addEventListener('input', function(e: KeyboardEvent) {
        config.canvas.size.width = parseFloat(getInputValue('#block-width')) || 0;
        updateFull();
    });
    document.querySelector('#block-height').addEventListener('input', function(e: KeyboardEvent) {
        config.canvas.size.height = parseFloat(getInputValue('#block-height')) || 0;
        updateFull();
    });
    document.querySelector('#wrapper-border').addEventListener('change', function() {
        if(this.checked)
            config.canvas.class = 'svg-chart outline';
        else 
            config.canvas.class = 'svg-chart';
        updateFull();
    });
}

function setDesignerListeners(): void {
    document.querySelector('#axis-label-width').addEventListener('input', function() {
        designerConfig.canvas.axisLabel.maxSize.main = parseFloat(getInputValue('#axis-label-width'));
        updateFull();
    });
    document.querySelector('#chart-block-margin-top').addEventListener('input', function() {
        designerConfig.canvas.chartBlockMargin.top = parseFloat(getInputValue('#chart-block-margin-top')) || 0;
        updateFull();
    });
    document.querySelector('#chart-block-margin-bottom').addEventListener('input', function() {
        designerConfig.canvas.chartBlockMargin.bottom = parseFloat(getInputValue('#chart-block-margin-bottom')) || 0;
        updateFull();
    });
    document.querySelector('#chart-block-margin-left').addEventListener('input', function() {
        designerConfig.canvas.chartBlockMargin.left = parseFloat(getInputValue('#chart-block-margin-left')) || 0;
        updateFull();
    });
    document.querySelector('#chart-block-margin-right').addEventListener('input', function() {
        designerConfig.canvas.chartBlockMargin.right = parseFloat(getInputValue('#chart-block-margin-right')) || 0;
        updateFull();
    });
    document.querySelector('#bar-distance').addEventListener('input', function() {
        designerConfig.canvas.chartOptions.bar.barDistance = parseFloat(getInputValue('#bar-distance')) || 0;
        updateFull();
    });
    document.querySelector('#bar-group-distance').addEventListener('input', function() {
        designerConfig.canvas.chartOptions.bar.groupDistance = parseFloat(getInputValue('#bar-group-distance'));        
        updateFull();
    });
    document.querySelector('#min-bar-size').addEventListener('input', function() {
        designerConfig.canvas.chartOptions.bar.minBarWidth = parseFloat(getInputValue('#min-bar-size')) || 0;
        updateFull();
    });
    document.querySelector('#min-donut-part-size').addEventListener('input', function() {
        designerConfig.canvas.chartOptions.donut.minPartSize = parseFloat(getInputValue('#min-donut-part-size')) || 0;
        updateFull();
    });
    document.querySelector('.btn-base-color').addEventListener('click', function() {
        designerConfig.chart.style.palette[0] = color(getInputValue('#base-color'));
        updateFull();
    });
    document.querySelector('#designer-key-grid').addEventListener('change', function() {
        designerConfig.additionalElements.gridLine.flag.key = this.checked;
        updateFull();
    });
    document.querySelector('#designer-value-grid').addEventListener('change', function() {
        designerConfig.additionalElements.gridLine.flag.value = this.checked;
        updateFull();
    });
}

function setCommonListeners(): void {
    document.querySelector('#data-size').addEventListener('change', function() {
        config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart, index: number) => {
            chart.data.dataSource = this.value === 'normal' 
                ? 'dataSet' + (index === 0 ? '' : `${index + 1}`)
                : 'dataSet_large' + (index === 0 ? '' : `${index + 1}`);
        });
        updateFull();
    });
    document.querySelector('#legend').addEventListener('change', function() {
        config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart) => {
            chart.legend.position = this.value;
        });
        updateFull();
    });
    document.querySelector('.btn-random').addEventListener('click', function() {
        const max = parseInt(getInputValue('#max-random-value')) || 120;
        const copy = getCopy(data);
        const newData = getDataWithRandomValues(copy, max);
        if(config.options.type === '2d') {
            config.options.axis.valueAxis.domain.start = -1;
            config.options.axis.valueAxis.domain.end = max;
        }
        const model = getUpdatedModel(newData);
        const preparedData = getPreparedData(model, newData);
        engine.updateFullBlock(model, preparedData);
    });
    document.querySelector('#max-random-value').addEventListener('keydown', function(e: KeyboardEvent) {
        if(e.code === 'Enter') {
            const max = parseInt(getInputValue('#max-random-value')) || 120;
            const copy = getCopy(data);
            const newData = getDataWithRandomValues(copy, max);
            if(config.options.type === '2d') {
                config.options.axis.valueAxis.domain.start = -1;
                config.options.axis.valueAxis.domain.end = max;
            }
            const model = getUpdatedModel(newData);
            const preparedData = getPreparedData(model, newData);
            engine.updateFullBlock(model, preparedData);
        }
    });
}

function set2DListeners(): void {
    document.querySelector('#chart-2d-type').addEventListener('change', function() {
        if(config.options.type === '2d') {
            change2DChartConfig(this.value);
            updateFull();
        }
    });
    document.querySelector('#chart-orient').addEventListener('change', function() {
        if(config.options.type === '2d') {
            config.options.charts[0].orientation = this.value;
            updateFull();
        }
    });
    document.querySelector('#key-axis-orient').addEventListener('change', function() {
        if(config.options.type === '2d') {
            config.options.axis.keyAxis.position = this.value;
            updateFull();
        }
    });
    document.querySelector('#value-axis-orient').addEventListener('change', function() {
        if(config.options.type === '2d') {
            config.options.axis.valueAxis.position = this.value;
            updateFull();
        }
    });
    document.querySelector('.btn-domain').addEventListener('click', function() {
        if(config.options.type === '2d') {
            const start = getInputValue('#domain-start');
            const end = getInputValue('#domain-end');
            config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
            config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
            engine.updateValueAxis(getUpdatedModel(), getCopy(data));
        }
    });
    document.querySelector('#domain-start').addEventListener('keydown', function(e: KeyboardEvent) {
        if(e.code === 'Enter') {
            if(config.options.type === '2d') {
                const start = getInputValue('#domain-start');
                const end = getInputValue('#domain-end');
                config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                engine.updateValueAxis(getUpdatedModel(), getCopy(data));
            }
        }
    });
    document.querySelector('#domain-end').addEventListener('keydown', function(e: KeyboardEvent) {
        if(e.code === 'Enter') {
            if(config.options.type === '2d') {
                const start = getInputValue('#domain-start');
                const end = getInputValue('#domain-end');
                config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                engine.updateValueAxis(getUpdatedModel(), getCopy(data));
            }
        }
    });
    document.querySelector('#config-key-grid').addEventListener('change', function() {
        if(config.options.type === '2d') {
            config.options.additionalElements.gridLine.flag.key = this.checked;
            updateFull();
        }
    });
    document.querySelector('#config-value-grid').addEventListener('change', function() {
        if(config.options.type === '2d') {
            config.options.additionalElements.gridLine.flag.value = this.checked;
            updateFull();
        }
    });
}

function setPolarListeners(): void {
    document.querySelector('#inner-radius').addEventListener('input', function() {
        if(config.options.type === 'polar') {
            const innerRadius = getInputValue('#inner-radius');
            config.options.charts[0].appearanceOptions.innerRadius = parseInt(innerRadius) || 0;
            updateFull();
        }
    });
    document.querySelector('#pad-angle').addEventListener('input', function() {
        if(config.options.type === 'polar') {
            const padAngle = getInputValue('#pad-angle');
            config.options.charts[0].appearanceOptions.padAngle = parseFloat(padAngle) || 0;
            updateFull();
        }
    });
}

function setControlsValues(): void {
    setInputValue('#notation', config.options.type);
    setInputValue('#block-width', config.canvas.size.width);
    setInputValue('#block-height', config.canvas.size.height);
    setCheckboxValue('#wrapper-border', config.canvas.class === 'svg-chart outline');

    setInputValue('#legend', config.options.charts[0].legend.position);
    setInputValue('#data-size', config.options.charts[0].data.dataSource.includes('large') ? 'large' : 'normal');

    setInputValue('#axis-label-width', designerConfig.canvas.axisLabel.maxSize.main);
    setInputValue('#chart-block-margin-top', designerConfig.canvas.chartBlockMargin.top);
    setInputValue('#chart-block-margin-bottom', designerConfig.canvas.chartBlockMargin.bottom);
    setInputValue('#chart-block-margin-left', designerConfig.canvas.chartBlockMargin.left);
    setInputValue('#chart-block-margin-right', designerConfig.canvas.chartBlockMargin.right);
    setInputValue('#bar-distance', designerConfig.canvas.chartOptions.bar.barDistance);
    setInputValue('#bar-group-distance', designerConfig.canvas.chartOptions.bar.groupDistance);
    setInputValue('#min-bar-size', designerConfig.canvas.chartOptions.bar.minBarWidth);
    setInputValue('#min-donut-part-size', designerConfig.canvas.chartOptions.donut.minPartSize);
    setInputValue('#base-color', designerConfig.chart.style.palette[0].hex());
    setCheckboxValue('#designer-key-grid', designerConfig.additionalElements.gridLine.flag.key);
    setCheckboxValue('#designer-value-grid', designerConfig.additionalElements.gridLine.flag.value);
    
    if(config.options.type === '2d') {
        setInputValue('#chart-2d-type', config.options.charts[0].type);
        setInputValue('#chart-orient', config.options.charts[0].orientation);
        setInputValue('#key-axis-orient', config.options.axis.keyAxis.position);
        setInputValue('#value-axis-orient', config.options.axis.valueAxis.position);
        setCheckboxValue('#config-key-grid', config.options.additionalElements.gridLine.flag.key);
        setCheckboxValue('#config-value-grid', config.options.additionalElements.gridLine.flag.value);
    } else {
        setInputValue('#chart-polar-type', config.options.charts[0].type);
        setInputValue('#inner-radius', config.options.charts[0].appearanceOptions.innerRadius.toString());
        setInputValue('#pad-angle', config.options.charts[0].appearanceOptions.padAngle.toString());
    }
}


setControlsValues();
showControlsForNotation(config.options.type);
setMainListeners();
setDesignerListeners();
setCommonListeners();
set2DListeners();
setPolarListeners();
