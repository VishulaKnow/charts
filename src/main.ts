import engine from './engine/engine';
import { model } from './model/modelOptions';
import './style/main.css'

const data = require('./assets/dataSet.json');


engine.render(model, data);