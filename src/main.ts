import Engine from './engine/engine';
import { getPreparedData, assembleModel } from './model/modelOptions';
import './style/main.css'
import config from './config/configOptions';
import { Listeners } from './listeners/listeners';
import designerConfig from './designer/designerConfigOptions';


const data = require('./assets/dataSet.json');
const model = assembleModel(config);
const engine = new Engine();
engine.render(model, getPreparedData(model, data, config));



// const config2 = require('./config/configurator.json');
// const model2 = assembleModel(config2);
// const engine2 = new Engine();
// engine2.render(model2, getPreparedData(model2, data, config2));

new Listeners(engine, config, designerConfig);