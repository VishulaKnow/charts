import { Config } from './config';

const configCars: Config = {
    canvas: {
        class: 'outline',
        size: {
            width: 860,
            height: 510
        }
    },
    options: {
        type: '2d',
        title: 'График по 14 показателям в 4 разрезах, название длинное в одну строчку, если не влезает, то скрываем все в 3 точки',
        axis: {
            keyAxis: {
                position: 'start',
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
        orientation: 'horizontal',
        data: {
            dataSource: 'dataSet',
            keyField: {
                name: 'brand',
                format: 'string'
            }
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
                            title: 'Количество автомобилей'
                        },
                        {
                            name: 'count',
                            format: 'integer',
                            title: 'Some amount'
                        }
                    ]
                },
                tooltip: {
                    show: true
                },
                embeddedLabels: 'value',
                markers: {
                    show: true
                }
            }
        ]
    }
    // options: {
    //     type: 'polar',
    //     title: 'some title',
    //     legend: {
    //         show: true
    //     },
    //     data: {
    //         dataSource: 'dataSet',
    //         keyField: {
    //             name: 'brand',
    //             format: 'string'
    //         }
    //     },
    //     charts: [
    //         {
    //             type: 'donut',
    //             data: {
    //                 valueField: {
    //                     name: 'price',
    //                     format: 'money',
    //                     title: 'some title'
    //                 }
    //             },
    //             tooltip: {
    //                 show: true
    //             }
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
        title: 'asd',
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
                embeddedLabels: 'value',
                markers: {
                    show: true
                }
            },
            {
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
                embeddedLabels: 'value',
                markers: {
                    show: true
                }
            }
        ]
    }
}

export default configCars;