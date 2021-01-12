import { Config } from './config';

const config: Config = {
    canvas: {
        class: 'svg-chart border',
        size: {
            width: 1200,
            height: 650
        }
    },
    options: {
        type: '2d',
        axis: {
            keyAxis: {
                domain: {
                    start: -1,
                    end: -1
                },
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
                    horizontal: true,
                    vertical: false
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
                    dataSource: 'dataSet_large',
                    keyField:  {
                        name: 'brand',
                        format: 'string'
                    },
                    valueField: {
                        name: 'price',
                        format: 'integer'
                    }
                },
                tooltip: {
                    data: {
                        fields: [
                            {
                                name: 'brand',
                                format: 'string'
                            },
                            {
                                name: 'price',
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
                    dataSource: 'dataSet_large2',
                    keyField:  {
                        name: 'brand',
                        format: 'string'
                    },
                    valueField: {
                        name: 'price',
                        format: 'integer'
                    }
                },
                tooltip: {
                    data: {
                        fields: [
                            {
                                name: 'brand',
                                format: 'string'
                            },
                            {
                                name: 'price',
                                format: 'money'
                            }

                        ]
                    }
                },
                orientation: 'vertical'
            }
        ]
    }
    // options: {
    //     type: 'polar',
    //     charts: [
    //         {
    //             type: 'donut',
    //             title: 'Car prices',
    //             legend: {
    //                 position: 'bottom'
    //             },
    //             data: {
    //                 dataSource: 'dataSet_date',
    //                 keyField:  {
    //                     name: 'brand',
    //                     format: 'date'
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
    //                             format: 'date'
    //                         },
    //                         {
    //                             name: 'price',
    //                             format: 'money'
    //                         }

    //                     ]
    //                 }
    //             },
    //             appearanceOptions: {
    //                 innerRadius: 10,
    //                 padAngle: 0.005
    //             }
    //         }
    //     ]
    // }
}

export default config;