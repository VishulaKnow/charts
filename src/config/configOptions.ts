import { Config } from './config';

const configCars: Config = {
    canvas: {
        class: 'outline svg-chart',
        size: {
            width: 390,
            height: 650
        }
    },
    // options: {
    //     type: '2d',
    //     isSegmented: false,
    //     axis: {
    //         keyAxis: {
    //             position: 'end',
    //             ticks: {
    //                 flag: false
    //             }
    //         },
    //         valueAxis: {
    //             domain: {
    //                 start: -1,
    //                 end: -1
    //             },
    //             position: 'start',
    //             ticks: {
    //                 flag: false
    //             }
    //         }
    //     },
    //     additionalElements: {
    //         gridLine: {
    //             flag: {
    //                 value: true,
    //                 key: true
    //             }
    //         }
    //     },
    //     legend: {
    //         position: 'top'
    //     },
    //     orientation: 'vertical',
    //     charts: [
    //         {
    //             title: 'Рост стоимости',
    //             type: 'line',
    //             data: {
    //                 dataSource: 'dataSet_large',
    //                 keyField:  {
    //                     name: 'brand',
    //                     format: 'string'
    //                 },
    //                 valueField: [
    //                     {
    //                         name: 'price',
    //                         format: 'money',
    //                         title: 'Цены на автомобили по рынку длинное'
    //                     },
    //                     {
    //                         name: 'count',
    //                         format: 'integer',
    //                         title: 'Количество автомобилей на душу населения'
    //                     }
    //                 ]
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
                    dataSource: 'dataSet_large',
                    keyField:  {
                        name: 'brand',
                        format: 'string'
                    },
                    valueField: {
                        name: 'price',
                        format: 'money'
                    },
                },
                appearanceOptions: {
                    innerRadius: 60,
                    padAngle: 0
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

const configDemo: Config = {
    canvas: {
        class: 'svg-chart outline',
        size: {
            width: 1200,
            height: 650
        }
    },
    options: {
        type: '2d',
        legend: {
            position: 'off'
        },
        isSegmented: false,
        orientation: 'vertical',
        axis: {
            keyAxis: {
                position: 'end',
                ticks: {
                    flag: true
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
                    key: false,
                    value: true
                }
            }
        },
        charts: [
            {
                title: 'Car prices',
                type: 'line',
                data: {
                    dataSource: 'dataSet_data',
                    keyField:  {
                        name: 'MonthYear',
                        format: 'string'
                    },
                    valueField: [
                        {
                            name: 'EventCost',
                            format: 'integer',
                            title: 'EventCost'
                        }
                    ]
                },
                tooltip: {
                    data: {
                        fields: [
                            {
                                name: 'MonthYear',
                                format: 'string'
                            },
                            {
                                name: 'EventCost',
                                format: 'money'
                            }
                        ]
                    }
                }
            },
            {
                title: 'Car prices',
                type: 'line',
                data: {
                    dataSource: 'dataSet_data2',
                    keyField:  {
                        name: 'MonthYear',
                        format: 'string'
                    },
                    valueField: [
                        {
                            name: 'EventCost',
                            format: 'integer',
                            title: 'EventCost'
                        }
                    ]
                },
                tooltip: {
                    data: {
                        fields: [
                            {
                                name: 'MonthYear',
                                format: 'string'
                            },
                            {
                                name: 'AlcoholCost',
                                format: 'money'
                            }
                        ]
                    }
                }
            }
        ]
    }
}

export default configCars;