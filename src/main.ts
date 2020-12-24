const data = require('./assets/dataSet.json');
import { model } from './model/modelOptions';
import engine from './engine';

engine.render(model, data);