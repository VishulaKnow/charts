import { MdtChartsConfig } from '../../config/config';

const configCars: MdtChartsConfig = {
    canvas: {
        class: 'outline',
        size: {
            width: 400,
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
                }
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
                    key: true
                }
            }
        },
        legend: {
            show: true
        },
        orientation: 'vertical',
        data: {
            dataSource: 'dataSet_72',
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
                            title: 'Стоимость за 2020 год',
                            color: "red"
                        },
                        {
                            name: 'count',
                            format: 'money',
                            title: 'Стоимость за 2020 год'
                        }
                    ]
                },
                tooltip: {
                    show: true
                },
                embeddedLabels: 'value',
                markers: {
                    show: false
                }
            }
        ]
    }
    // options: {
    //     type: 'polar',
    //     selectable: true,
    //     legend: {
    //         show: true
    //     },
    //     data: {
    //         dataSource: 'dataSet_72',
    //         keyField: {
    //             name: 'brand',
    //             format: 'string'
    //         }
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
    //             text: 'Сумма очень большая прям очент'
    //         }
    //     }
    // }
}

export default configCars;