// import { TwoDimensionalChart } from "../../config/config";
// import { DataSource } from "../../model/model";
// import { ScaleModel } from "../../model/scaleModel";

// describe('getScaleMaxValue test', () => {
//     let charts: TwoDimensionalChart[];
//     let data: DataSource;
//     let dataSource: string;

//     beforeEach(() => {
//         charts = [
//             {
//                 isSegmented: false,
//                 type: 'line',
//                 data: {
//                     valueFields: [
//                         {
//                             name: 'price',
//                             format: 'money',
//                             title: 'Количество автомобилей на душу населения'
//                         },
//                         {
//                             name: 'count',
//                             format: 'integer',
//                             title: 'Количество автомобилей на душу населения'
//                         }             
//                     ]
//                 },
//                 tooltip: {
//                     show: true
//                 },
//                 embeddedLabels: 'key'
//             }
//         ]
//         data = require('../../assets/dataSet.json');
//         dataSource = "dataSet";
//     });

//     describe('one chart', () => {
//         describe('non-segmnted', () => {
//             beforeEach(() => {
//                 charts[0].isSegmented = false;
//             });
    
//             test('should return 120 (max of all dataSet) for not-segmnted charts', () => {
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(120);
//             });
        
//             test('should return 20 (max of count) for not-segmnted charts', () => {
//                 charts[0].data.valueFields = charts[0].data.valueFields.slice(1, 2);
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(20);
//             });

//             test('should return 500', () => {
//                 dataSource = "dataSet_poor";
//                 charts[0].data.valueFields.push({
//                     format: 'integer',
//                     name: 'simple',
//                     title: ''
//                 });
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(500);
//             });
//         });
        
//         describe('segmnted', () => {
//             beforeEach(() => {
//                 charts[0].isSegmented = true;
//             });
    
//             test('should return 140 (max of all sums) for segmented chart', () => {
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(140);
//             });
        
//             test('should return 527', () => {
//                 dataSource = "dataSet_poor";
//                 charts[0].data.valueFields.push({
//                     format: 'integer',
//                     name: 'simple',
//                     title: ''
//                 });
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(527);
//             });
//         });
//     });

//     describe('two charts', () => {

//         describe('segmented/non-segmented', () => {
//             test('should return 500', () => {
//                 charts = [
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     name: 'price',
//                                     format: 'money',
//                                     title: 'Количество автомобилей на душу населения'
//                                 },
//                                 {
//                                     name: 'count',
//                                     format: 'integer',
//                                     title: 'Количество автомобилей на душу населения'
//                                 }             
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     },
//                     {
//                         isSegmented: false,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     format: 'integer',
//                                     name: 'simple',
//                                     title: ''
//                                 }            
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     }
//                 ]
//                 dataSource = "dataSet_poor";
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(500);
//             });

//             test('should return 500', () => {
//                 charts = [
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     name: 'price',
//                                     format: 'money',
//                                     title: 'Количество автомобилей на душу населения'
//                                 },
//                                 {
//                                     name: 'count',
//                                     format: 'integer',
//                                     title: 'Количество автомобилей на душу населения'
//                                 }             
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     },
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     format: 'integer',
//                                     name: 'simple',
//                                     title: ''
//                                 }            
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     }
//                 ]
//                 dataSource = "dataSet_poor";
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(500);
//             });
//         });

//         describe('segmented/segmented', () => {
//             test('should return 500', () => {
//                 charts = [
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     name: 'price',
//                                     format: 'money',
//                                     title: 'Количество автомобилей на душу населения'
//                                 },
//                                 {
//                                     name: 'count',
//                                     format: 'integer',
//                                     title: 'Количество автомобилей на душу населения'
//                                 }             
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     },
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     format: 'integer',
//                                     name: 'simple',
//                                     title: ''
//                                 }            
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     }
//                 ]
//                 dataSource = "dataSet_poor";
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(500);
//             });

//             test('should return 512', () => {
//                 charts = [
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     name: 'price',
//                                     format: 'money',
//                                     title: 'Количество автомобилей на душу населения'
//                                 },
//                                 {
//                                     name: 'count',
//                                     format: 'integer',
//                                     title: 'Количество автомобилей на душу населения'
//                                 }             
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     },
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     format: 'integer',
//                                     name: 'simple',
//                                     title: ''
//                                 },
//                                 {
//                                     name: 'count',
//                                     format: 'integer',
//                                     title: 'Количество автомобилей на душу населения'
//                                 }         
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     }
//                 ]
//                 dataSource = "dataSet_poor";
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(512);
//             });

//             test('should return 512', () => {
//                 charts = [
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     name: 'price',
//                                     format: 'money',
//                                     title: 'Количество автомобилей на душу населения'
//                                 },
//                                 {
//                                     name: 'count',
//                                     format: 'integer',
//                                     title: 'Количество автомобилей на душу населения'
//                                 }             
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     },
//                     {
//                         isSegmented: true,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     name: 'count',
//                                     format: 'integer',
//                                     title: 'Количество автомобилей на душу населения'
//                                 }         
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     },
//                     {
//                         isSegmented: false,
//                         type: 'line',
//                         data: {
//                             valueFields: [
//                                 {
//                                     format: 'integer',
//                                     name: 'simple',
//                                     title: ''
//                                 },
//                                 {
//                                     name: 'count',
//                                     format: 'integer',
//                                     title: 'Количество автомобилей на душу населения'
//                                 },
//                                 {
//                                     name: 'price',
//                                     format: 'money',
//                                     title: 'Количество автомобилей на душу населения'
//                                 }      
//                             ]
//                         },
//                         tooltip: {
//                             show: true
//                         },
//                         embeddedLabels: 'key'
//                     }
//                 ]
//                 dataSource = "dataSet_poor";
//                 const result = ScaleModel.getScaleMaxValue(charts, dataSource, data);
//                 expect(result).toBe(500);
//             });
//         });
//     })
// });