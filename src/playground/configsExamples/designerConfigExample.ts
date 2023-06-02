import { DesignerConfig } from '../../designer/designerConfig'

const designerConfig: DesignerConfig = {
    canvas: {
        axisLabel: {
            maxSize: {
                main: 80
            }
        },
        chartBlockMargin: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5
        },
        legendBlock: {
            maxWidth: 200
        },
        chartOptions: {
            bar: {
                minBarWidth: 3,
                maxBarWidth: 30,
                groupMinDistance: 6,
                barDistance: 2,
                groupMaxDistance: 35
            },
            donut: {
                padAngle: 0,
                thickness: {
                    min: "10%",
                    max: "30%",
                    value: "25%"
                },
                aggregatorPad: 10
            },
            line: {
                shape: {
                    curve: {
                        type: "monotone"
                    }
                }
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