import engine from './engine';
import config from './config/configOptions';
import { getUpdatedModel } from './model/modelOptions';
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
    const options: any = {
        type: notationType,
        charts: [
            {
                title: config.options.charts[0].title,
                legend: config.options.charts[0].legend,
                style: config.options.charts[0].style,
                data: config.options.charts[0].data
            }
        ]
    }
    if(notationType === '2d') {
        options.axis = {
            keyAxis: {
                domain: {
                    start: -1,
                    end: -1
                },
                position: 'end'
            },
            valueAxis: {
                domain: {
                    start: 0,
                    end: 150
                },
                position: 'start'
            }
        }
        options.charts[0].type = getInputValue('#chart-2d-type');
        options.charts[0].orientation = getInputValue('#chart-orient');
    } else {
        options.charts[0].type = getInputValue('#chart-polar-type');
        options.charts[0].appearanceOptions = {
            innerRadius: getInputValue('#inner-radius') || 0,
            padAngle: getInputValue('#pad-angle') || 0
        }
    }
    config.options = options;
    engine.updateFullBlock(getUpdatedModel(), data);
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
            if(chartFill)
                config.options.charts[0].style['fill'] = chartFill;
            if(chartStroke)
                config.options.charts[0].style['stroke'] = chartStroke;
            if(config.options.charts[0].type === 'line' && config.options.charts[0].style['fill'] !== 'none') {
                config.options.charts[0].style['fill'] = 'none';
                if(config.options.charts[0].style['stroke'] === 'none')
                    config.options.charts[0].style['stroke'] = 'steelblue';
            }
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

function setStyleListeners(): void {
    document.querySelector('.btn-chart-style').addEventListener('click', function() {
        const chartFill = getInputValue('#chart-fill') || 'none';
        const chartStroke = getInputValue('#chart-stroke') || 'none';

        config.options.charts[0].style['fill'] = chartFill;
        config.options.charts[0].style['stroke'] = chartStroke;

        engine.updateFullBlock(getUpdatedModel(), data);
    });
}

function setControlsValues(): void {
    setInputValue('#notation', config.options.type);
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
set2DListeners();
setPolarListeners();
setStyleListeners();
