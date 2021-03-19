import Engine from '../engine/engine';
import { assembleModel, getPreparedData, getUpdatedModel } from '../model/modelBuilder';
import { Config, IntervalOptions, PolarChart, PolarOptions, TwoDimensionalChart, TwoDimensionalOptions } from '../config/config'
import { DesignerConfig, Transitions } from '../designer/designerConfig';
import { DataSource } from '../model/model';

class ListenersHelper {
    static randInt(min: number, max: number): number {
        return Math.round(Math.random() * (max - min) + min);
    }
    static getCopy(obj: any) {
        const newObj: any = {};
        if (typeof obj === 'object') {
            for (let key in obj) {
                if (Array.isArray(obj[key])) {
                    newObj[key] = this.getCopyOfArr(obj[key]);
                } else if (typeof obj[key] === 'object') {
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

export default class Listeners {
    private engine: Engine;
    private config: Config;
    private designerConfig: DesignerConfig;
    private data: DataSource
    private transition: Transitions = {};
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
        if (config.options.type === '2d') {
            config.options.axis.valueAxis.domain.end = -1;
            config.options.axis.valueAxis.domain.start = -1;
        }
    }

    private showControlsForNotation(notationType: '2d' | 'polar' | 'interval'): void {
        if (notationType === '2d') {
            (document.querySelector('.block-polar') as HTMLElement).style.display = 'none';
            (document.querySelector('.block-2d') as HTMLElement).style.display = 'block';
            (document.querySelector('.block-axis') as HTMLElement).style.display = 'block';
        }
        else if (notationType === 'polar') {
            (document.querySelector('.block-2d') as HTMLElement).style.display = 'none';
            (document.querySelector('.block-polar') as HTMLElement).style.display = 'block';
            (document.querySelector('.block-axis') as HTMLElement).style.display = 'none';
        } else if (notationType === 'interval') {
            (document.querySelector('.block-polar') as HTMLElement).style.display = 'none';
            (document.querySelector('.block-2d') as HTMLElement).style.display = 'none';
            (document.querySelector('.block-axis') as HTMLElement).style.display = 'block';
        }
    }

    private getDataWithRandomValues(data: any, maxRand: number) {
        if (this.config.options.type === '2d')
            this.config.options.charts.forEach((chart: TwoDimensionalChart) => {
                data[config.options.data.dataSource].forEach((row: any) => {
                    row[chart.data.valueFields[0].name] = ListenersHelper.randInt(0, maxRand);
                });
            });
        else if (this.config.options.type === 'polar') {
            this.config.options.charts.forEach((chart: PolarChart) => {
                data[config.options.data.dataSource].forEach((row: any) => {
                    row[chart.data.valueField.name] = ListenersHelper.randInt(0, maxRand);
                });
            });
        }
        return data;
    }

    private getDataConfig(notationType: '2d' | 'polar' | 'interval'): any {
        if (notationType === '2d') {
            return {
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
        } else if (notationType === 'interval') {
            return {
                valueField1: {
                    name: 'start',
                    format: 'date'
                },
                valueField2: {
                    name: 'end',
                    format: 'date'
                }
            }
        } else if (notationType === 'polar') {
            return {
                valueField: {
                    name: 'price',
                    format: 'money',
                    title: 'Количество'
                }
            }
        }
    }

    private getTooltipConfig(): any {
        return {
            show: true
        }
    }

    private changeConfigOptions(notationType: '2d' | 'polar' | 'interval'): void {
        if (notationType === '2d') {
            const options: TwoDimensionalOptions = {
                title: this.config.options.title,
                legend: this.config.options.legend,
                orientation: ListenersHelper.getInputValue('#chart-orient') as 'horizontal' | 'vertical',
                type: notationType,
                data: {
                    dataSource: 'dataSet',
                    keyField: {
                        format: 'string',
                        name: 'brand'
                    }
                },
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        isSegmented: false,
                        tooltip: this.getTooltipConfig(),
                        type: ListenersHelper.getInputValue('#chart-2d-type') === 'barLine' ? 'bar' : ListenersHelper.getInputValue('#chart-2d-type') as 'line' | 'bar' | 'area',
                        embeddedLabels: 'none',
                        markers: {
                            show: true
                        }
                    }
                ],
                axis: {
                    keyAxis: {
                        visibility: true,
                        position: ListenersHelper.getInputValue('#key-axis-orient') as 'start' | 'end',
                        ticks: {
                            flag: false
                        }
                    },
                    valueAxis: {
                        visibility: true,
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
        } else if (notationType === 'polar') {
            const options: PolarOptions = {
                title: this.config.options.title,
                legend: this.config.options.legend,
                data: {
                    dataSource: 'dataSet',
                    keyField: {
                        format: 'string',
                        name: 'brand'
                    }
                },
                type: notationType,
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        tooltip: this.getTooltipConfig(),
                        type: 'donut'
                    }
                ]
            }
            this.config.options = options;
        } else if (notationType === 'interval') {
            const options: IntervalOptions = {
                title: this.config.options.title,
                legend: this.config.options.legend,
                data: {
                    dataSource: 'dataSet_gantt',
                    keyField: {
                        format: 'string',
                        name: 'task'
                    }
                },
                orientation: ListenersHelper.getInputValue('#chart-orient') as 'horizontal' | 'vertical',
                type: notationType,
                charts: [
                    {
                        data: this.getDataConfig(notationType),
                        tooltip: this.getTooltipConfig(),
                        type: 'gantt'
                    }
                ],
                axis: {
                    keyAxis: {
                        visibility: true,
                        position: ListenersHelper.getInputValue('#key-axis-orient') as "start" | "end",
                        ticks: {
                            flag: false
                        }
                    },
                    valueAxis: {
                        visibility: true,
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
        if (chartType === 'barLine' && config.options.charts.length === 1) {
            config.options.charts.push(ListenersHelper.getCopy(config.options.charts[0]));
            config.options.charts[0].type = 'bar';
            config.options.charts[1].type = 'line';
        } else if (chartType === 'barLine' && config.options.charts.length === 2) {
            config.options.charts[0].type = 'bar';
            config.options.charts[1].type = 'line';
        } else if (chartType !== 'barLine') {
            config.options.charts.splice(1, 1);
            config.options.charts[0].type = chartType;
        }
    }

    private setMainListeners(): void {
        const thisClass = this;
        document.querySelector('#notation').addEventListener('change', function () {
            thisClass.showControlsForNotation(this.value);
            thisClass.changeConfigOptions(this.value);
            thisClass.setControlsValues();
        });
        document.querySelector('#block-width').addEventListener('input', function () {
            thisClass.config.canvas.size.width = parseFloat(ListenersHelper.getInputValue('#block-width')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#block-height').addEventListener('input', function () {
            thisClass.config.canvas.size.height = parseFloat(ListenersHelper.getInputValue('#block-height')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#wrapper-border').addEventListener('change', function () {
            if (this.checked) {
                thisClass.config.canvas.class += ' outline';
            } else {
                thisClass.config.canvas.class = thisClass.config.canvas.class.replace('outline', '');
            }
            thisClass.updateFull();
        });
    }

    private setDesignerListeners(): void {
        const thisClass = this;
        document.querySelector('#axis-label-width').addEventListener('input', function () {
            thisClass.designerConfig.canvas.axisLabel.maxSize.main = parseFloat(ListenersHelper.getInputValue('#axis-label-width'));
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-margin-top').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartBlockMargin.top = parseFloat(ListenersHelper.getInputValue('#chart-block-margin-top')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-margin-bottom').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartBlockMargin.bottom = parseFloat(ListenersHelper.getInputValue('#chart-block-margin-bottom')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-margin-left').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartBlockMargin.left = parseFloat(ListenersHelper.getInputValue('#chart-block-margin-left')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-margin-right').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartBlockMargin.right = parseFloat(ListenersHelper.getInputValue('#chart-block-margin-right')) || 0;
            thisClass.updateFull();
        });

        document.querySelector('#chart-block-transition-chartUpdate').addEventListener('input', function () {
            thisClass.transition.chartUpdate = parseFloat(ListenersHelper.getInputValue('#chart-block-transition-chartUpdate'));
            thisClass.designerConfig.transitions = thisClass.transition;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-transition-elementFadeOut').addEventListener('input', function () {
            thisClass.transition.elementFadeOut = parseFloat(ListenersHelper.getInputValue('#chart-block-transition-elementFadeOut'));
            thisClass.designerConfig.transitions = thisClass.transition;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-transition-tooltipSlide').addEventListener('input', function () {
            thisClass.transition.tooltipSlide = parseFloat(ListenersHelper.getInputValue('#chart-block-transition-tooltipSlide'));
            thisClass.designerConfig.transitions = thisClass.transition;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-transition-donutHover').addEventListener('input', function () {
            thisClass.transition.donutHover = parseFloat(ListenersHelper.getInputValue('#chart-block-transition-donutHover'));
            thisClass.designerConfig.transitions = thisClass.transition;
            thisClass.updateFull();
        });
        document.querySelector('#chart-block-transition-markerHover').addEventListener('input', function () {
            thisClass.transition.markerHover = parseFloat(ListenersHelper.getInputValue('#chart-block-transition-markerHover'));
            thisClass.designerConfig.transitions = thisClass.transition;
            thisClass.updateFull();
        });


        document.querySelector('#bar-distance').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.bar.barDistance = parseFloat(ListenersHelper.getInputValue('#bar-distance')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#min-bar-group-distance').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.bar.groupMinDistance = parseFloat(ListenersHelper.getInputValue('#min-bar-group-distance'));
            thisClass.updateFull();
        });
        document.querySelector('#max-bar-group-distance').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.bar.groupMaxDistance = parseFloat(ListenersHelper.getInputValue('#max-bar-group-distance'));
            thisClass.updateFull();
        });
        document.querySelector('#min-bar-size').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.bar.minBarWidth = parseFloat(ListenersHelper.getInputValue('#min-bar-size')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#max-bar-size').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.bar.maxBarWidth = parseFloat(ListenersHelper.getInputValue('#max-bar-size')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#min-donut-part-size').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.donut.minPartSize = parseFloat(ListenersHelper.getInputValue('#min-donut-part-size')) || 0;
            thisClass.updateFull();
        });
        document.querySelector('#pad-angle').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.donut.padAngle = parseFloat(ListenersHelper.getInputValue('#pad-angle'));
            thisClass.updateFull();
        });
        document.querySelector('#donut-min-thickness').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.donut.minThickness = parseFloat(ListenersHelper.getInputValue('#donut-min-thickness'));
            thisClass.updateFull();
        });
        document.querySelector('#donut-max-thickness').addEventListener('input', function () {
            thisClass.designerConfig.canvas.chartOptions.donut.maxThickness = parseFloat(ListenersHelper.getInputValue('#donut-max-thickness'));
            thisClass.updateFull();
        });
        document.querySelector('#base-color').addEventListener('keydown', function (e: any) {
            if (e.code === 'Enter') {
                thisClass.designerConfig.chartStyle.baseColor = this.value;
                thisClass.updateFull();
            }
        });
        document.querySelector('#color-step').addEventListener('input', function () {
            thisClass.designerConfig.chartStyle.step = parseFloat(this.value);
            thisClass.updateFull();
        });
    }

    private setCommonListeners(): void {
        const thisClass = this;
        const config = this.config;
        document.querySelector('#data-size').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'polar') {
                config.options.data.dataSource = this.value === 'normal' ? 'dataSet' : 'dataSet_large';
                thisClass.updateFull();
            }
        });
        document.querySelector('#legend').addEventListener('change', function () {
            config.options.legend.show = this.checked;
            thisClass.updateFull();
        });
        document.querySelector('#refresh').addEventListener('input', function () {
            DataUpdater.updateRefreshValue(parseFloat(ListenersHelper.getInputValue('#refresh')));
            thisClass.updateFull();
        });
        document.querySelector('#update-enabler').addEventListener('change', function () {
            DataUpdater.updateIsOn(this.checked)
            thisClass.updateFull()
            this.checked ? document.querySelector('#refresh').setAttribute('disabled', 'disabled') : document.querySelector('#refresh').removeAttribute('disabled')
        });
        const randomFunc = function () {
            if (config.options.type === '2d' || config.options.type === 'polar') {
                const max = parseInt(ListenersHelper.getInputValue('#max-random-value')) || 120;
                const dataCopy = ListenersHelper.getCopy(thisClass.data);
                const newData = thisClass.getDataWithRandomValues(dataCopy, max);

                if (config.options.type === '2d' && config.options.axis.valueAxis.domain.end < max)
                    config.options.axis.valueAxis.domain.end = -1;

                const model = getUpdatedModel(thisClass.config, newData, thisClass.designerConfig);
                const preparedData = getPreparedData(model, newData, config);

                thisClass.engine.updateData(model, preparedData);
            }
        }
        document.querySelector('.btn-random').addEventListener('click', function () {
            randomFunc();
        });
        document.querySelector('#max-random-value').addEventListener('keydown', function (e: any) {
            if (e.code === 'Enter') {
                randomFunc();
            }
        });
    }

    private set2DListeners(): void {
        const thisClass = this;
        const config = this.config;
        document.querySelector('#chart-2d-type').addEventListener('change', function () {
            if (config.options.type === '2d') {
                thisClass.change2DChartConfig(this.value);
                thisClass.updateFull();
            }
        });
        document.querySelector('#embedded-labels').addEventListener('change', function () {
            if (config.options.type === '2d') {
                config.options.charts.forEach(chart => chart.embeddedLabels = this.value);
                thisClass.updateFull();
            }
        });
        document.querySelector('.btn-domain').addEventListener('click', function () {
            if (config.options.type === '2d') {
                const start = ListenersHelper.getInputValue('#domain-start');
                const end = ListenersHelper.getInputValue('#domain-end');
                config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                thisClass.engine.updateData(getUpdatedModel(thisClass.config, thisClass.data, thisClass.designerConfig), thisClass.data);
            }
        });
        document.querySelector('#domain-start').addEventListener('keydown', function (e: any) {
            if (e.code === 'Enter') {
                if (config.options.type === '2d') {
                    const start = ListenersHelper.getInputValue('#domain-start');
                    const end = ListenersHelper.getInputValue('#domain-end');
                    config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                    config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                    thisClass.engine.updateData(getUpdatedModel(thisClass.config, thisClass.data, thisClass.designerConfig), thisClass.data);
                }
            }
        });
        document.querySelector('#domain-end').addEventListener('keydown', function (e: any) {
            if (e.code === 'Enter') {
                if (config.options.type === '2d') {
                    const start = ListenersHelper.getInputValue('#domain-start');
                    const end = ListenersHelper.getInputValue('#domain-end');
                    config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
                    config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
                    thisClass.engine.updateData(getUpdatedModel(thisClass.config, thisClass.data, thisClass.designerConfig), thisClass.data);
                }
            }
        });
        document.querySelector('#is-segmented').addEventListener('change', function () {
            if (config.options.type === '2d') {
                config.options.charts.forEach(chart => {
                    chart.isSegmented = this.checked;
                });
                thisClass.updateFull();
            }
        });
        document.querySelector('#markers').addEventListener('change', function () {
            if (config.options.type === '2d') {
                config.options.charts.forEach(chart => {
                    chart.markers.show = this.checked;
                });
                thisClass.updateFull();
            }
        });
    }

    private setAxisListeners(): void {
        const thisClass = this;
        const config = this.config;
        document.querySelector('#chart-orient').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
                config.options.orientation = this.value;
                thisClass.updateFull();
            }
        });
        document.querySelector('#key-axis-orient').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.keyAxis.position = this.value;
                thisClass.updateFull();
            }
        });
        document.querySelector('#key-axis-visibility').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.keyAxis.visibility = this.checked;
                thisClass.updateFull();
            }
        });
        document.querySelector('#value-axis-orient').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.valueAxis.position = this.value;
                thisClass.updateFull();
            }
        });
        document.querySelector('#value-axis-visibility').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.valueAxis.visibility = this.checked;
                thisClass.updateFull();
            }
        });
        document.querySelector('#config-key-grid').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
                config.options.additionalElements.gridLine.flag.key = this.checked;
                thisClass.updateFull();
            }
        });
        document.querySelector('#config-value-grid').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
                config.options.additionalElements.gridLine.flag.value = this.checked;
                thisClass.updateFull();
            }
        });
        document.querySelector('#config-tick-key').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
                config.options.axis.keyAxis.ticks.flag = this.checked;
                thisClass.updateFull();
            }
        });
        document.querySelector('#config-tick-value').addEventListener('change', function () {
            if (config.options.type === '2d' || config.options.type === 'interval') {
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

        ListenersHelper.setCheckboxValue('#legend', config.options.legend.show);
        ListenersHelper.setInputValue('#data-size', config.options.data.dataSource.includes('large') ? 'large' : 'normal');
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
        ListenersHelper.setInputValue('#base-color', designerConfig.chartStyle.baseColor);
        ListenersHelper.setInputValue('#color-step', designerConfig.chartStyle.step);
        ListenersHelper.setInputValue('#min-donut-part-size', designerConfig.canvas.chartOptions.donut.minPartSize);
        ListenersHelper.setInputValue('#pad-angle', designerConfig.canvas.chartOptions.donut.padAngle);
        ListenersHelper.setInputValue('#donut-min-thickness', designerConfig.canvas.chartOptions.donut.minThickness);
        ListenersHelper.setInputValue('#donut-max-thickness', designerConfig.canvas.chartOptions.donut.maxThickness);

        if (config.options.type === '2d') {
            ListenersHelper.setInputValue('#chart-2d-type', config.options.charts[0].type);
            ListenersHelper.setInputValue('#chart-orient', config.options.orientation);
            ListenersHelper.setInputValue('#key-axis-orient', config.options.axis.keyAxis.position);
            ListenersHelper.setInputValue('#value-axis-orient', config.options.axis.valueAxis.position);
            ListenersHelper.setCheckboxValue('#config-value-grid', config.options.additionalElements.gridLine.flag.value);
            ListenersHelper.setCheckboxValue('#config-key-grid', config.options.additionalElements.gridLine.flag.key);
            ListenersHelper.setCheckboxValue('#config-tick-key', config.options.axis.keyAxis.ticks.flag);
            ListenersHelper.setCheckboxValue('#config-tick-value', config.options.axis.valueAxis.ticks.flag);
            ListenersHelper.setCheckboxValue('#is-segmented', config.options.charts.findIndex(ch => ch.isSegmented) !== -1);
            ListenersHelper.setCheckboxValue('#markers', config.options.charts.findIndex(ch => ch.markers.show) !== -1);
            ListenersHelper.setInputValue('#embedded-labels', config.options.charts[0].embeddedLabels);
            ListenersHelper.setCheckboxValue('#key-axis-visibility', config.options.axis.keyAxis.visibility);
            ListenersHelper.setCheckboxValue('#value-axis-visibility', config.options.axis.valueAxis.visibility);
        } else if (config.options.type === 'polar') {
            ListenersHelper.setInputValue('#chart-polar-type', config.options.charts[0].type);
        }
    }
}

import '../style/develop.css'
import config from '../config/configExample';
import designerConfig from '../designer/designerConfigExample';

const data = require('./assets/dataSet.json');


// const chart = new Chart(config, designerConfig, data, false);
// chart.render(document.querySelector('.main-wrapper'));

const engine = new Engine(2);
const model = assembleModel(config, data, designerConfig);
engine.render(model, getPreparedData(model, data, config), document.querySelector('.main-wrapper'));
new Listeners(engine, config, designerConfig, data);

const config3 = require('../config/configTest2D.json');
const model3 = assembleModel(config3, data, designerConfig);
const engine3 = new Engine(3);
engine3.render(model3, getPreparedData(model3, data, config3), document.querySelector('.main-wrapper2'));

const config2 = require('../config/configTestPolar.json');
const model2 = assembleModel(config2, data, designerConfig);
const engine2 = new Engine(4);
engine2.render(model2, getPreparedData(model2, data, config2), document.querySelector('.main-wrapper2'));

//====================================================================================================== Data updating
class DataUpdater {
    private static timeOut: any = null;
    private static refresh: number = 4000;

    private static dataSetName = 'dataSet';

    static counter = 1;

    public static updateIsOn(value: boolean) {
        if (value)
            DataUpdater.startDataChanging(DataUpdater.refresh);
        else
            DataUpdater.destroyDataChanging();
    }

    public static updateRefreshValue(value: number) {
        if (value < 1)
            return;

        DataUpdater.refresh = value;
    }

    private static startDataChanging(ms: number) {
        this.destroyDataChanging();
        const run = () => {
            DataUpdater.timeOut = setTimeout(() => {
                const newData = ListenersHelper.getCopy(data);

                this.changeData(newData);

                const newModel = getUpdatedModel(config, newData, designerConfig);
                engine.updateData(newModel, getPreparedData(newModel, newData, config));

                run();
            }, ms)
        }
        run();
    }

    private static destroyDataChanging() {
        clearTimeout(DataUpdater.timeOut)
    }

    private static changeData(newData: DataSource) {
        const random = Math.random();
        if (random > 0.66) {
            for (let i = 0; i < ListenersHelper.randInt(1, 4); i++) {
                newData[this.dataSetName].push({
                    brand: this.makeHASH(ListenersHelper.randInt(4, 10)).toUpperCase(),
                    price: ListenersHelper.randInt(0, 150),
                    count: ListenersHelper.randInt(0, 50)
                });
            }
        } else if (random < 0.33) {
            newData[this.dataSetName].splice(ListenersHelper.randInt(0, 4), ListenersHelper.randInt(1, 3));
        }

        newData[this.dataSetName][ListenersHelper.randInt(0, newData[this.dataSetName].length - 1)]['price'] = ListenersHelper.randInt(0, 100);
        newData[this.dataSetName][ListenersHelper.randInt(0, newData[this.dataSetName].length - 1)]['count'] = ListenersHelper.randInt(0, 100);
    }

    private static makeHASH(length: number): string {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}






