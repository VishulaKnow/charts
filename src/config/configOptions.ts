import { Config } from './config';

const config: Config = {
    canvas: {
        class: 'chart-1',
        size: {
            width: 1000,
            height: 500
        },
        style: {
            'border': '1px solid black'
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
                type: 'area',
                legend: {
                    position: 'off'
                },
                style: {
                    'fill': 'steelblue',
                    'stroke': 'none'
                },
                data: {
                    dataSource: 'dataSet',
                    keyField: 'brand',
                    valueField: 'price'
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
    //                 position: 'off'
    //             },
    //             style: {
    //                 'fill': 'steelblue',
    //                 'stroke': 'none'
    //             },
    //             data: {
    //                 dataSource: 'dataSet',
    //                 keyField: 'brand',
    //                 valueField: 'price'
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