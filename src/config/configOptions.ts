import { Config } from './config';

const config: Config = {
    canvas: {
        class: 'chart-1 border',
        size: {
            width: 1000,
            height: 500
        }
    },
    // options: {
    //     type: '2d',
    //     axis: {
    //         keyAxis: {
    //             domain: {
    //                 start: -1,
    //                 end: -1
    //             },
    //             position: 'end'
    //         },
    //         valueAxis: {
    //             domain: {
    //                 start: -1,
    //                 end: -1
    //             },
    //             position: 'start'
    //         }
    //     },
    //     charts: [
    //         {
    //             title: 'Car prices',
    //             type: 'line',
    //             legend: {
    //                 position: 'bottom'
    //             },
    //             data: {
    //                 dataSource: 'dataSet',
    //                 keyField: 'brand',
    //                 valueField: 'price'
    //             },
    //             tooltip: {
    //                 data: {
    //                     fields: ['count', 'price', 'brand']
    //                 }
    //             },
    //             orientation: 'vertical'
    //         },
    //         {
    //             title: 'Car prices',
    //             type: 'line',
    //             legend: {
    //                 position: 'bottom'
    //             },
    //             data: {
    //                 dataSource: 'dataSet2',
    //                 keyField: 'brand',
    //                 valueField: 'price'
    //             },
    //             tooltip: {
    //                 data: {
    //                     fields: ['count', 'price', 'brand']
    //                 }
    //             },
    //             orientation: 'vertical'
    //         }
    //         // {
    //         //     title: 'Car prices',
    //         //     type: 'line',
    //         //     legend: {
    //         //         position: 'bottom'
    //         //     },
    //         //     data: {
    //         //         dataSource: 'dataSet2',
    //         //         keyField: 'brand',
    //         //         valueField: 'price'
    //         //     },
    //         //     tooltip: {
    //         //         data: {
    //         //             fields: ['count', 'price', 'brand']
    //         //         }
    //         //     },
    //         //     orientation: 'vertical'
    //         // }
    //     ]
    // }
    options: {
        type: 'polar',
        charts: [
            {
                type: 'donut',
                title: 'Car prices',
                legend: {
                    position: 'right'
                },
                data: {
                    dataSource: 'dataSet',
                    keyField: 'brand',
                    valueField: 'price'
                },
                tooltip: {
                    data: {
                        fields: ['count', 'price']
                    }
                },
                appearanceOptions: {
                    innerRadius: 10,
                    padAngle: 0.005
                }
            }
        ]
    }
}

export default config;