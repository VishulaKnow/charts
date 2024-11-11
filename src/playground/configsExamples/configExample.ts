import { MdtChartsConfig } from '../../config/config';

const configCars: MdtChartsConfig = {
    canvas: {
        class: 'outline',
        size: {
            width: 800,
            height: 400
        }
    },
    options: {
        type: '2d',
        title: "Объем товародвижения по брендам",
        selectable: true,
        axis: {
            key: {
                visibility: true,
                position: 'end',
                ticks: {
                    flag: false
                },
                // labels: {
                //     position: "straight"
                // }
            },
            value: {
                visibility: true,
                domain: params => {
                    let maxNumber = 0;
                    maxNumber = params.data.reduce((max, row) => row.price > max ? row.price : max, params.data[0].price)

                    return { start: -1, end: -1 }
                },
                position: 'start',
                ticks: {
                    flag: false
                },
                labels: {
                    format: (value) => nFormatter(value),
                }
            },
            valueSecondary: {
                domain: {
                    end: -1,
                    start: -1
                },
                ticks: {
                    flag: false
                },
                visibility: true,

            }
        },
        additionalElements: {
            gridLine: {
                flag: {
                    value: true,
                    key: false
                }
            }
        },
        legend: {
            show: true
        },
        orientation: 'vertical',
        data: {
            dataSource: 'dataSet',
            keyField: {
                name: 'brand',
                format: 'string'
            }
        },
        valueLabels: {
            collision: {
                otherValueLabels: {
                    mode: "hide"
                }
            }
        },
        charts: [
            {
                isSegmented: false,
                type: 'line',
                data: {
                    valueFields: [
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Рубли'
                        },
                    ],
                    valueGroup: "main"
                },
                embeddedLabels: 'none',
                markers: {
                    show: false
                },
                lineStyles: {
                    dash: {
                        on: true,
                        dashSize: 3,
                        gapSize: 3
                    }
                },
                barStyles: {
                    hatch: {
                        on: false
                    }
                },
                valueLabels: {
                    on: true,
                    // format: (value) => nFormatter(value),
                }
            },
            {
                isSegmented: false,
                type: 'bar',
                data: {
                    valueFields: [
                        {
                            name: 'count',
                            format: 'money',
                            title: 'Количество'
                        }
                    ],
                    valueGroup: "main"
                },
                embeddedLabels: 'none',
                markers: {
                    show: false
                },
                lineStyles: {
                    dash: {
                        on: true,
                        dashSize: 3,
                        gapSize: 3
                    }
                },
                barStyles: {
                    hatch: {
                        on: false
                    }
                }
            }
        ],
    }
    // options: {
    //     type: 'polar',
    //     selectable: true,
    //     title: "Chart header",
    //     legend: {
    //         show: true
    //     },
    //     data: {
    //         dataSource: 'dataSet-72',
    //         keyField: {
    //             name: 'brand',
    //             format: 'string'
    //         },
    //         // maxRecordsAmount: 10
    //     },
    //     chart: {
    //         type: 'donut',
    //         data: {
    //             valueField: {
    //                 name: 'price',
    //                 format: 'money',
    //                 title: 'Стоимость очень большой текст'
    //             }
    //         },
    //         tooltip: {
    //             show: true
    //         },
    //         aggregator: {
    //             content: (model) => ({
    //                 title: "Big Text text word another one",
    //                 value: model.data.reduce((acc, row) => acc + row.price, 0)
    //             })
    //         }
    //     }
    // }
}

function createIcon(iconName: string) {
    const element = document.createElement("i");
    element.classList.add("fa", iconName);
    return element;
}

function nFormatter(num: number, digits: number = 1) {
    function toFixed(num: number, fixed: number) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }

    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "тыс" },
        { value: 1e6, symbol: "млн" },
        { value: 1e9, symbol: "млрд" },
        { value: 1e12, symbol: "трлн" },
        { value: 1e15, symbol: "квдр" },
        { value: 1e18, symbol: "E" }
    ];

    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
    const item = lookup.reverse().find(item => num >= item.value);
    const finalValue = item ? toFixed(num / item.value, digits).replace(regexp, "").concat(` ${item.symbol}`) : "0";

    return finalValue.replace(".", ",");
};

export default configCars;