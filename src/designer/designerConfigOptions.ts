import { color } from 'd3'
import { DesignerConfig } from './designerConfig'

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
                barDistance: 10,
                minBarWidth: 50
            }
        }
    },
    chart: {
        style: {
            palette: [color('steelblue'), color('lightgreen'), color('#92a8d1'), color('#034f84'), color('#deeaee'), color('#b1cbbb'), color('#d5f4e6'), color('#80ced6'), color('#9fa9a3')]
        }
    },
    dataFormat: {
        formatters: {
            'time': () => ''
        }
    }
}

export default designerConfig;