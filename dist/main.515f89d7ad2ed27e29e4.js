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

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ \"./node_modules/d3/index.js\");\n/* harmony import */ var _model_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model.ts */ \"./src/model.ts\");\n\r\nvar data = __webpack_require__(/*! ./assets/dataSet.json */ \"./src/assets/dataSet.json\");\r\n\r\nfunction getScaleBand(domain, rangeStart, rangeEnd) {\r\n    return d3__WEBPACK_IMPORTED_MODULE_0__.scaleBand()\r\n        .domain(domain)\r\n        .range([rangeStart, rangeEnd]);\r\n}\r\nfunction getScaleLinear(domain, rangeStart, rangeEnd) {\r\n    console.log(domain);\r\n    return d3__WEBPACK_IMPORTED_MODULE_0__.scaleLinear()\r\n        .domain(domain)\r\n        .range([rangeStart, rangeEnd]);\r\n}\r\nfunction renderSvgBlock(cssClass, width, height, style) {\r\n    var svg = d3__WEBPACK_IMPORTED_MODULE_0__.select('.wrapper')\r\n        .append('svg')\r\n        .attr('width', width)\r\n        .attr('height', height)\r\n        .attr('class', cssClass);\r\n    for (var key in style) {\r\n        svg.style(key, style[key]);\r\n    }\r\n}\r\nfunction getAxisByOrient(orient, scale) {\r\n    if (orient === 'top')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisTop(scale);\r\n    if (orient === 'bottom')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisBottom(scale);\r\n    if (orient === 'left')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisLeft(scale);\r\n    if (orient === 'right')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisRight(scale);\r\n}\r\nfunction renderAxis(scale, axisOrient, translateX, translateY) {\r\n    var axis = getAxisByOrient(axisOrient, scale);\r\n    d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .append('g')\r\n        .attr('transform', \"translate(\" + translateX + \", \" + translateY + \")\")\r\n        .call(axis);\r\n}\r\nvar scales = {\r\n    scaleKey: null,\r\n    scaleValue: null\r\n};\r\nscales.scaleKey = getScaleBand(_model_ts__WEBPACK_IMPORTED_MODULE_1__.default.scale.scaleKey.domain, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.scale.scaleKey.range.start, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.scale.scaleKey.range.end);\r\nscales.scaleValue = getScaleLinear(_model_ts__WEBPACK_IMPORTED_MODULE_1__.default.scale.scaleValue.domain, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.scale.scaleValue.range.start, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.scale.scaleValue.range.end);\r\nrenderSvgBlock(_model_ts__WEBPACK_IMPORTED_MODULE_1__.default.blockCanvas.class, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.blockCanvas.size.width, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.blockCanvas.size.height, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.blockCanvas.style);\r\nrenderAxis(scales.scaleKey, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.axis.keyAxis.orient, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.axis.keyAxis.translate.translateX, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.axis.keyAxis.translate.translateY);\r\nrenderAxis(scales.scaleValue, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.axis.valueAxis.orient, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.axis.valueAxis.translate.translateX, _model_ts__WEBPACK_IMPORTED_MODULE_1__.default.axis.valueAxis.translate.translateY);\r\n\n\n//# sourceURL=webpack://packd3ts/./src/main.ts?");

/***/ }),

/***/ "./src/model.ts":
/*!**********************!*\
  !*** ./src/model.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\n/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ \"./node_modules/d3/index.js\");\n\r\nvar data = __webpack_require__(/*! ./assets/dataSet.json */ \"./src/assets/dataSet.json\");\r\nvar AxisType;\r\n(function (AxisType) {\r\n    AxisType[AxisType[\"Key\"] = 0] = \"Key\";\r\n    AxisType[AxisType[\"Value\"] = 1] = \"Value\";\r\n})(AxisType || (AxisType = {}));\r\nvar ScaleType;\r\n(function (ScaleType) {\r\n    ScaleType[ScaleType[\"Key\"] = 0] = \"Key\";\r\n    ScaleType[ScaleType[\"Value\"] = 1] = \"Value\";\r\n})(ScaleType || (ScaleType = {}));\r\n//#endregion\r\nvar config = {\r\n    canvas: {\r\n        class: 'chart-1',\r\n        size: {\r\n            width: 1000,\r\n            height: 500\r\n        },\r\n        style: {\r\n            'border': '1px solid black'\r\n        }\r\n    },\r\n    axis: {\r\n        keyAxis: {\r\n            domain: {\r\n                start: -1,\r\n                end: -1\r\n            },\r\n            position: 'end'\r\n        },\r\n        valueAxis: {\r\n            domain: {\r\n                start: 0,\r\n                end: 150\r\n            },\r\n            position: 'start'\r\n        }\r\n    },\r\n    charts: [\r\n        {\r\n            title: 'Car prices',\r\n            legend: {\r\n                position: 'off'\r\n            },\r\n            style: {\r\n                'fill': 'steelblue'\r\n            },\r\n            type: 'bar',\r\n            data: {\r\n                dataSource: 'dataSet',\r\n                keyField: 'brand',\r\n                valueField: 'price'\r\n            },\r\n            orientation: 'vertical'\r\n        }\r\n    ]\r\n};\r\nvar dataSet = data.data;\r\nvar margin = {\r\n    top: 50,\r\n    bottom: 50,\r\n    left: 50,\r\n    right: 50\r\n};\r\nfunction getScaleRangePeek(scaleType, chartOrientation, blockWidth, blockHeight) {\r\n    var rangePeek;\r\n    if (chartOrientation === 'vertical')\r\n        rangePeek = scaleType === ScaleType.Key\r\n            ? blockWidth - margin.left - margin.right\r\n            : blockHeight - margin.top - margin.bottom;\r\n    else\r\n        rangePeek = scaleType === ScaleType.Key\r\n            ? blockHeight - margin.top - margin.bottom\r\n            : blockWidth - margin.left - margin.right;\r\n    return rangePeek;\r\n}\r\nfunction getScaleDomain(scaleType, configDomain, data, chart) {\r\n    if (scaleType === ScaleType.Key) {\r\n        return data.map(function (d) { return d[chart.data.keyField]; });\r\n    }\r\n    else {\r\n        if (configDomain.start === -1 || configDomain.end === -1) {\r\n            if (chart.orientation === 'horizontal')\r\n                return [0, d3__WEBPACK_IMPORTED_MODULE_0__.max(data, function (d) { return d[chart.data.valueField]; })];\r\n            else\r\n                return [d3__WEBPACK_IMPORTED_MODULE_0__.max(data, function (d) { return d[chart.data.valueField]; }), 0];\r\n        }\r\n        else {\r\n            if (chart.orientation === 'horizontal')\r\n                return [configDomain.start, configDomain.end];\r\n            else\r\n                return [configDomain.end, configDomain.start];\r\n        }\r\n    }\r\n}\r\nfunction getAxisOrient(axisType, chartOrientation, axisPosition) {\r\n    if (chartOrientation === 'vertical') {\r\n        if (axisPosition === 'start')\r\n            return axisType === AxisType.Key ? 'top' : 'left';\r\n        else\r\n            return axisType === AxisType.Key ? 'bottom' : 'right';\r\n    }\r\n    else {\r\n        if (axisPosition === 'start')\r\n            return axisType === AxisType.Key ? 'left' : 'top';\r\n        else\r\n            return axisType === AxisType.Key ? 'right' : 'bottom';\r\n    }\r\n}\r\nfunction getTranslateX(axisType, chartOrientation, axisPosition, blockWidth, blockHeight) {\r\n    var orient = getAxisOrient(axisType, chartOrientation, axisPosition);\r\n    if (orient === 'top' || orient === 'left')\r\n        return margin.left;\r\n    else if (orient === 'bottom')\r\n        return margin.left;\r\n    else\r\n        return blockWidth - margin.right;\r\n}\r\nfunction getTranslateY(axisType, chartOrientation, axisPosition, blockWidth, blockHeight) {\r\n    var orient = getAxisOrient(axisType, chartOrientation, axisPosition);\r\n    if (orient === 'top' || orient === 'left')\r\n        return margin.top;\r\n    else if (orient === 'bottom')\r\n        return blockHeight - margin.bottom;\r\n    else\r\n        return margin.top;\r\n}\r\nvar model = {\r\n    blockCanvas: {\r\n        size: {\r\n            width: config.canvas.size.width,\r\n            height: config.canvas.size.height\r\n        },\r\n        class: config.canvas.class,\r\n        style: config.canvas.style\r\n    },\r\n    chartBlock: {\r\n        margin: margin\r\n    },\r\n    scale: {\r\n        scaleKey: {\r\n            domain: getScaleDomain(ScaleType.Key, config.axis.keyAxis.domain, dataSet, config.charts[0]),\r\n            range: {\r\n                start: 0,\r\n                end: getScaleRangePeek(ScaleType.Key, config.charts[0].orientation, config.canvas.size.width, config.canvas.size.height)\r\n            }\r\n        },\r\n        scaleValue: {\r\n            domain: getScaleDomain(ScaleType.Value, config.axis.keyAxis.domain, dataSet, config.charts[0]),\r\n            range: {\r\n                start: 0,\r\n                end: getScaleRangePeek(ScaleType.Value, config.charts[0].orientation, config.canvas.size.width, config.canvas.size.height)\r\n            }\r\n        }\r\n    },\r\n    axis: {\r\n        keyAxis: {\r\n            orient: getAxisOrient(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position),\r\n            translate: {\r\n                translateX: getTranslateX(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position, config.canvas.size.width, config.canvas.size.height),\r\n                translateY: getTranslateY(AxisType.Key, config.charts[0].orientation, config.axis.keyAxis.position, config.canvas.size.width, config.canvas.size.height)\r\n            }\r\n        },\r\n        valueAxis: {\r\n            orient: getAxisOrient(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position),\r\n            translate: {\r\n                translateX: getTranslateX(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position, config.canvas.size.width, config.canvas.size.height),\r\n                translateY: getTranslateY(AxisType.Value, config.charts[0].orientation, config.axis.valueAxis.position, config.canvas.size.width, config.canvas.size.height)\r\n            }\r\n        }\r\n    }\r\n};\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (model);\r\n\n\n//# sourceURL=webpack://packd3ts/./src/model.ts?");

/***/ }),

/***/ "./src/assets/dataSet.json":
/*!*********************************!*\
  !*** ./src/assets/dataSet.json ***!
  \*********************************/
/***/ ((module) => {

eval("module.exports = JSON.parse(\"{\\\"data\\\":[{\\\"brand\\\":\\\"BMW\\\",\\\"price\\\":120},{\\\"brand\\\":\\\"LADA\\\",\\\"price\\\":92},{\\\"brand\\\":\\\"MERCEDES\\\",\\\"price\\\":15},{\\\"brand\\\":\\\"AUDI\\\",\\\"price\\\":20},{\\\"brand\\\":\\\"VOLKSWAGEN\\\",\\\"price\\\":40},{\\\"brand\\\":\\\"DODGE\\\",\\\"price\\\":70},{\\\"brand\\\":\\\"SAAB\\\",\\\"price\\\":50},{\\\"brand\\\":\\\"HONDA\\\",\\\"price\\\":20},{\\\"brand\\\":\\\"TOYOTA\\\",\\\"price\\\":115}]}\");\n\n//# sourceURL=webpack://packd3ts/./src/assets/dataSet.json?");

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