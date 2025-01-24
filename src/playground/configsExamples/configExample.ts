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
                },
                line: {
                    visible: false
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
                line: {
                    visible: false
                }
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
            show: true,
            position: "bottom"
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
                    mode: "none"
                }
            },
            style: {
                cssClassName: "value-labels-style",
                fontSize: 12,
                color: "rgba(68, 68, 68, 1)"
            }
        },
        tooltip: {
            aggregator: {
                content: ({ row }) => {
                    return {
                        type: "captionValue",
                        caption: "Количество",
                        value: row.brand
                    }
                },
                position: "underValues"
            },
        },
        charts: [
            {
                isSegmented: true,
                type: 'bar',
                data: {
                    valueFields: [
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Количество'
                        },
                        {
                            name: 'count',
                            format: 'money',
                            title: 'Количество'
                        },
                    ],
                    valueGroup: "main"
                },
                embeddedLabels: 'none',
                markers: {
                    show: false
                },
                valueLabels: {
                    on: true,
                    position: {
                        mode: "center"
                    }
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
                    },
                    borderRadius: {
                        value: 0
                    }
                }
            },
            // {
            //     isSegmented: false,
            //     type: 'area',
            //     data: {
            //         valueFields: [
            //             {
            //                 name: 'price',
            //                 format: 'money',
            //                 title: 'Рубли',
            //                 color: "rgb(235, 80, 0)"
            //             },
            //         ],
            //         valueGroup: "main"
            //     },
            //     embeddedLabels: 'none',
            //     markers: {
            //         show: false
            //     },
            //     lineStyles: {
            //         dash: {
            //             on: true,
            //             dashSize: 3,
            //             gapSize: 3
            //         }
            //     },
            //     barStyles: {
            //         hatch: {
            //             on: false
            //         }
            //     },
            //     areaStyles: {
            //         borderLine: {
            //             on: true
            //         },
            //         gradient: {
            //             on: true
            //         }
            //     },
            //     valueLabels: {
            //         on: true,
            //         // format: (value) => nFormatter(value),
            //     }
            // },
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
    //         aggregator: {
    //             content: (model) => ({
    //                 title: "Big Text text word another one",
    //                 value: model.data.reduce((acc, row) => acc + row.price, 0)
    //             })
    //         }
    //     }
    // }
}

function nFormatter(num: number, digits: number = 1) {
    function toFixed(num: number, fixed: number) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }

    if (num !== 0 && num < 1) return num.toFixed(digits);

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
    const item = lookup.reverse().find(item => num < 0 ? (num <= -item.value) : (num >= item.value));
    const finalValue = item ? toFixed(num / item.value, digits).replace(regexp, "").concat(` ${item.symbol}`) : "0";

    return finalValue.replace(".", ",");
};

export default configCars;