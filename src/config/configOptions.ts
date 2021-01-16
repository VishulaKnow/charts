import { Config } from './config';

const configCars: Config = {
    canvas: {
        class: 'svg-chart outline',
        size: {
            width: 1200,
            height: 650
        }
    },
    // options: {
    //     type: '2d',
    //     axis: {
    //         keyAxis: {
    //             position: 'end'
    //         },
    //         valueAxis: {
    //             domain: {
    //                 start: -1,
    //                 end: -1
    //             },
    //             position: 'start'
    //         }
    //     },
    //     additionalElements: {
    //         gridLine: {
    //             flag: {
    //                 value: true,
    //                 key: false
    //             }
    //         }
    //     },
    //     charts: [
    //         {
    //             title: 'Car prices',
    //             type: 'line',
    //             legend: {
    //                 position: 'off'
    //             },
    //             data: {
    //                 dataSource: 'dataSet_large',
    //                 keyField:  {
    //                     name: 'brand',
    //                     format: 'string'
    //                 },
    //                 valueField: {
    //                     name: 'price',
    //                     format: 'integer'
    //                 }
    //             },
    //             tooltip: {
    //                 data: {
    //                     fields: [
    //                         {
    //                             name: 'brand',
    //                             format: 'string'
    //                         },
    //                         {
    //                             name: 'price',
    //                             format: 'money'
    //                         }
    //                     ]
    //                 }
    //             },
    //             orientation: 'vertical'
    //         },
    //         {
    //             title: 'Car prices',
    //             type: 'line',
    //             legend: {
    //                 position: 'off'
    //             },
    //             data: {
    //                 dataSource: 'dataSet_large2',
    //                 keyField:  {
    //                     name: 'brand',
    //                     format: 'string'
    //                 },
    //                 valueField: {
    //                     name: 'price',
    //                     format: 'integer'
    //                 }
    //             },
    //             tooltip: {
    //                 data: {
    //                     fields: [
    //                         {
    //                             name: 'brand',
    //                             format: 'string'
    //                         },
    //                         {
    //                             name: 'price',
    //                             format: 'money'
    //                         }
    //                     ]
    //                 }
    //             },
    //             orientation: 'vertical'
    //         }
    //     ]
    // }
    options: {
        type: 'interval',
        additionalElements: {
            gridLine: {
                flag: {
                    value: true,
                    key: false
                }
            }
        },
        axis: {
            keyAxis: {
                position: 'start'
            },
            valueAxis: {
                position: 'end'
            }
        },
        charts: [
            {
                type: 'gantt',
                title: 'Car prices',
                legend: {
                    position: 'off'
                },
                data: {
                    dataSource: 'dataSet_gantt',
                    keyField:  {
                        name: 'task',
                        format: 'string'
                    },
                    valueField1: {
                        name: 'start',
                        format: 'date'
                    },
                    valueField2: {
                        name: 'end',
                        format: 'date'
                    }
                },
                tooltip: {
                    data: {
                        fields: []
                    }
                },
                orientation: 'horizontal'
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
        axis: {
            keyAxis: {
                position: 'end'
            },
            valueAxis: {
                domain: {
                    start: -1,
                    end: -1
                },
                position: 'start'
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
                legend: {
                    position: 'off'
                },
                data: {
                    dataSource: 'dataSet_data',
                    keyField:  {
                        name: 'MonthYear',
                        format: 'string'
                    },
                    valueField: {
                        name: 'EventCost',
                        format: 'integer'
                    }
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
                },
                orientation: 'vertical'
            },
            {
                title: 'Car prices',
                type: 'line',
                legend: {
                    position: 'off'
                },
                data: {
                    dataSource: 'dataSet_data2',
                    keyField:  {
                        name: 'MonthYear',
                        format: 'string'
                    },
                    valueField: {
                        name: 'AlcoholCost',
                        format: 'integer'
                    }
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
                },
                orientation: 'vertical'
            }
        ]
    }
}

export default configCars;