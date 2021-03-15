import { DesignerConfig } from './designerConfig'

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
    chartStyle: {
        baseColor: 'red',
        step: 3
    },
    additionalElements: {
        gridLine: {
            flag: {
                value: true,
                key: true
            }
        }
    },
    dataFormat: {
        formatters: (value: any, options: { type?: string; title?: string; empty?: string; } = {}) => {
            var type = typeof value;
            if ((value === undefined || value === null || value === "") && type != "boolean" && options.type != "boolean")
                return value;
            if (type == "boolean" || options.type == "boolean") {
                return value.toString();
            }
            if (value instanceof Date) {
                return value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + value.getDate() + ' ' + value.getHours() + ':' + value.getMinutes()
            }
            if (options.type === "markdown") {
                return value.toString();
            }
            if ((options.type === "money" || options.type === "number")) {
                return Intl.NumberFormat('ru-Ru', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
            }
            return value;
        }
    }
}

export default designerConfig;