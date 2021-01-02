import engine from './engine';
import config from './config/configOptions';
import designerConfig from './designer/designerConfigOptions';
import { getUpdatedModel } from './model/modelOptions';
import { PolarChart, PolarOptions, TwoDimensionalChart, TwoDimensionalOptions } from './config/config'
const data = require('./assets/dataSet.json');

function getInputValue(selector: string): string {
    return (document.querySelector(selector) as HTMLInputElement).value;
}
function setInputValue(selector: string, value: string): void {
    (document.querySelector(selector) as HTMLInputElement).value = value;
}

function showControlsForNotation(notationType: '2d' | 'polar'): void {
    if(notationType === '2d') {
        (document.querySelector('.controls-polar') as HTMLElement).style.display = 'none';
        (document.querySelector('.controls-2d') as HTMLElement).style.display = 'flex';
    }
    else {
        (document.querySelector('.controls-2d') as HTMLElement).style.display = 'none';
        (document.querySelector('.controls-polar') as HTMLElement).style.display = 'flex';
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
                    position: getInputValue('#key-axis-orient') as "start" | "end"
                }
            }
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
    engine.updateFullBlock(getUpdatedModel(), data);
}

function setDesignerListeners(): void {
    document.querySelector('.btn-axis-label-width').addEventListener('click', function() {
        designerConfig.canvas.axisLabel.maxSize.main = parseFloat(getInputValue('#axis-label-width'));
        engine.updateFullBlock(getUpdatedModel(), data);
    });
    document.querySelector('.btn-chart-block-margin').addEventListener('click', function() {
        designerConfig.canvas.chartBlockMargin.top = parseFloat(getInputValue('#chart-block-margin-top')) || 0;
        designerConfig.canvas.chartBlockMargin.bottom = parseFloat(getInputValue('#chart-block-margin-bottom')) || 0;
        designerConfig.canvas.chartBlockMargin.left = parseFloat(getInputValue('#chart-block-margin-left')) || 0;
        designerConfig.canvas.chartBlockMargin.right = parseFloat(getInputValue('#chart-block-margin-right')) || 0;
        engine.updateFullBlock(getUpdatedModel(), data);
    });
}

function setCommonListeners(): void {
    document.querySelector('#legend').addEventListener('change', function() {
        config.options.charts.forEach((chart: TwoDimensionalChart | PolarChart) => {
            chart.legend.position = this.value;
        });
        console.log(config.options.charts);
        
        engine.updateFullBlock(getUpdatedModel(), data);
    });
}

function set2DListeners(): void {
    document.querySelector('#chart-orient').addEventListener('change', function() {
        if(config.options.type === '2d') {
            config.options.charts[0].orientation = this.value;
            engine.updateFullBlock(getUpdatedModel(), data);
        }
    });
    document.querySelector('#chart-2d-type').addEventListener('change', function() {
        if(config.options.type === '2d') {
            const chartFill = getInputValue('#chart-fill');
            const chartStroke = getInputValue('#chart-stroke');
            config.options.charts[0].type = this.value as 'bar' | 'line' | 'area';
            engine.updateFullBlock(getUpdatedModel(), data);
        }
    });
    document.querySelector('#key-axis-orient').addEventListener('change', function() {
        if(config.options.type === '2d') {
            config.options.axis.keyAxis.position = this.value;
            engine.updateFullBlock(getUpdatedModel(), data);
        }
    });
    document.querySelector('#value-axis-orient').addEventListener('change', function() {
        if(config.options.type === '2d') {
            config.options.axis.valueAxis.position = this.value;
            engine.updateFullBlock(getUpdatedModel(), data);
        }
    });
    document.querySelector('.btn-domain').addEventListener('click', function() {
        if(config.options.type === '2d') {
            const start = getInputValue('#domain-start');
            const end = getInputValue('#domain-end');
            config.options.axis.valueAxis.domain.start = parseInt(start) || -1;
            config.options.axis.valueAxis.domain.end = parseInt(end) || -1;
            engine.updateValueAxis(getUpdatedModel(), data);
        }
    });
}

function setPolarListeners(): void {
    document.querySelector('.btn-inner-radius').addEventListener('click', function() {
        if(config.options.type === 'polar') {
            const innerRadius = getInputValue('#inner-radius');
            config.options.charts[0].appearanceOptions.innerRadius = parseInt(innerRadius) || 0;
            engine.updateFullBlock(getUpdatedModel(), data);
        }
    });
    document.querySelector('.btn-pad-angle').addEventListener('click', function() {
        if(config.options.type === 'polar') {
            
            
            const padAngle = getInputValue('#pad-angle');
            config.options.charts[0].appearanceOptions.padAngle = parseFloat(padAngle) || 0;
            engine.updateFullBlock(getUpdatedModel(), data);
        }
    });
}

function setControlsValues(): void {
    setInputValue('#notation', config.options.type);
    setInputValue('#legend', config.options.charts[0].legend.position);
    if(config.options.type === '2d') {
        setInputValue('#chart-2d-type', config.options.charts[0].type);
        setInputValue('#chart-orient', config.options.charts[0].orientation);
        setInputValue('#key-axis-orient', config.options.axis.keyAxis.position);
        setInputValue('#value-axis-orient', config.options.axis.valueAxis.position);
    } else {
        setInputValue('#chart-polar-type', config.options.charts[0].type);
        setInputValue('#inner-radius', config.options.charts[0].appearanceOptions.innerRadius.toString());
        setInputValue('#pad-angle', config.options.charts[0].appearanceOptions.padAngle.toString());
    }
}

document.querySelector('#notation').addEventListener('change', function() {
    showControlsForNotation(this.value);
    changeConfigOptions(this.value);
    setControlsValues();
});

setControlsValues();
showControlsForNotation(config.options.type);
setDesignerListeners();
setCommonListeners();
set2DListeners();
setPolarListeners();
