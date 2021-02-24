import { Config } from './config';

const configCars: Config = {
    canvas: {
        class: 'outline svg-chart',
        size: {
            width: 960,
            height: 510
        }
    },
    options: {
        type: '2d',
        axis: {
            keyAxis: {
                position: 'end',
                ticks: {
                    flag: false
                }
            },
            valueAxis: {
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
            dataSource: 'dataSet',
            keyField: {
                name: 'brand',
                format: 'string'
            }
        },
        charts: [
            {
                title: 'Рост стоимости',
                isSegmented: false,
                type: 'bar',
                data: {
                    valueFields: [
                        {
                            name: 'price',
                            format: 'integer',
                            title: 'Количество автомобилей на душу населения'
                        },
                        {
                            name: 'count',
                            format: 'integer',
                            title: 'Количество автомобилей на душу населения'
                        }
                    ]
                },
                tooltip: {
                    show: true
                },
                embeddedLabels: 'value'
            }
        ]
    }
    // options: {
    //     type: 'polar',
    //     legend: {
    //         show: true
    //     },
    //     data: {
    //         dataSource: 'dataSet',
    //         keyField:  {
    //             name: 'brand',
    //             format: 'string'
    //         }
    //     },
    //     charts: [
    //         {
    //             title: 'Рост стоимости',
    //             type: 'donut',
    //             data: {
    //                 valueField: {
    //                     name: 'price',
    //                     format: 'money'
    //                 }
    //             },
    //             tooltip: {
    //                 show: true
    //             },
    //         }
    //     ]
    // }
}

const configDemo: Config = {
    canvas: {
        class: 'outline svg-chart',
        size: {
            width: 960,
            height: 510
        }
    },
    options: {
        type: '2d',
        axis: {
            keyAxis: {
                position: 'end',
                ticks: {
                    flag: false
                }
            },
            valueAxis: {
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
            dataSource: 'dataSet_data',
            keyField: {
                name: 'MonthYear',
                format: 'string'
            }
        },
        charts: [
            {
                title: 'Рост стоимости',
                isSegmented: false,
                type: 'bar',
                data: {
                    valueFields: [
                        {
                            name: 'EventCost',
                            format: 'integer',
                            title: 'Количество автомобилей на душу населения'
                        },
                        {
                            name: 'AlcoholCost',
                            format: 'money',
                            title: 'Количество автомобилей на душу населения'
                        }
                    ]
                },
                tooltip: {
                    show: true
                },
                embeddedLabels: 'value'
            },
            {
                title: 'Рост стоимости',
                isSegmented: false,
                type: 'line',
                data: {
                    valueFields: [
                        {
                            name: 'EventCost',
                            format: 'integer',
                            title: 'Количество автомобилей на душу населения'
                        }
                    ]
                },
                tooltip: {
                    show: true
                },
                embeddedLabels: 'value'
            }
        ]
    }
}

export default configCars;