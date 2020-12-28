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
            top: 50,
            bottom: 50,
            left: 50,
            right: 190
        },
        legendBlock: {
            maxWidth: 200
        }
    },
    chart: {
        style: {
            palette: [color('red'), color('green'), color('blue')]
        }
    },
    dataFormat: {
        formatters: {
            'time': () => ''
        }
    }
}

export default designerConfig;