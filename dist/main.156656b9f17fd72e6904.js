/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config/configOptions.ts":
/*!*************************************!*\
  !*** ./src/config/configOptions.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\nvar config = {\r\n    canvas: {\r\n        class: 'chart-1',\r\n        size: {\r\n            width: 1000,\r\n            height: 500\r\n        },\r\n        style: {\r\n            'border': '1px solid black'\r\n        }\r\n    },\r\n    axis: {\r\n        keyAxis: {\r\n            domain: {\r\n                start: -1,\r\n                end: -1\r\n            },\r\n            position: 'end'\r\n        },\r\n        valueAxis: {\r\n            domain: {\r\n                start: 0,\r\n                end: 150\r\n            },\r\n            position: 'start'\r\n        }\r\n    },\r\n    charts: [\r\n        {\r\n            title: 'Car prices',\r\n            legend: {\r\n                position: 'off'\r\n            },\r\n            style: {\r\n                'fill': 'steelblue',\r\n                'stroke': 'none'\r\n            },\r\n            type: 'area',\r\n            data: {\r\n                dataSource: 'dataSet',\r\n                keyField: 'brand',\r\n                valueField: 'price'\r\n            },\r\n            orientation: 'vertical'\r\n        }\r\n    ]\r\n};\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (config);\r\n\n\n//# sourceURL=webpack://packd3ts/./src/config/configOptions.ts?");

/***/ }),

/***/ "./src/engine.ts":
/*!***********************!*\
  !*** ./src/engine.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\n/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ \"./node_modules/d3/index.js\");\n\r\nfunction getScaleBand(domain, rangeStart, rangeEnd) {\r\n    return d3__WEBPACK_IMPORTED_MODULE_0__.scaleBand()\r\n        .domain(domain)\r\n        .range([rangeStart, rangeEnd])\r\n        .padding(0.1);\r\n}\r\nfunction getScaleLinear(domain, rangeStart, rangeEnd) {\r\n    return d3__WEBPACK_IMPORTED_MODULE_0__.scaleLinear()\r\n        .domain(domain)\r\n        .range([rangeStart, rangeEnd]);\r\n}\r\nfunction renderSvgBlock(cssClass, width, height, style) {\r\n    var svg = d3__WEBPACK_IMPORTED_MODULE_0__.select('.wrapper')\r\n        .append('svg')\r\n        .attr('width', width)\r\n        .attr('height', height)\r\n        .attr('class', cssClass);\r\n    for (var key in style) {\r\n        svg.style(key, style[key]);\r\n    }\r\n}\r\nfunction getAxisByOrient(orient, scale) {\r\n    if (orient === 'top')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisTop(scale);\r\n    if (orient === 'bottom')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisBottom(scale);\r\n    if (orient === 'left')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisLeft(scale);\r\n    if (orient === 'right')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisRight(scale);\r\n}\r\nfunction renderAxis(scale, axisOrient, translateX, translateY, cssClass) {\r\n    var axis = getAxisByOrient(axisOrient, scale);\r\n    d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .append('g')\r\n        .attr('transform', \"translate(\" + translateX + \", \" + translateY + \")\")\r\n        .attr('class', cssClass)\r\n        .call(axis);\r\n}\r\nfunction fillBarAttrsByKeyOrient(bars, axisOrient, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight) {\r\n    if (axisOrient === 'top')\r\n        bars.attr('x', function (d) { return scaleKey(d[keyField]) + margin.left; })\r\n            .attr('y', function (d) { return margin.top; })\r\n            .attr('height', function (d) { return scaleValue(d[valueField]); })\r\n            .attr('width', function (d) { return scaleKey.bandwidth(); });\r\n    else if (axisOrient === 'bottom')\r\n        bars.attr('x', function (d) { return scaleKey(d[keyField]) + margin.left; })\r\n            .attr('y', function (d) { return scaleValue(d[valueField]) + margin.top; })\r\n            .attr('height', function (d) { return blockHeight - margin.top - margin.bottom - scaleValue(d[valueField]); })\r\n            .attr('width', function (d) { return scaleKey.bandwidth(); });\r\n    else if (axisOrient === 'left')\r\n        bars.attr('x', function (d) { return margin.left; })\r\n            .attr('y', function (d) { return scaleKey(d[keyField]) + margin.top; })\r\n            .attr('height', function (d) { return scaleKey.bandwidth(); })\r\n            .attr('width', function (d) { return scaleValue(d[valueField]); });\r\n    else if (axisOrient === 'right')\r\n        bars.attr('x', function (d) { return scaleValue(d[valueField]) + margin.left; })\r\n            .attr('y', function (d) { return scaleKey(d[keyField]) + margin.top; })\r\n            .attr('height', function (d) { return scaleKey.bandwidth(); })\r\n            .attr('width', function (d) { return blockWidth - margin.left - margin.right - scaleValue(d[valueField]); });\r\n}\r\nfunction renderBar(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient, blockWidth, blockHeight) {\r\n    var bars = d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .selectAll('rect.bar')\r\n        .data(data)\r\n        .enter()\r\n        .append('rect')\r\n        .attr('class', 'bar');\r\n    fillBarAttrsByKeyOrient(bars, keyAxisOrient, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight);\r\n    for (var key in barStyle) {\r\n        bars.style(key, barStyle[key]);\r\n    }\r\n}\r\nfunction getLine() {\r\n    return d3__WEBPACK_IMPORTED_MODULE_0__.line()\r\n        .x(function (d) { return d.x; })\r\n        .y(function (d) { return d.y; });\r\n}\r\nfunction getLineCoordinateByKeyOrient(axisOrient, data, scaleKey, scaleValue, margin, keyField, valueField) {\r\n    var lineCoordinate = [];\r\n    if (axisOrient === 'bottom' || axisOrient === 'top')\r\n        data.forEach(function (d) {\r\n            lineCoordinate.push({\r\n                x: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.left,\r\n                y: scaleValue(d[valueField]) + margin.top\r\n            });\r\n        });\r\n    else if (axisOrient === 'left' || axisOrient === 'right')\r\n        data.forEach(function (d) {\r\n            lineCoordinate.push({\r\n                x: scaleValue(d[valueField]) + margin.left,\r\n                y: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.top\r\n            });\r\n        });\r\n    return lineCoordinate;\r\n}\r\nfunction getArea(keyAxisOrient) {\r\n    if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.area()\r\n            .x(function (d) { return d.x0; })\r\n            .y0(function (d) { return d.y0; })\r\n            .y1(function (d) { return d.y1; });\r\n    if (keyAxisOrient === 'left' || keyAxisOrient === 'right')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.area()\r\n            .x0(function (d) { return d.x0; })\r\n            .x1(function (d) { return d.x1; })\r\n            .y(function (d) { return d.y0; });\r\n}\r\nfunction getAreaCoordinateByKeyOrient(axisOrient, data, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight) {\r\n    var areaCoordinate = [];\r\n    if (axisOrient === 'bottom' || axisOrient === 'top') {\r\n        var y0_1 = margin.top;\r\n        if (axisOrient === 'bottom')\r\n            y0_1 = blockHeight - margin.bottom;\r\n        data.forEach(function (d) {\r\n            areaCoordinate.push({\r\n                x0: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.left,\r\n                x1: 0,\r\n                y0: y0_1,\r\n                y1: scaleValue(d[valueField]) + margin.top\r\n            });\r\n        });\r\n    }\r\n    else if (axisOrient === 'left' || axisOrient === 'right') {\r\n        var x0_1 = margin.left;\r\n        if (axisOrient === 'right')\r\n            x0_1 = blockWidth - margin.right;\r\n        data.forEach(function (d) {\r\n            areaCoordinate.push({\r\n                x0: x0_1,\r\n                x1: scaleValue(d[valueField]) + margin.left,\r\n                y0: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.top,\r\n                y1: 0\r\n            });\r\n        });\r\n    }\r\n    return areaCoordinate;\r\n}\r\nfunction renderLine(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient) {\r\n    var line = getLine();\r\n    var lineCoordinate = getLineCoordinateByKeyOrient(keyAxisOrient, data, scaleKey, scaleValue, margin, keyField, valueField);\r\n    var path = d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .append('path')\r\n        .attr('d', line(lineCoordinate))\r\n        .attr('class', 'line');\r\n    for (var key in barStyle) {\r\n        path.style(key, barStyle[key]);\r\n    }\r\n}\r\nfunction renderArea(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient, blockWidth, blockHeight) {\r\n    var area = getArea(keyAxisOrient);\r\n    var areaCoordinate = getAreaCoordinateByKeyOrient(keyAxisOrient, data, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight);\r\n    var path = d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .append('path')\r\n        .attr('d', area(areaCoordinate))\r\n        .attr('class', 'area');\r\n    for (var key in barStyle) {\r\n        path.style(key, barStyle[key]);\r\n    }\r\n}\r\nfunction renderCharts(charts, scaleKey, scaleValue, data, margin, keyAxisOrient, blockWidth, blockHeight) {\r\n    charts.forEach(function (chart) {\r\n        if (chart.type === 'bar')\r\n            renderBar(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient, blockWidth, blockHeight);\r\n        else if (chart.type === 'line')\r\n            renderLine(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient);\r\n        else if (chart.type === 'area')\r\n            renderArea(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient, blockWidth, blockHeight);\r\n    });\r\n}\r\nfunction fillScales(scales, modelScale) {\r\n    scales.scaleKey = getScaleBand(modelScale.scaleKey.domain, modelScale.scaleKey.range.start, modelScale.scaleKey.range.end);\r\n    scales.scaleValue = getScaleLinear(modelScale.scaleValue.domain, modelScale.scaleValue.range.start, modelScale.scaleValue.range.end);\r\n}\r\nfunction clearBlock() {\r\n    d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .remove();\r\n}\r\nfunction updateValueAxisDomain(scaleValue, axisClass, axisOrient) {\r\n    var axis = getAxisByOrient(axisOrient, scaleValue);\r\n    d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .select(\".\" + axisClass)\r\n        .transition()\r\n        .duration(1000)\r\n        .call(axis.bind(this));\r\n}\r\nfunction updateChartsByValueAxis(charts, scaleKey, scaleValue, data, margin, keyAxisOrient, blockWidth, blockHeight) {\r\n    charts.forEach(function (chart) {\r\n        if (chart.type === 'bar')\r\n            updateBarChartByValueAxis(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient, blockWidth, blockHeight);\r\n        else if (chart.type === 'line')\r\n            updateLineChartByValueAxis(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient);\r\n        else if (chart.type === 'area')\r\n            updateAreaChartByValueAxis(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient, blockWidth, blockHeight);\r\n    });\r\n}\r\nfunction updateLineChartByValueAxis(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient) {\r\n    var line = getLine();\r\n    var lineCoordinate = getLineCoordinateByKeyOrient(keyAxisOrient, data, scaleKey, scaleValue, margin, keyField, valueField);\r\n    d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .select('.line')\r\n        .transition()\r\n        .duration(1000)\r\n        .attr('d', line(lineCoordinate));\r\n}\r\nfunction updateAreaChartByValueAxis(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient, blockWidth, blockHeight) {\r\n    var area = getArea(keyAxisOrient);\r\n    var areaCoordinate = getAreaCoordinateByKeyOrient(keyAxisOrient, data, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight);\r\n    d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .select('.area')\r\n        .transition()\r\n        .duration(1000)\r\n        .attr('d', area(areaCoordinate));\r\n}\r\nfunction updateBarChartByValueAxis(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient, blockWidth, blockHeight) {\r\n    var bars = d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .selectAll('rect.bar');\r\n    fillBarAttrsByKeyOrientWithTransition(bars, keyAxisOrient, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight, 1000);\r\n    for (var key in barStyle) {\r\n        bars.style(key, barStyle[key]);\r\n    }\r\n}\r\nfunction fillBarAttrsByKeyOrientWithTransition(bars, axisOrient, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight, transitionDuration) {\r\n    var barsTran = bars.transition().duration(transitionDuration);\r\n    if (axisOrient === 'top')\r\n        barsTran.attr('x', function (d) { return scaleKey(d[keyField]) + margin.left; })\r\n            .attr('y', function (d) { return margin.top; })\r\n            .attr('height', function (d) { return scaleValue(d[valueField]); })\r\n            .attr('width', function (d) { return scaleKey.bandwidth(); });\r\n    else if (axisOrient === 'bottom')\r\n        barsTran.attr('x', function (d) { return scaleKey(d[keyField]) + margin.left; })\r\n            .attr('y', function (d) { return scaleValue(d[valueField]) + margin.top; })\r\n            .attr('height', function (d) { return blockHeight - margin.top - margin.bottom - scaleValue(d[valueField]); })\r\n            .attr('width', function (d) { return scaleKey.bandwidth(); });\r\n    else if (axisOrient === 'left')\r\n        barsTran.attr('x', function (d) { return margin.left; })\r\n            .attr('y', function (d) { return scaleKey(d[keyField]) + margin.top; })\r\n            .attr('height', function (d) { return scaleKey.bandwidth(); })\r\n            .attr('width', function (d) { return scaleValue(d[valueField]); });\r\n    else if (axisOrient === 'right')\r\n        barsTran.attr('x', function (d) { return scaleValue(d[valueField]) + margin.left; })\r\n            .attr('y', function (d) { return scaleKey(d[keyField]) + margin.top; })\r\n            .attr('height', function (d) { return scaleKey.bandwidth(); })\r\n            .attr('width', function (d) { return blockWidth - margin.left - margin.right - scaleValue(d[valueField]); });\r\n}\r\nvar scales = {\r\n    scaleKey: null,\r\n    scaleValue: null\r\n};\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\r\n    render: function (model, data) {\r\n        fillScales(scales, model.scale);\r\n        renderSvgBlock(model.blockCanvas.class, model.blockCanvas.size.width, model.blockCanvas.size.height, model.blockCanvas.style);\r\n        renderAxis(scales.scaleKey, model.axis.keyAxis.orient, model.axis.keyAxis.translate.translateX, model.axis.keyAxis.translate.translateY, model.axis.keyAxis.class);\r\n        renderAxis(scales.scaleValue, model.axis.valueAxis.orient, model.axis.valueAxis.translate.translateX, model.axis.valueAxis.translate.translateY, model.axis.valueAxis.class);\r\n        renderCharts(model.charts, scales.scaleKey, scales.scaleValue, data, model.chartBlock.margin, model.axis.keyAxis.orient, model.blockCanvas.size.width, model.blockCanvas.size.height);\r\n    },\r\n    updateFullBlock: function (model, data) {\r\n        clearBlock();\r\n        this.render(model, data);\r\n    },\r\n    updateValueAxis: function (model, data) {\r\n        fillScales(scales, model.scale);\r\n        updateValueAxisDomain(scales.scaleValue, model.axis.valueAxis.class, model.axis.valueAxis.orient);\r\n        updateChartsByValueAxis(model.charts, scales.scaleKey, scales.scaleValue, data, model.chartBlock.margin, model.axis.keyAxis.orient, model.blockCanvas.size.width, model.blockCanvas.size.height);\r\n    }\r\n});\r\n\n\n//# sourceURL=webpack://packd3ts/./src/engine.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _modelOptions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modelOptions */ \"./src/modelOptions.ts\");\n/* harmony import */ var _engine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./engine */ \"./src/engine.ts\");\n/* harmony import */ var _config_configOptions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config/configOptions */ \"./src/config/configOptions.ts\");\nvar data = __webpack_require__(/*! ./assets/dataSet.json */ \"./src/assets/dataSet.json\");\r\n\r\n\r\n_engine__WEBPACK_IMPORTED_MODULE_1__.default.render(_modelOptions__WEBPACK_IMPORTED_MODULE_0__.model, data);\r\n\r\n//#region Controls Listeners\r\ndocument.querySelector('.btn-orient').addEventListener('click', function () {\r\n    var elem = document.querySelector('#chart-orient');\r\n    _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].orientation = elem.value;\r\n    _engine__WEBPACK_IMPORTED_MODULE_1__.default.updateFullBlock((0,_modelOptions__WEBPACK_IMPORTED_MODULE_0__.getUpdatedModel)(_config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default), data);\r\n});\r\ndocument.querySelector('.btn-key-position').addEventListener('click', function () {\r\n    var elem = document.querySelector('#key-axis-orient');\r\n    _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.axis.keyAxis.position = elem.value;\r\n    _engine__WEBPACK_IMPORTED_MODULE_1__.default.updateFullBlock((0,_modelOptions__WEBPACK_IMPORTED_MODULE_0__.getUpdatedModel)(_config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default), data);\r\n});\r\ndocument.querySelector('.btn-value-position').addEventListener('click', function () {\r\n    var elem = document.querySelector('#value-axis-orient');\r\n    _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.axis.valueAxis.position = elem.value;\r\n    _engine__WEBPACK_IMPORTED_MODULE_1__.default.updateFullBlock((0,_modelOptions__WEBPACK_IMPORTED_MODULE_0__.getUpdatedModel)(_config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default), data);\r\n});\r\ndocument.querySelector('.btn-domain').addEventListener('click', function () {\r\n    var start = document.querySelector('#domain-start').value;\r\n    var end = document.querySelector('#domain-end').value;\r\n    _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.axis.valueAxis.domain.start = parseInt(start || '-1');\r\n    _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.axis.valueAxis.domain.end = parseInt(end || '-1');\r\n    _engine__WEBPACK_IMPORTED_MODULE_1__.default.updateValueAxis((0,_modelOptions__WEBPACK_IMPORTED_MODULE_0__.getUpdatedModel)(_config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default), data);\r\n});\r\ndocument.querySelector('.btn-chart-type').addEventListener('click', function () {\r\n    var chartType = document.querySelector('#chart-type').value;\r\n    var chartFill = document.querySelector('#chart-fill').value;\r\n    var chartStroke = document.querySelector('#chart-stroke').value;\r\n    _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].type = chartType;\r\n    if (chartFill)\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].style.fill = chartFill;\r\n    if (chartStroke)\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].style.stroke = chartStroke;\r\n    if (_config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].type === 'line' && _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].style.fill !== 'none') {\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].style.fill = 'none';\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].style.stroke === 'none')\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default.charts[0].style.stroke = 'steelblue';\r\n    }\r\n    _engine__WEBPACK_IMPORTED_MODULE_1__.default.updateFullBlock((0,_modelOptions__WEBPACK_IMPORTED_MODULE_0__.getUpdatedModel)(_config_configOptions__WEBPACK_IMPORTED_MODULE_2__.default), data);\r\n});\r\n//#endregion\r\n\n\n//# sourceURL=webpack://packd3ts/./src/main.ts?");

/***/ }),

/***/ "./src/modelOptions.ts":
/*!*****************************!*\
  !*** ./src/modelOptions.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"model\": () => /* binding */ model,\n/* harmony export */   \"getUpdatedModel\": () => /* binding */ getUpdatedModel\n/* harmony export */ });\n/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ \"./node_modules/d3/index.js\");\n/* harmony import */ var _config_configOptions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config/configOptions */ \"./src/config/configOptions.ts\");\n\r\nvar data = __webpack_require__(/*! ./assets/dataSet.json */ \"./src/assets/dataSet.json\");\r\n\r\nvar AxisType;\r\n(function (AxisType) {\r\n    AxisType[AxisType[\"Key\"] = 0] = \"Key\";\r\n    AxisType[AxisType[\"Value\"] = 1] = \"Value\";\r\n})(AxisType || (AxisType = {}));\r\nvar ScaleType;\r\n(function (ScaleType) {\r\n    ScaleType[ScaleType[\"Key\"] = 0] = \"Key\";\r\n    ScaleType[ScaleType[\"Value\"] = 1] = \"Value\";\r\n})(ScaleType || (ScaleType = {}));\r\nvar dataSet = data[_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].data.dataSource];\r\nvar margin = {\r\n    top: 50,\r\n    bottom: 50,\r\n    left: 50,\r\n    right: 50\r\n};\r\nfunction getScaleRangePeek(scaleType, chartOrientation, blockWidth, blockHeight) {\r\n    if (chartOrientation === 'vertical')\r\n        return scaleType === ScaleType.Key\r\n            ? blockWidth - margin.left - margin.right\r\n            : blockHeight - margin.top - margin.bottom;\r\n    return scaleType === ScaleType.Key\r\n        ? blockHeight - margin.top - margin.bottom\r\n        : blockWidth - margin.left - margin.right;\r\n}\r\nfunction getScaleDomain(scaleType, configDomain, data, chart, keyAxisPosition) {\r\n    if (keyAxisPosition === void 0) { keyAxisPosition = null; }\r\n    if (scaleType === ScaleType.Key) {\r\n        return data.map(function (d) { return d[chart.data.keyField]; });\r\n    }\r\n    else {\r\n        var domainPeekMin = void 0;\r\n        var domainPeekMax = void 0;\r\n        if (configDomain.start === -1)\r\n            domainPeekMin = 0;\r\n        else\r\n            domainPeekMin = configDomain.start;\r\n        if (configDomain.end === -1)\r\n            domainPeekMax = d3__WEBPACK_IMPORTED_MODULE_0__.max(data, function (d) { return d[chart.data.valueField]; });\r\n        else\r\n            domainPeekMax = configDomain.end;\r\n        if (chart.orientation === 'horizontal')\r\n            if (keyAxisPosition === 'start')\r\n                return [domainPeekMin, domainPeekMax];\r\n            else\r\n                return [domainPeekMax, domainPeekMin];\r\n        else if (keyAxisPosition === 'start')\r\n            return [domainPeekMin, domainPeekMax];\r\n        else\r\n            return [domainPeekMax, domainPeekMin];\r\n    }\r\n}\r\nfunction getAxisOrient(axisType, chartOrientation, axisPosition) {\r\n    if (chartOrientation === 'vertical') {\r\n        if (axisPosition === 'start')\r\n            return axisType === AxisType.Key ? 'top' : 'left';\r\n        else\r\n            return axisType === AxisType.Key ? 'bottom' : 'right';\r\n    }\r\n    else {\r\n        if (axisPosition === 'start')\r\n            return axisType === AxisType.Key ? 'left' : 'top';\r\n        else\r\n            return axisType === AxisType.Key ? 'right' : 'bottom';\r\n    }\r\n}\r\nfunction getTranslateX(axisType, chartOrientation, axisPosition, blockWidth, blockHeight) {\r\n    var orient = getAxisOrient(axisType, chartOrientation, axisPosition);\r\n    if (orient === 'top' || orient === 'left')\r\n        return margin.left;\r\n    else if (orient === 'bottom')\r\n        return margin.left;\r\n    else\r\n        return blockWidth - margin.right;\r\n}\r\nfunction getTranslateY(axisType, chartOrientation, axisPosition, blockWidth, blockHeight) {\r\n    var orient = getAxisOrient(axisType, chartOrientation, axisPosition);\r\n    if (orient === 'top' || orient === 'left')\r\n        return margin.top;\r\n    else if (orient === 'bottom')\r\n        return blockHeight - margin.bottom;\r\n    else\r\n        return margin.top;\r\n}\r\nfunction getChartsModel(charts) {\r\n    var chartsModel = [];\r\n    charts.forEach(function (chart) {\r\n        chartsModel.push({\r\n            data: {\r\n                dataSource: chart.data.dataSource,\r\n                keyField: chart.data.keyField,\r\n                valueField: chart.data.valueField\r\n            },\r\n            style: chart.style,\r\n            type: chart.type\r\n        });\r\n    });\r\n    return chartsModel;\r\n}\r\nvar model = {\r\n    blockCanvas: {\r\n        size: {\r\n            width: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width,\r\n            height: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height\r\n        },\r\n        class: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.class,\r\n        style: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.style\r\n    },\r\n    chartBlock: {\r\n        margin: margin\r\n    },\r\n    scale: {\r\n        scaleKey: {\r\n            domain: getScaleDomain(ScaleType.Key, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.keyAxis.domain, dataSet, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0]),\r\n            range: {\r\n                start: 0,\r\n                end: getScaleRangePeek(ScaleType.Key, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].orientation, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height)\r\n            }\r\n        },\r\n        scaleValue: {\r\n            domain: getScaleDomain(ScaleType.Value, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.valueAxis.domain, dataSet, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0], _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.keyAxis.position),\r\n            range: {\r\n                start: 0,\r\n                end: getScaleRangePeek(ScaleType.Value, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].orientation, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height)\r\n            }\r\n        }\r\n    },\r\n    axis: {\r\n        keyAxis: {\r\n            orient: getAxisOrient(AxisType.Key, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].orientation, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.keyAxis.position),\r\n            translate: {\r\n                translateX: getTranslateX(AxisType.Key, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].orientation, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.keyAxis.position, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height),\r\n                translateY: getTranslateY(AxisType.Key, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].orientation, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.keyAxis.position, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height)\r\n            },\r\n            class: 'key-axis'\r\n        },\r\n        valueAxis: {\r\n            orient: getAxisOrient(AxisType.Value, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].orientation, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.valueAxis.position),\r\n            translate: {\r\n                translateX: getTranslateX(AxisType.Value, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].orientation, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.valueAxis.position, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height),\r\n                translateY: getTranslateY(AxisType.Value, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts[0].orientation, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.axis.valueAxis.position, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height)\r\n            },\r\n            class: 'value-axis'\r\n        }\r\n    },\r\n    charts: getChartsModel(_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.charts)\r\n};\r\nfunction getUpdatedModel(config) {\r\n    return {\r\n        blockCanvas: {\r\n            size: {\r\n                width: config.canvas.size.width,\r\n                height: config.canvas.size.height\r\n            },\r\n            class: config.canvas.class,\r\n            style: config.canvas.style\r\n        },\r\n        chartBlock: {\r\n            margin: margin\r\n        },\r\n        scale: {\r\n            scaleKey: {\r\n                domain: getScaleDomain(ScaleType.Key, config.axis.keyAxis.domain, dataSet, config.charts[0]),\r\n                range: {\r\n                    start: 0,\r\n                    end: getScaleRangePeek(ScaleType.Key, config.charts[0].orientation, config.canvas.size.width, config.canvas.size.height)\r\n                }\r\n            },\r\n            scaleValue: {\r\n                domain: getScaleDomain(ScaleType.Value, config.axis.valueAxis.domain, dataSet, config.charts[0], config.axis.keyAxis.position),\r\n                range: {\r\n                    start: 0,\r\n                    end: getScaleRangePeek(ScaleType.Value, config.charts[0].orientation, config.canvas.size.width, config.canvas.size.height)\r\n                }\r\n            }\r\n        },\r\n        axis: {\r\n            keyAxis: {\r\n                orient: getAxisOrient(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position),\r\n                translate: {\r\n                    translateX: getTranslateX(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position, config.canvas.size.width, config.canvas.size.height),\r\n                    translateY: getTranslateY(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position, config.canvas.size.width, config.canvas.size.height)\r\n                },\r\n                class: 'key-axis'\r\n            },\r\n            valueAxis: {\r\n                orient: getAxisOrient(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position),\r\n                translate: {\r\n                    translateX: getTranslateX(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position, config.canvas.size.width, config.canvas.size.height),\r\n                    translateY: getTranslateY(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position, config.canvas.size.width, config.canvas.size.height)\r\n                },\r\n                class: 'value-axis'\r\n            }\r\n        },\r\n        charts: getChartsModel(config.charts)\r\n    };\r\n}\r\n\n\n//# sourceURL=webpack://packd3ts/./src/modelOptions.ts?");

/***/ }),

/***/ "./src/assets/dataSet.json":
/*!*********************************!*\
  !*** ./src/assets/dataSet.json ***!
  \*********************************/
/***/ ((module) => {

eval("module.exports = JSON.parse(\"{\\\"dataSet\\\":[{\\\"brand\\\":\\\"BMW\\\",\\\"price\\\":120},{\\\"brand\\\":\\\"LADA\\\",\\\"price\\\":50},{\\\"brand\\\":\\\"MERCEDES\\\",\\\"price\\\":15},{\\\"brand\\\":\\\"AUDI\\\",\\\"price\\\":20},{\\\"brand\\\":\\\"VOLKSWAGEN\\\",\\\"price\\\":40},{\\\"brand\\\":\\\"DODGE\\\",\\\"price\\\":70},{\\\"brand\\\":\\\"SAAB\\\",\\\"price\\\":50},{\\\"brand\\\":\\\"HONDA\\\",\\\"price\\\":20},{\\\"brand\\\":\\\"TOYOTA\\\",\\\"price\\\":115}]}\");\n\n//# sourceURL=webpack://packd3ts/./src/assets/dataSet.json?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	// It's empty as some runtime module handles the default behavior
/******/ 	__webpack_require__.x = x => {}
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// Promise = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		var deferredModules = [
/******/ 			["./src/main.ts","vendors-node_modules_d3_index_js"]
/******/ 		];
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		var checkDeferredModules = x => {};
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime, executeModules] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0, resolves = [];
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					resolves.push(installedChunks[chunkId][0]);
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			while(resolves.length) {
/******/ 				resolves.shift()();
/******/ 			}
/******/ 		
/******/ 			// add entry modules from loaded chunk to deferred list
/******/ 			if(executeModules) deferredModules.push.apply(deferredModules, executeModules);
/******/ 		
/******/ 			// run deferred modules when all chunks ready
/******/ 			return checkDeferredModules();
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkpackd3ts"] = self["webpackChunkpackd3ts"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 		
/******/ 		function checkDeferredModulesImpl() {
/******/ 			var result;
/******/ 			for(var i = 0; i < deferredModules.length; i++) {
/******/ 				var deferredModule = deferredModules[i];
/******/ 				var fulfilled = true;
/******/ 				for(var j = 1; j < deferredModule.length; j++) {
/******/ 					var depId = deferredModule[j];
/******/ 					if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferredModules.splice(i--, 1);
/******/ 					result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 				}
/******/ 			}
/******/ 			if(deferredModules.length === 0) {
/******/ 				__webpack_require__.x();
/******/ 				__webpack_require__.x = x => {};
/******/ 			}
/******/ 			return result;
/******/ 		}
/******/ 		var startup = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			// reset startup function so it can be called again when more startup code is added
/******/ 			__webpack_require__.x = startup || (x => {});
/******/ 			return (checkDeferredModules = checkDeferredModulesImpl)();
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// run startup
/******/ 	return __webpack_require__.x();
/******/ })()
;