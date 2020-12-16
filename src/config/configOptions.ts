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
    axis: {
        keyAxis: {
            domain: {
                start: -1,
                end: -1
            },
            position: 'start'
        },
        valueAxis: {
            domain: {
                start: 0,
                end: 150
            },
            position: 'end'
        }
    },
    charts: [
        {
            title: 'Car prices',
            legend: {
                position: 'off'
            },
            style: {
                'fill': 'steelblue'
            },
            type: 'bar',
            data: {
                dataSource: 'dataSet',
                keyField: 'brand',
                valueField: 'price'
            },
            orientation: 'horizontal'
        }
    ]
}

export default config;