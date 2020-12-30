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
            bottom: 20,
            left: 50,
            right: 50
        },
        legendBlock: {
            maxWidth: 200
        },
        chartOptions: {
            bar: {
                barDistance: 10,
                minBarWidth: 10
            }
        }
    },
    chart: {
        style: {
            palette: [color('steelblue'), color('green'), color('blue'), color('yellow')]
        }
    },
    dataFormat: {
        formatters: {
            'time': () => ''
        }
    }
}

export default designerConfig;