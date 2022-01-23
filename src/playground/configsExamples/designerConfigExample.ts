import { DesignerConfig } from '../../designer/designerConfig'

const designerConfig: DesignerConfig = {
    canvas: {
        axisLabel: {
            maxSize: {
                main: 60
            }
        },
        chartBlockMargin: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        legendBlock: {
            maxWidth: 200
        },
        chartOptions: {
            bar: {
                minBarWidth: 3,
                maxBarWidth: 30,
                groupMinDistance: 16,
                barDistance: 8,
                groupMaxDistance: 35
            },
            donut: {
                padAngle: 0,
                thickness: {
                    min: 40,
                    max: 60,
                    unit: "%",
                    value: 25
                },
                aggregatorPad: 30
            }
        }
    },
    chartStyle: {
        baseColors: ['#209de3', '#ff3131', '#ffba00', '#20b078']
    },
    elementsOptions: {
        tooltip: {
            position: 'followCursor'
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