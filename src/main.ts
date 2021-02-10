import Engine from './engine/engine';
import { getPreparedData, assembleModel } from './model/modelOptions';
import './style/main.css'
import config from './config/configOptions';
import Listeners from './listeners/listeners';
import designerConfig from './designer/designerConfigOptions';


const data = require('./assets/dataSet.json');

const model = assembleModel(config, data);
const engine = new Engine();
engine.render(model, getPreparedData(model, data, config), '.main-wrapper');

new Listeners(engine, config, designerConfig, data);


const config3 = require('./config/configTest2D.json');
const model3 = assembleModel(config3, data);
const engine3 = new Engine();
engine3.render(model3, getPreparedData(model3, data, config3), '.main-wrapper2');

const config2 = require('./config/configTestPolar.json');
const model2 = assembleModel(config2, data);
const engine2 = new Engine();
engine2.render(model2, getPreparedData(model2, data, config2), '.main-wrapper2');


