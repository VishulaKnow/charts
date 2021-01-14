import engine from './engine/engine';
import { model, getPreparedData } from './model/modelOptions';
import './style/main.css'

const data = require('./assets/dataSet.json');


engine.render(model, getPreparedData(model, data));