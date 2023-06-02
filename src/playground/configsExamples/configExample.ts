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
                },
                labels: {
                    format: v => Math.floor(v / 1_000_000_000) + " млрд"
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
                type: 'bar',
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
                lineStyles: {
                    dash: {
                        on: true,
                        dashSize: 20,
                        gapSize: 10
                    }
                },
                barStyles: {
                    hatch: {
                        on: true
                    }
                }
            },
            {
                isSegmented: false,
                type: 'line',
                data: {
                    valueFields: [
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Стоимость за 2020 год'
                        }
                    ]
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
                        dashSize: 20,
                        gapSize: 10
                    }
                },
                barStyles: {
                    hatch: {
                        on: false
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
    // }
}

function createIcon(iconName: string) {
    const element = document.createElement("i");
    element.classList.add("fa", iconName);
    return element;
}

export default configCars;