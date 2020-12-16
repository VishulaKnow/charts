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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__\n/* harmony export */ });\n/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ \"./node_modules/d3/index.js\");\n\r\nfunction getScaleBand(domain, rangeStart, rangeEnd) {\r\n    return d3__WEBPACK_IMPORTED_MODULE_0__.scaleBand()\r\n        .domain(domain)\r\n        .range([rangeStart, rangeEnd])\r\n        .padding(0.1);\r\n}\r\nfunction getScaleLinear(domain, rangeStart, rangeEnd) {\r\n    return d3__WEBPACK_IMPORTED_MODULE_0__.scaleLinear()\r\n        .domain(domain)\r\n        .range([rangeStart, rangeEnd]);\r\n}\r\nfunction renderSvgBlock(cssClass, width, height, style) {\r\n    var svg = d3__WEBPACK_IMPORTED_MODULE_0__.select('.wrapper')\r\n        .append('svg')\r\n        .attr('width', width)\r\n        .attr('height', height)\r\n        .attr('class', cssClass);\r\n    for (var key in style) {\r\n        svg.style(key, style[key]);\r\n    }\r\n}\r\nfunction getAxisByOrient(orient, scale) {\r\n    if (orient === 'top')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisTop(scale);\r\n    if (orient === 'bottom')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisBottom(scale);\r\n    if (orient === 'left')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisLeft(scale);\r\n    if (orient === 'right')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.axisRight(scale);\r\n}\r\nfunction renderAxis(scale, axisOrient, translateX, translateY) {\r\n    var axis = getAxisByOrient(axisOrient, scale);\r\n    d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .append('g')\r\n        .attr('transform', \"translate(\" + translateX + \", \" + translateY + \")\")\r\n        .call(axis);\r\n}\r\nfunction fillBarAttrsByKeyOrient(bars, axisOrient, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight) {\r\n    if (axisOrient === 'top')\r\n        bars.attr('x', function (d) { return scaleKey(d[keyField]) + margin.left; })\r\n            .attr('y', function (d) { return margin.top; })\r\n            .attr('height', function (d) { return scaleValue(d[valueField]); })\r\n            .attr('width', function (d) { return scaleKey.bandwidth(); });\r\n    else if (axisOrient === 'bottom')\r\n        bars.attr('x', function (d) { return scaleKey(d[keyField]) + margin.left; })\r\n            .attr('y', function (d) { return scaleValue(d[valueField]) + margin.top; })\r\n            .attr('height', function (d) { return blockHeight - margin.top - margin.bottom - scaleValue(d[valueField]); })\r\n            .attr('width', function (d) { return scaleKey.bandwidth(); });\r\n    else if (axisOrient === 'left')\r\n        bars.attr('x', function (d) { return margin.left; })\r\n            .attr('y', function (d) { return scaleKey(d[keyField]) + margin.top; })\r\n            .attr('height', function (d) { return scaleKey.bandwidth(); })\r\n            .attr('width', function (d) { return scaleValue(d[valueField]); });\r\n    else if (axisOrient === 'right')\r\n        bars.attr('x', function (d) { return scaleValue(d[valueField]) + margin.left; })\r\n            .attr('y', function (d) { return scaleKey(d[keyField]) + margin.top; })\r\n            .attr('height', function (d) { return scaleKey.bandwidth(); })\r\n            .attr('width', function (d) { return blockWidth - margin.left - margin.right - scaleValue(d[valueField]); });\r\n}\r\nfunction renderBar(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient, blockWidth, blockHeight) {\r\n    var bars = d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .selectAll('rect.bar')\r\n        .data(data)\r\n        .enter()\r\n        .append('rect');\r\n    fillBarAttrsByKeyOrient(bars, keyAxisOrient, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight);\r\n    for (var key in barStyle) {\r\n        bars.style(key, barStyle[key]);\r\n    }\r\n}\r\nfunction getLine() {\r\n    return d3__WEBPACK_IMPORTED_MODULE_0__.line()\r\n        .x(function (d) { return d.x; })\r\n        .y(function (d) { return d.y; });\r\n}\r\nfunction getLineCoordinateByKeyOrient(axisOrient, data, scaleKey, scaleValue, margin, keyField, valueField) {\r\n    var lineCoordinate = [];\r\n    if (axisOrient === 'bottom' || axisOrient === 'top')\r\n        data.forEach(function (d) {\r\n            lineCoordinate.push({\r\n                x: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.left,\r\n                y: scaleValue(d[valueField]) + margin.top\r\n            });\r\n        });\r\n    else if (axisOrient === 'left' || axisOrient === 'right')\r\n        data.forEach(function (d) {\r\n            lineCoordinate.push({\r\n                x: scaleValue(d[valueField]) + margin.left,\r\n                y: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.top\r\n            });\r\n        });\r\n    return lineCoordinate;\r\n}\r\nfunction getArea(keyAxisOrient) {\r\n    if (keyAxisOrient === 'bottom' || keyAxisOrient === 'top')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.area()\r\n            .x(function (d) { return d.x0; })\r\n            .y0(function (d) { return d.y0; })\r\n            .y1(function (d) { return d.y1; });\r\n    if (keyAxisOrient === 'left' || keyAxisOrient === 'right')\r\n        return d3__WEBPACK_IMPORTED_MODULE_0__.area()\r\n            .x0(function (d) { return d.x0; })\r\n            .x1(function (d) { return d.x1; })\r\n            .y(function (d) { return d.y0; });\r\n}\r\nfunction getAreaCoordinateByKeyOrient(axisOrient, data, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight) {\r\n    var areaCoordinate = [];\r\n    if (axisOrient === 'bottom' || axisOrient === 'top') {\r\n        var y0_1 = margin.top;\r\n        if (axisOrient === 'bottom')\r\n            y0_1 = blockHeight - margin.bottom;\r\n        data.forEach(function (d) {\r\n            areaCoordinate.push({\r\n                x0: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.left,\r\n                x1: 0,\r\n                y0: y0_1,\r\n                y1: scaleValue(d[valueField]) + margin.top\r\n            });\r\n        });\r\n    }\r\n    else if (axisOrient === 'left' || axisOrient === 'right') {\r\n        var x0_1 = margin.left;\r\n        if (axisOrient === 'right')\r\n            x0_1 = blockWidth - margin.right;\r\n        data.forEach(function (d) {\r\n            areaCoordinate.push({\r\n                x0: x0_1,\r\n                x1: scaleValue(d[valueField]) + margin.left,\r\n                y0: scaleKey(d[keyField]) + scaleKey.bandwidth() / 2 + margin.top,\r\n                y1: 0\r\n            });\r\n        });\r\n    }\r\n    return areaCoordinate;\r\n}\r\nfunction renderLine(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient) {\r\n    var line = getLine();\r\n    var lineCoordinate = getLineCoordinateByKeyOrient(keyAxisOrient, data, scaleKey, scaleValue, margin, keyField, valueField);\r\n    var path = d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .append('path')\r\n        .attr('d', line(lineCoordinate));\r\n    for (var key in barStyle) {\r\n        path.style(key, barStyle[key]);\r\n    }\r\n}\r\nfunction renderArea(scaleKey, scaleValue, data, margin, keyField, valueField, barStyle, keyAxisOrient, blockWidth, blockHeight) {\r\n    var area = getArea(keyAxisOrient);\r\n    var areaCoordinate = getAreaCoordinateByKeyOrient(keyAxisOrient, data, scaleKey, scaleValue, margin, keyField, valueField, blockWidth, blockHeight);\r\n    var path = d3__WEBPACK_IMPORTED_MODULE_0__.select('svg')\r\n        .append('path')\r\n        .attr('d', area(areaCoordinate));\r\n    for (var key in barStyle) {\r\n        path.style(key, barStyle[key]);\r\n    }\r\n}\r\nfunction renderCharts(charts, scaleKey, scaleValue, data, margin, keyAxisOrient, blockWidth, blockHeight) {\r\n    charts.forEach(function (chart) {\r\n        if (chart.type === 'bar')\r\n            renderBar(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient, blockWidth, blockHeight);\r\n        else if (chart.type === 'line')\r\n            renderLine(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient);\r\n        else if (chart.type === 'area')\r\n            renderArea(scaleKey, scaleValue, data[chart.data.dataSource], margin, chart.data.keyField, chart.data.valueField, chart.style, keyAxisOrient, blockWidth, blockHeight);\r\n    });\r\n}\r\nvar scales = {\r\n    scaleKey: null,\r\n    scaleValue: null\r\n};\r\nscales.scaleKey = getScaleBand(model.scale.scaleKey.domain, model.scale.scaleKey.range.start, model.scale.scaleKey.range.end);\r\nscales.scaleValue = getScaleLinear(model.scale.scaleValue.domain, model.scale.scaleValue.range.start, model.scale.scaleValue.range.end);\r\nrenderSvgBlock(model.blockCanvas.class, model.blockCanvas.size.width, model.blockCanvas.size.height, model.blockCanvas.style);\r\nrenderAxis(scales.scaleKey, model.axis.keyAxis.orient, model.axis.keyAxis.translate.translateX, model.axis.keyAxis.translate.translateY);\r\nrenderAxis(scales.scaleValue, model.axis.valueAxis.orient, model.axis.valueAxis.translate.translateX, model.axis.valueAxis.translate.translateY);\r\nrenderCharts(model.charts, scales.scaleKey, scales.scaleValue, data, model.chartBlock.margin, model.axis.keyAxis.orient, model.blockCanvas.size.width, model.blockCanvas.size.height);\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({});\r\n\n\n//# sourceURL=webpack://packd3ts/./src/main.ts?");

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