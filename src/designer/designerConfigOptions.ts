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
                groupDistance: 10,
                minBarWidth: 30,
                barDistance: 2
            }
        }
    },
    chart: {
        style: {
            palette: [color('#0A7CB8'),
                color('#1AB179'),
                color('#FF2D2D'),
                color('#065580'), 
                color('#138058'),
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
            'time': () => ''
        }
    }
}

export default designerConfig;