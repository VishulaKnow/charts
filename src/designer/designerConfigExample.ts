import { DesignerConfig, DataTypeOptions } from './designerConfig'

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
                groupMinDistance: 10,
                minBarWidth: 3,
                maxBarWidth: 30,
                barDistance: 5,
                groupMaxDistance: 35
            },
            donut: {
                minPartSize: 10,
                padAngle: 0,
                minThickness: 40,
                maxThickness: 60
            }
        }
    },
    dataFormat: {
        formatters: {
            'integer': (value: any, options?: DataTypeOptions) => Intl.NumberFormat().format(value),
            'decimal': (value: any, options?: DataTypeOptions) => Intl.NumberFormat().format(value),
            'money': (value: any, options?: DataTypeOptions) => Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value),
            'date': (value: any, options?: DataTypeOptions) => value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + value.getDate() + ' ' + value.getHours() + ':' + value.getMinutes(),
            'string': (value: any, options?: DataTypeOptions) => value
        }
    },
    chartStyle: {
        baseColor: 'pink',
        step: 2
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