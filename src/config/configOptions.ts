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
        isSegmented: false,
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
            position: 'top'
        },
        orientation: 'vertical',
        charts: [
            {
                title: 'Рост стоимости',
                type: 'area',
                data: {
                    dataSource: 'dataSet_large',
                    keyField:  {
                        name: 'brand',
                        format: 'string'
                    },
                    valueFields: [
                        {
                            name: 'price',
                            format: 'money',
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
                    data: {
                        fields: [
                            {
                                name: 'price',
                                format: 'money'
                            },
                            {
                                name: 'count',
                                format: 'integer'
                            }
                        ]
                    }
                },
                embeddedLabels: 'key'
            }
        ]
    }
    // options: {
    //     type: 'polar',
    //     legend: {
    //         position: 'top'
    //     },
    //     charts: [
    //         {
    //             title: 'Рост стоимости',
    //             type: 'donut',
    //             data: {
    //                 dataSource: 'dataSet_large',
    //                 keyField:  {
    //                     name: 'brand',
    //                     format: 'string'
    //                 },
    //                 valueField: {
    //                     name: 'price',
    //                     format: 'money'
    //                 }
    //             },
    //             tooltip: {
    //                 data: {
    //                     fields: [
    //                         {
    //                             name: 'price',
    //                             format: 'money'
    //                         },
    //                         {
    //                             name: 'count',
    //                             format: 'integer'
    //                         }
    //                     ]
    //                 }
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
        type: 'polar',
        legend: {
            position: 'top'
        },
        charts: [
            {
                title: 'Рост стоимости',
                type: 'donut',
                data: {
                    dataSource: 'dataSet_data',
                    keyField:  {
                        name: 'MonthYear',
                        format: 'string'
                    },
                    valueField: {
                        name: 'EventCost',
                        format: 'money'
                    }
                },
                tooltip: {
                    data: {
                        fields: [
                            {
                                name: 'price',
                                format: 'money'
                            },
                            {
                                name: 'count',
                                format: 'integer'
                            }
                        ]
                    }
                },
            }
        ]
    }
}

export default configCars;