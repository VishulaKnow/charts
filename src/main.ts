const data = require('./assets/dataSet.json');
import { model, getUpdatedModel } from './modelOptions';
import engine from './engine';

engine.render(model, data);


import config from './config/configOptions';


//#region Controls Listeners
document.querySelector('.btn-orient').addEventListener('click', function() {
    const elem = document.querySelector('#chart-orient') as HTMLInputElement;
    config.charts[0].orientation = elem.value as 'vertical' | 'horizontal';
    engine.updateOrient(getUpdatedModel(config), data);
});
document.querySelector('.btn-key-position').addEventListener('click', function() {
    const elem = document.querySelector('#key-axis-orient') as HTMLInputElement;
    config.axis.keyAxis.position = elem.value as 'start' | 'end';
    engine.updateOrient(getUpdatedModel(config), data);
});
document.querySelector('.btn-value-position').addEventListener('click', function() {
    const elem = document.querySelector('#value-axis-orient') as HTMLInputElement;
    config.axis.valueAxis.position = elem.value as 'start' | 'end';
    engine.updateOrient(getUpdatedModel(config), data);
});
document.querySelector('.btn-domain').addEventListener('click', function() {
    const start = (document.querySelector('#domain-start') as HTMLInputElement).value;
    const end = (document.querySelector('#domain-end') as HTMLInputElement).value;
    config.axis.valueAxis.domain.start = parseInt(start);
    config.axis.valueAxis.domain.end = parseInt(end);
    engine.updateValueAxis(getUpdatedModel(config), data);
});
//#endregion