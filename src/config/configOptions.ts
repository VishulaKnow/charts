import { Config } from './config';

const config: Config = {
    canvas: {
        class: 'chart-1 border',
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
                    start: 0,
                    end: 150
                },
                position: 'start'
            }
        },
        charts: [
            {
                title: 'Car prices',
                type: 'bar',
                legend: {
                    position: 'off'
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
                orientation: 'horizontal'
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
    //                 position: 'off'
    //             },
    //             data: {
    //                 dataSource: 'dataSet',
    //                 keyField: 'brand',
    //                 valueField: 'price'
    //             },
    //             tooltip: {
    //                 data: {
    //                     fields: ['count', 'price']
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