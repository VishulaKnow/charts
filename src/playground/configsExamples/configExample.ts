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
        title: (params) => params.data.reduce((acc, row) => {
            return acc + row.count
        }, 0).toString(),
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
        charts: [
            {
                isSegmented: false,
                type: 'line',
                data: {
                    valueFields: [
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Стоимость за 2020 год'
                        },
                    ],
                    valueGroup: "secondary"
                },
                tooltip: {
                    show: true
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
            },
            {
                isSegmented: false,
                type: 'bar',
                data: {
                    valueFields: [
                        {
                            name: 'count',
                            format: 'money',
                            title: 'Стоимость за 2020 год'
                        },
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Стоимость за 2020 год'
                        }
                    ],
                    valueGroup: "main"
                },
                tooltip: {
                    show: true
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
        tooltip: {
            aggregator: {
                content: ({ row }) => {
                    return { type: "captionValue", caption: "Общая сумма", value: (row.price ?? 0) + (row.count ?? 0) };
                },
                position: 'underValues'
            }
        }
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

export default configCars;