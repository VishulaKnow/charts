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

new Listeners(engine, config, designerConfig);