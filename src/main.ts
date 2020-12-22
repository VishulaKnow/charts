const data = require('./assets/dataSet.json');
import { model, getUpdatedModel } from './modelOptions';
import engine from './engine';

engine.render(model, data);


import config from './config/configOptions';


//#region Controls Listeners
document.querySelector('.btn-orient').addEventListener('click', function() {
    const elem = document.querySelector('#chart-orient') as HTMLInputElement;
    config.charts[0].orientation = elem.value as 'vertical' | 'horizontal';
    engine.updateFullBlock(getUpdatedModel(config), data);
});
document.querySelector('.btn-key-position').addEventListener('click', function() {
    const elem = document.querySelector('#key-axis-orient') as HTMLInputElement;
    config.axis.keyAxis.position = elem.value as 'start' | 'end';
    engine.updateFullBlock(getUpdatedModel(config), data);
});
document.querySelector('.btn-value-position').addEventListener('click', function() {
    const elem = document.querySelector('#value-axis-orient') as HTMLInputElement;
    config.axis.valueAxis.position = elem.value as 'start' | 'end';
    engine.updateFullBlock(getUpdatedModel(config), data);
});
document.querySelector('.btn-domain').addEventListener('click', function() {
    const start = (document.querySelector('#domain-start') as HTMLInputElement).value;
    const end = (document.querySelector('#domain-end') as HTMLInputElement).value;
    config.axis.valueAxis.domain.start = parseInt(start || '-1');
    config.axis.valueAxis.domain.end = parseInt(end || '-1');
    engine.updateValueAxis(getUpdatedModel(config), data);
});
document.querySelector('.btn-chart-type').addEventListener('click', function() {
    const chartType = (document.querySelector('#chart-type') as HTMLInputElement).value;
    const chartFill = (document.querySelector('#chart-fill') as HTMLInputElement).value;
    const chartStroke = (document.querySelector('#chart-stroke') as HTMLInputElement).value;
    config.charts[0].type = chartType as 'bar' | 'line' | 'area';
    if(chartFill)
        config.charts[0].style['fill'] = chartFill;
    if(chartStroke)
        config.charts[0].style['stroke'] = chartStroke;
    if(config.charts[0].type === 'line' && config.charts[0].style['fill'] !== 'none') {
        config.charts[0].style['fill'] = 'none';
        if(config.charts[0].style['stroke'] === 'none')
            config.charts[0].style['stroke'] = 'steelblue';
    }
    engine.updateFullBlock(getUpdatedModel(config), data);
});
//#endregion