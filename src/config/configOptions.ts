import { Config } from './config';

const config: Config = {
    canvas: {
        class: 'svg-chart border',
        size: {
            width: 1000,
            height: 500
        }
    },
    options: {
        type: '2d',
        axis: {
            keyAxis: {
                domain: {
                    start: -1,
                    end: -1
                },
                position: 'end'
            },
            valueAxis: {
                domain: {
                    start: -1,
                    end: -1
                },
                position: 'start'
            }
        },
        charts: [
            {
                title: 'Car prices',
                type: 'line',
                legend: {
                    position: 'off'
                },
                data: {
                    dataSource: 'dataSet_large',
                    keyField: 'brand',
                    valueField: 'price'
                },
                tooltip: {
                    data: {
                        fields: ['count']
                    }
                },
                orientation: 'vertical'
            },
            {
                title: 'Car prices',
                type: 'line',
                legend: {
                    position: 'off'
                },
                data: {
                    dataSource: 'dataSet_large2',
                    keyField: 'brand',
                    valueField: 'price'
                },
                tooltip: {
                    data: {
                        fields: ['brand', 'count']
                    }
                },
                orientation: 'vertical'
            }
        ]
    }
    // options: {
    //     type: 'polar',
    //     charts: [
    //         {
    //             type: 'donut',
    //             title: 'Car prices',
    //             legend: {
    //                 position: 'bottom'
    //             },
    //             data: {
    //                 dataSource: 'dataSet_large',
    //                 keyField: 'brand',
    //                 valueField: 'price'
    //             },
    //             tooltip: {
    //                 data: {
    //                     fields: []
    //                 }
    //             },
    //             appearanceOptions: {
    //                 innerRadius: 10,
    //                 padAngle: 0.005
    //             }
    //         }
    //     ]
    // }
}

export default config;