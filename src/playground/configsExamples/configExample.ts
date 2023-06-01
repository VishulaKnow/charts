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
        title: 'Заголовок графика',
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
                domain: {
                    start: -1,
                    end: -1
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
                        {
                            name: 'count',
                            format: 'money',
                            title: 'Стоимость за 2020 год'
                        },
                        // {
                        //     name: 'price2',
                        //     format: 'money',
                        //     title: 'Стоимость за 2020 год'
                        // }
                    ]
                },
                tooltip: {
                    show: true
                },
                embeddedLabels: 'none',
                markers: {
                    show: false
                },
                styles: {
                    dash: {
                        on: true,
                        dashSize: 20,
                        gapSize: 10
                    }
                }
            }
        ]
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
    //         maxRecordsAmount: 10
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
    // },
    // options: {
    //     type: "card",
    //     title: "Some long text",
    //     icon: () => createIcon("fa-info-circle"),
    //     data: {
    //         dataSource: "dataSet"
    //     },
    //     value: {
    //         field: "price",
    //         dataType: "money"
    //     },
    //     description: "Lorem ipsum dolor sit amet consectetur.",
    //     change: {
    //         value: {
    //             dataType: "number",
    //             field: "count"
    //         },
    //         color: [
    //             {
    //                 color: "red"
    //             },
    //             {
    //                 color: "blue",
    //                 value: 0
    //             },
    //             {
    //                 color: "green",
    //                 value: 0
    //             }
    //         ],
    //         icon: {
    //             aboveZero: () => createIcon("fa-arrow-up"),
    //             belowZero: () => createIcon("fa-arrow-down"),
    //             equalZero: () => createIcon("fa-arrows-h")
    //         },
    //         description: "Since last year"
    //     }
    // }
}

function createIcon(iconName: string) {
    const element = document.createElement("i");
    element.classList.add("fa", iconName);
    return element;
}

export default configCars;