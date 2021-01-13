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

/***/ "./src/listeners/listeners.ts":
/*!************************************!*\
  !*** ./src/listeners/listeners.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _engine_engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../engine/engine */ \"./src/engine/engine.ts\");\n/* harmony import */ var _config_configOptions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config/configOptions */ \"./src/config/configOptions.ts\");\n/* harmony import */ var _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../designer/designerConfigOptions */ \"./src/designer/designerConfigOptions.ts\");\n/* harmony import */ var _model_modelOptions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../model/modelOptions */ \"./src/model/modelOptions.ts\");\n/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! d3 */ \"./node_modules/d3/index.js\");\n\r\n\r\n\r\n\r\n\r\nvar data = __webpack_require__(/*! ../assets/dataSet.json */ \"./src/assets/dataSet.json\");\r\nfunction randInt(min, max) {\r\n    return Math.round(Math.random() * (max - min) + min);\r\n}\r\nfunction getCopy(obj) {\r\n    var newObj = {};\r\n    if (typeof obj === 'object') {\r\n        for (var key in obj) {\r\n            if (Array.isArray(obj[key])) {\r\n                newObj[key] = getCopyOfArr(obj[key]);\r\n            }\r\n            else if (typeof obj[key] === 'object') {\r\n                newObj[key] = getCopy(obj[key]);\r\n            }\r\n            else {\r\n                newObj[key] = obj[key];\r\n            }\r\n        }\r\n    }\r\n    else {\r\n        return obj;\r\n    }\r\n    return newObj;\r\n}\r\nfunction getDataWithRandomValues(data, maxRand) {\r\n    _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.forEach(function (chart) {\r\n        data[chart.data.dataSource].forEach(function (row) {\r\n            row[chart.data.valueField.name] = randInt(0, maxRand);\r\n        });\r\n    });\r\n    return data;\r\n}\r\nfunction getCopyOfArr(initial) {\r\n    var newArr = [];\r\n    initial.forEach(function (d) { return newArr.push(getCopy(d)); });\r\n    return newArr;\r\n}\r\nfunction getInputValue(selector) {\r\n    return document.querySelector(selector).value;\r\n}\r\nfunction setInputValue(selector, value) {\r\n    document.querySelector(selector).value = value.toString();\r\n}\r\nfunction setCheckboxValue(selector, value) {\r\n    document.querySelector(selector).checked = value;\r\n}\r\nfunction showControlsForNotation(notationType) {\r\n    if (notationType === '2d') {\r\n        document.querySelector('.controls-polar').style.display = 'none';\r\n        document.querySelector('.controls-2d').style.display = 'flex';\r\n    }\r\n    else {\r\n        document.querySelector('.controls-2d').style.display = 'none';\r\n        document.querySelector('.controls-polar').style.display = 'flex';\r\n    }\r\n}\r\nfunction changeConfigOptions(notationType) {\r\n    if (notationType === '2d') {\r\n        var options = {\r\n            type: notationType,\r\n            charts: [\r\n                {\r\n                    data: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].data,\r\n                    legend: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].legend,\r\n                    title: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].title,\r\n                    tooltip: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].tooltip,\r\n                    orientation: getInputValue('#chart-orient'),\r\n                    type: getInputValue('#chart-2d-type')\r\n                }\r\n            ],\r\n            axis: {\r\n                keyAxis: {\r\n                    domain: {\r\n                        start: -1,\r\n                        end: -1\r\n                    },\r\n                    position: getInputValue('#key-axis-orient')\r\n                },\r\n                valueAxis: {\r\n                    domain: {\r\n                        start: -1,\r\n                        end: -1\r\n                    },\r\n                    position: getInputValue('#key-axis-orient')\r\n                }\r\n            },\r\n            additionalElements: {\r\n                gridLine: {\r\n                    flag: {\r\n                        horizontal: true,\r\n                        vertical: false\r\n                    }\r\n                }\r\n            }\r\n        };\r\n        if ((options.charts[0].type === 'line' || options.charts[0].type === 'bar') && options.charts.length === 1) {\r\n            options.charts.push(getCopy(options.charts[0]));\r\n            options.charts[1].data.dataSource = options.charts[0].data.dataSource + '2';\r\n        }\r\n        else if ((options.charts[0].type === 'line' || options.charts[0].type === 'bar') && options.charts.length === 2) {\r\n            options.charts[1] = getCopy(options.charts[0]);\r\n            options.charts[1].data.dataSource = options.charts[0].data.dataSource + '2';\r\n        }\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options = options;\r\n    }\r\n    else {\r\n        var options = {\r\n            type: notationType,\r\n            charts: [\r\n                {\r\n                    data: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].data,\r\n                    legend: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].legend,\r\n                    title: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].title,\r\n                    tooltip: _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].tooltip,\r\n                    type: 'donut',\r\n                    appearanceOptions: {\r\n                        innerRadius: parseFloat(getInputValue('#inner-radius')) || 0,\r\n                        padAngle: parseFloat(getInputValue('#pad-angle')) || 0\r\n                    }\r\n                }\r\n            ]\r\n        };\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options = options;\r\n    }\r\n    _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n}\r\nfunction change2DChartConfig(chartType) {\r\n    if (chartType === 'area') {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.length !== 1)\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.splice(1, _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.length - 1);\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].type = chartType;\r\n    }\r\n    else if ((chartType === 'bar' || chartType === 'line') && _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.length === 1) {\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.push(getCopy(_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0]));\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.forEach(function (chart) { return chart.type = chartType; });\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[1].data.dataSource = _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].data.dataSource + '2';\r\n    }\r\n    else if ((chartType === 'bar' || chartType === 'line') && _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.length === 2) {\r\n        // config.options.charts[1] = getCopy(config.options.charts[0]);\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.forEach(function (chart) { return chart.type = chartType; });\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[1].data.dataSource = _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].data.dataSource + '2';\r\n    }\r\n}\r\nfunction setMainListeners() {\r\n    document.querySelector('#notation').addEventListener('change', function () {\r\n        showControlsForNotation(this.value);\r\n        changeConfigOptions(this.value);\r\n        setControlsValues();\r\n    });\r\n    document.querySelector('#block-width').addEventListener('keydown', function (e) {\r\n        if (e.code === 'Enter') {\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width = parseFloat(getInputValue('#block-width')) || 0;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n        }\r\n    });\r\n    document.querySelector('#block-height').addEventListener('keydown', function (e) {\r\n        if (e.code === 'Enter') {\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height = parseFloat(getInputValue('#block-height')) || 0;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n        }\r\n    });\r\n}\r\nfunction setDesignerListeners() {\r\n    document.querySelector('#axis-label-width').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.axisLabel.maxSize.main = parseFloat(getInputValue('#axis-label-width'));\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#chart-block-margin-top').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartBlockMargin.top = parseFloat(getInputValue('#chart-block-margin-top')) || 0;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#chart-block-margin-bottom').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartBlockMargin.bottom = parseFloat(getInputValue('#chart-block-margin-bottom')) || 0;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#chart-block-margin-left').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartBlockMargin.left = parseFloat(getInputValue('#chart-block-margin-left')) || 0;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#chart-block-margin-right').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartBlockMargin.right = parseFloat(getInputValue('#chart-block-margin-right')) || 0;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#bar-distance').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartOptions.bar.barDistance = parseFloat(getInputValue('#bar-distance')) || 0;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#bar-group-distance').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartOptions.bar.groupDistance = parseFloat(getInputValue('#bar-group-distance'));\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#min-bar-size').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartOptions.bar.minBarWidth = parseFloat(getInputValue('#min-bar-size')) || 0;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#min-donut-part-size').addEventListener('input', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartOptions.donut.minPartSize = parseFloat(getInputValue('#min-donut-part-size')) || 0;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#designer-vertical-grid').addEventListener('change', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.additionalElements.gridLine.flag.vertical = this.checked;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), data);\r\n    });\r\n    document.querySelector('#designer-horizontal-grid').addEventListener('change', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.additionalElements.gridLine.flag.horizontal = this.checked;\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), data);\r\n    });\r\n    document.querySelector('.btn-base-color').addEventListener('click', function () {\r\n        _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.chart.style.palette[0] = (0,d3__WEBPACK_IMPORTED_MODULE_4__.color)(getInputValue('#base-color'));\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), data);\r\n    });\r\n}\r\nfunction setCommonListeners() {\r\n    document.querySelector('#data-size').addEventListener('change', function () {\r\n        var _this = this;\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.forEach(function (chart, index) {\r\n            chart.data.dataSource = _this.value === 'normal'\r\n                ? 'dataSet' + (index === 0 ? '' : \"\" + (index + 1))\r\n                : 'dataSet_large' + (index === 0 ? '' : \"\" + (index + 1));\r\n        });\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('#legend').addEventListener('change', function () {\r\n        var _this = this;\r\n        _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts.forEach(function (chart) {\r\n            chart.legend.position = _this.value;\r\n        });\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n    });\r\n    document.querySelector('.btn-random').addEventListener('click', function () {\r\n        var max = parseInt(getInputValue('#max-random-value')) || 120;\r\n        var copy = getCopy(data);\r\n        var newData = getDataWithRandomValues(copy, max);\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.start = -1;\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.end = max;\r\n        }\r\n        _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(newData), newData);\r\n    });\r\n    document.querySelector('#max-random-value').addEventListener('keydown', function (e) {\r\n        if (e.code === 'Enter') {\r\n            var max = parseInt(getInputValue('#max-random-value')) || 120;\r\n            var copy = getCopy(data);\r\n            var newData = getDataWithRandomValues(copy, max);\r\n            if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n                _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.start = -1;\r\n                _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.end = max;\r\n            }\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(newData), newData);\r\n        }\r\n    });\r\n}\r\nfunction set2DListeners() {\r\n    document.querySelector('#chart-2d-type').addEventListener('change', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n            change2DChartConfig(this.value);\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n        }\r\n    });\r\n    document.querySelector('#chart-orient').addEventListener('change', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].orientation = this.value;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n        }\r\n    });\r\n    document.querySelector('#key-axis-orient').addEventListener('change', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.keyAxis.position = this.value;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n        }\r\n    });\r\n    document.querySelector('#value-axis-orient').addEventListener('change', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.position = this.value;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n        }\r\n    });\r\n    document.querySelector('.btn-domain').addEventListener('click', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n            var start = getInputValue('#domain-start');\r\n            var end = getInputValue('#domain-end');\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.start = parseInt(start) || -1;\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.end = parseInt(end) || -1;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateValueAxis((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n        }\r\n    });\r\n    document.querySelector('#domain-start').addEventListener('keydown', function (e) {\r\n        if (e.code === 'Enter') {\r\n            if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n                var start = getInputValue('#domain-start');\r\n                var end = getInputValue('#domain-end');\r\n                _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.start = parseInt(start) || -1;\r\n                _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.end = parseInt(end) || -1;\r\n                _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateValueAxis((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n            }\r\n        }\r\n    });\r\n    document.querySelector('#domain-end').addEventListener('keydown', function (e) {\r\n        if (e.code === 'Enter') {\r\n            if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n                var start = getInputValue('#domain-start');\r\n                var end = getInputValue('#domain-end');\r\n                _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.start = parseInt(start) || -1;\r\n                _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.domain.end = parseInt(end) || -1;\r\n                _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateValueAxis((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), getCopy(data));\r\n            }\r\n        }\r\n    });\r\n    document.querySelector('#config-vertical-grid').addEventListener('change', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.additionalElements.gridLine.flag.vertical = this.checked;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), data);\r\n        }\r\n    });\r\n    document.querySelector('#config-horizontal-grid').addEventListener('change', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.additionalElements.gridLine.flag.horizontal = this.checked;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), data);\r\n        }\r\n    });\r\n}\r\nfunction setPolarListeners() {\r\n    document.querySelector('#inner-radius').addEventListener('input', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === 'polar') {\r\n            var innerRadius = getInputValue('#inner-radius');\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].appearanceOptions.innerRadius = parseInt(innerRadius) || 0;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), data);\r\n        }\r\n    });\r\n    document.querySelector('#pad-angle').addEventListener('input', function () {\r\n        if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === 'polar') {\r\n            var padAngle = getInputValue('#pad-angle');\r\n            _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].appearanceOptions.padAngle = parseFloat(padAngle) || 0;\r\n            _engine_engine__WEBPACK_IMPORTED_MODULE_0__.default.updateFullBlock((0,_model_modelOptions__WEBPACK_IMPORTED_MODULE_3__.getUpdatedModel)(), data);\r\n        }\r\n    });\r\n}\r\nfunction setControlsValues() {\r\n    setInputValue('#notation', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type);\r\n    setInputValue('#block-width', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.width);\r\n    setInputValue('#block-height', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.canvas.size.height);\r\n    setInputValue('#legend', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].legend.position);\r\n    setInputValue('#data-size', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].data.dataSource.includes('large') ? 'large' : 'normal');\r\n    setInputValue('#axis-label-width', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.axisLabel.maxSize.main);\r\n    setInputValue('#chart-block-margin-top', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartBlockMargin.top);\r\n    setInputValue('#chart-block-margin-bottom', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartBlockMargin.bottom);\r\n    setInputValue('#chart-block-margin-left', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartBlockMargin.left);\r\n    setInputValue('#chart-block-margin-right', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartBlockMargin.right);\r\n    setInputValue('#bar-distance', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartOptions.bar.barDistance);\r\n    setInputValue('#bar-group-distance', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartOptions.bar.groupDistance);\r\n    setInputValue('#min-bar-size', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartOptions.bar.minBarWidth);\r\n    setInputValue('#min-donut-part-size', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.canvas.chartOptions.donut.minPartSize);\r\n    setCheckboxValue('#designer-horizontal-grid', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.additionalElements.gridLine.flag.horizontal);\r\n    setCheckboxValue('#designer-vertical-grid', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.additionalElements.gridLine.flag.vertical);\r\n    setInputValue('#base-color', _designer_designerConfigOptions__WEBPACK_IMPORTED_MODULE_2__.default.chart.style.palette[0].hex());\r\n    if (_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type === '2d') {\r\n        setInputValue('#chart-2d-type', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].type);\r\n        setInputValue('#chart-orient', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].orientation);\r\n        setInputValue('#key-axis-orient', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.keyAxis.position);\r\n        setInputValue('#value-axis-orient', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.axis.valueAxis.position);\r\n        setCheckboxValue('#config-horizontal-grid', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.additionalElements.gridLine.flag.horizontal);\r\n        setCheckboxValue('#config-vertical-grid', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.additionalElements.gridLine.flag.vertical);\r\n    }\r\n    else {\r\n        setInputValue('#chart-polar-type', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].type);\r\n        setInputValue('#inner-radius', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].appearanceOptions.innerRadius.toString());\r\n        setInputValue('#pad-angle', _config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.charts[0].appearanceOptions.padAngle.toString());\r\n    }\r\n}\r\nsetControlsValues();\r\nshowControlsForNotation(_config_configOptions__WEBPACK_IMPORTED_MODULE_1__.default.options.type);\r\nsetMainListeners();\r\nsetDesignerListeners();\r\nsetCommonListeners();\r\nset2DListeners();\r\nsetPolarListeners();\r\n\n\n//# sourceURL=webpack://packd3ts/./src/listeners/listeners.ts?");

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
/******/ 			id: moduleId,
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 			"listeners": 0
/******/ 		};
/******/ 		
/******/ 		var deferredModules = [
/******/ 			["./src/listeners/listeners.ts","vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_d3_index_js-node_modules_sty-ef83b8","src_engine_engine_ts-src_model_modelOptions_ts"]
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