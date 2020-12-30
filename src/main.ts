import engine from './engine';
import { model } from './model/modelOptions';

const data = require('./assets/dataSet.json');


engine.render(model, data);