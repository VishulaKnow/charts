// import { color } from "d3-color";
// import { TwoDimensionalChartModel } from "../../model/model";
// import { TwoDimensionalModel } from "../../model/twoDimensionalModel";

// describe('check chart sorting in order: [area, bar, line]', () => {
//     test('charts must be sorted', () => {
//         const charts: TwoDimensionalChartModel[] = [
//             {
//                 type: 'line',
//                 isSegmented: true,
//                 data: {
//                     valueFields: [
//                         {
//                             name: 'count',
//                             format: 'integer',
//                             title: 'Количество автомобилей на душу населения'
//                         },
//                         {
//                             name: 'price',
//                             format: 'money',
//                             title: 'Количество автомобилей на душу населения'
//                         }
//                     ]
//                 },
//                 tooltip: {
//                     show: true
//                 },
//                 cssClasses: [
//                     'chart-0'
//                 ],
//                 style: {
//                     elementColors: [
//                         color('red'),
//                         color('blue')
//                     ],
//                     opacity: 1
//                 },
//                 embeddedLabels: 'none',
//                 index: 0
//             },
//             {
//                 type: 'bar',
//                 isSegmented: true,
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
//                 cssClasses: [
//                     'chart-1'
//                 ],
//                 style: {
//                     elementColors: [
//                         color('red'),
//                         color('blue')
//                     ],
//                     opacity: 1
//                 },
//                 embeddedLabels: 'none',
//                 index: 1
//             }
//         ];
//         TwoDimensionalModel.sortCharts(charts);
//         expect(charts.map(ch => ch.type)).toEqual(['bar', 'line']);
//     });

//     test('charts must be sorted', () => {
//         const charts: TwoDimensionalChartModel[] = [
//             {
//                 type: 'area',
//                 isSegmented: true,
//                 data: {
//                     valueFields: [
//                         {
//                             name: 'count',
//                             format: 'integer',
//                             title: 'Количество автомобилей на душу населения'
//                         },
//                         {
//                             name: 'price',
//                             format: 'money',
//                             title: 'Количество автомобилей на душу населения'
//                         }
//                     ]
//                 },
//                 tooltip: {
//                     show: true
//                 },
//                 cssClasses: [
//                     'chart-0'
//                 ],
//                 style: {
//                     elementColors: [
//                         color('red'),
//                         color('blue')
//                     ],
//                     opacity: 1
//                 },
//                 embeddedLabels: 'none',
//                 index: 0
//             },
//             {
//                 type: 'line',
//                 isSegmented: true,
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
//                 cssClasses: [
//                     'chart-1'
//                 ],
//                 style: {
//                     elementColors: [
//                         color('red'),
//                         color('blue')
//                     ],
//                     opacity: 1
//                 },
//                 embeddedLabels: 'none',
//                 index: 1
//             },
//             {
//                 type: 'bar',
//                 isSegmented: true,
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
//                 cssClasses: [
//                     'chart-1'
//                 ],
//                 style: {
//                     elementColors: [
//                         color('red'),
//                         color('blue')
//                     ],
//                     opacity: 1
//                 },
//                 embeddedLabels: 'none',
//                 index: 1
//             },
//             {
//                 type: 'area',
//                 isSegmented: true,
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
//                 cssClasses: [
//                     'chart-1'
//                 ],
//                 style: {
//                     elementColors: [
//                         color('red'),
//                         color('blue')
//                     ],
//                     opacity: 1
//                 },
//                 embeddedLabels: 'none',
//                 index: 1
//             }
//         ];
//         TwoDimensionalModel.sortCharts(charts);
//         expect(charts.map(ch => ch.type)).toEqual(['area', 'area', 'bar', 'line']);
//     });
// });