import { Config } from './config';

const configCars: Config = {
    canvas: {
        class: 'outline svg-chart',
        size: {
            width: 960,
            height: 567
        }
    },
    options: {
        type: '2d',
        isSegmented: false,
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
            position: 'top'
        },
        orientation: 'horizontal',
        charts: [
            {
                title: 'Рост стоимости',
                type: 'bar',
                data: {
                    dataSource: 'dataSet',
                    keyField:  {
                        name: 'brand',
                        format: 'string'
                    },
                    valueField: [
                        {
                            name: 'price',
                            format: 'money',
                            title: 'Цены на автомобили по рынку длинное Цены на автомобили по рынку'
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
                embeddedLabels: 'none'
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
    //                 dataSource: 'dataSet',
    //                 keyField:  {
    //                     name: 'brand',
    //                     format: 'string'
    //                 },
    //                 valueField: {
    //                     name: 'price',
    //                     format: 'money'
    //                 },
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

export default configCars;