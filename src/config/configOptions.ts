import { Config } from './config';

const configCars: Config = {
    canvas: {
        class: 'outline svg-chart',
        size: {
            width: 1200,
            height: 650
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
        charts: [
            {
                title: 'Рост стоимости и длинное название параметра',
                type: 'bar',
                legend: {
                    position: 'top'
                },
                data: {
                    dataSource: 'dataSet_segmented',
                    keyField:  {
                        name: 'brand',
                        format: 'string'
                    },
                    subKeyField: {
                        name: 'model',
                        format: 'string'
                    },
                    valueField: {
                        name: 'price',
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
                orientation: 'vertical'
            }
        ]
    }
    // options: {
    //     type: 'interval',
    //     additionalElements: {
    //         gridLine: {
    //             flag: {
    //                 value: true,
    //                 key: false
    //             }
    //         }
    //     },
    //     axis: {
    //         keyAxis: {
    //             position: 'start',
    //             ticks: {
    //                 flag: true
    //             }
    //         },
    //         valueAxis: {
    //             position: 'start',
    //             ticks: {
    //                 flag: false
    //             }
    //         }
    //     },
    //     charts: [
    //         {
    //             type: 'gantt',
    //             title: 'Car prices',
    //             legend: {
    //                 position: 'left'
    //             },
    //             data: {
    //                 dataSource: 'dataSet_gantt',
    //                 keyField:  {
    //                     name: 'task',
    //                     format: 'string'
    //                 },
    //                 valueField1: {
    //                     name: 'start',
    //                     format: 'date'
    //                 },
    //                 valueField2: {
    //                     name: 'end',
    //                     format: 'date'
    //                 }
    //             },
    //             tooltip: {
    //                 data: {
    //                     fields: [
    //                         {
    //                             format: 'date',
    //                             name: 'start'
    //                         },
    //                         {
    //                             format: 'date',
    //                             name: 'end'
    //                         }
    //                     ]
    //                 }
    //             },
    //             orientation: 'horizontal'
    //         }
    //     ]
    // }
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

export default configDemo;