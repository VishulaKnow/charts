import { color } from 'd3'
import { DesignerConfig, DataOptions } from './designerConfig'

const designerConfig: DesignerConfig = {
    canvas: {
        axisLabel: {
            maxSize: {
                orthogonal: 20,
                main: 60
            }
        },
        chartBlockMargin: {
            top: 30,
            bottom: 20,
            left: 20,
            right: 20
        },
        legendBlock: {
            maxWidth: 200
        },
        chartOptions: {
            bar: {
                groupDistance: 10,
                minBarWidth: 3,
                maxBarWidth: 20,
                barDistance: 5
            },
            donut: {
                minPartSize: 10
            }
        }
    },
    chart: {
        style: {
            palette: [color('#00BC8B'),
                color('#3E66F3'),
                color('#FF7800'),
                color('#EF3737'),
                color('#01CC97'),
                color('#B3EBDD'),
                color('#5C80FF'),
                color('#89A3FF'),
                color('#ADBFFF')
            ]
        }
    },
    dataFormat: {
        formatters: {
            'integer': (options: DataOptions, value: any) => Intl.NumberFormat().format(value),
            'decimal': (options: DataOptions, value: any) => Intl.NumberFormat().format(value),
            'money': (options: DataOptions, value: any) => Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value),
            'date': (options: DataOptions, value: Date) => value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + value.getDate() + ' ' + value.getHours() + ':' + value.getMinutes(),
            'string': (options: DataOptions, value: any) => value
        }
    },
    additionalElements: {
        gridLine: {
            flag: {
                value: true,
                key: true
            }
        }
    }
}

export default designerConfig;