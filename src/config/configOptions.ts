import { Config } from './config';

const configCars: Config = {
    canvas: {
        class: 'outline svg-chart',
        size: {
            width: 960,
            height: 510
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
    //                 dataSource: 'dataSet',
    //                 keyField:  {
    //                     name: 'brand',
    //                     format: 'string'
    //                 },
    //                 valueFields: [
    //                     {
    //                         name: 'price',
    //                         format: 'money',
    //                         title: 'Количество автомобилей на душу населения'
    //                     },
    //                     {
    //                         name: 'count',
    //                         format: 'integer',
    //                         title: 'Количество автомобилей на душу населения'
    //                     }             
    //                 ]
    //             },
    //             tooltip: {
    //                 show: true
    //             },
    //             embeddedLabels: 'key'
    //         }
    //     ]
    // }
    options: {
        type: 'polar',
        legend: {
            show: true
        },
        charts: [
            {
                title: 'Рост стоимости',
                type: 'donut',
                data: {
                    dataSource: 'dataSet',
                    keyField:  {
                        name: 'brand',
                        format: 'string'
                    },
                    valueField: {
                        name: 'price',
                        format: 'money'
                    }
                },
                tooltip: {
                    show: true
                },
            }
        ]
    }
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
            show: true
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
                    show: true
                },
            }
        ]
    }
}

export default configCars;