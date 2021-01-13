import { color } from 'd3'
import { DesignerConfig, DataOptions } from './designerConfig'

const designerConfig: DesignerConfig = {
    canvas: {
        axisLabel: {
            maxSize: {
                orthogonal: 20,
                main: 50
            }
        },
        chartBlockMargin: {
            top: 20,
            bottom: 50,
            left: 20,
            right: 10
        },
        legendBlock: {
            maxWidth: 200
        },
        chartOptions: {
            bar: {
                groupDistance: 10,
                minBarWidth: 30,
                barDistance: 0
            },
            donut: {
                minPartSize: 50
            }
        }
    },
    chart: {
        style: {
            palette: [color('#008FFB'),
                color('#00E396'),
                color('#FEB019'),
                color('#FF4560'), 
                color('#775DD0'),
                color('#801717'), 
                color('#0DAAFF'), 
                color('#26FFB0'),
                color('#FF2E2E'), 
                color('#032B40'), 
                color('#0A402C'), 
                color('#0B99E6'),
                color('#E62929')]
        }
    },
    dataFormat: {
        formatters: {
            'integer': (options: DataOptions, value: any) => Intl.NumberFormat().format(value),
            'decimal': (options: DataOptions, value: any) => Intl.NumberFormat().format(value),
            'money': (options: DataOptions, value: any) => Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value),
            'date': (options: DataOptions, value: any) => value,
            'string': (options: DataOptions, value: any) => value
        }
    },
    additionalElements: {
        gridLine: {
            flag: {
                horizontal: true,
                vertical: true
            }
        }
    }
}

export default designerConfig;