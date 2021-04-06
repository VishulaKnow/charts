import { Config, DataRow } from './config';

const configCars: Config = {
    canvas: {
        class: 'outline',
        size: {
            width: 800,
            height: 510
        }
    },
    // options: {
    //     type: '2d',
    //     title: 'Заголовок графика',
    //     selectable: true,
    //     axis: {
    //         key: {
    //             visibility: true,
    //             position: 'end',
    //             ticks: {
    //                 flag: false
    //             }
    //         },
    //         value: {
    //             visibility: true,
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
    //         show: true
    //     },
    //     orientation: 'vertical',
    //     data: {
    //         dataSource: 'dataSet',
    //         keyField: {
    //             name: 'brand',
    //             format: 'string'
    //         }
    //     },
    //     charts: [
    //         {
    //             isSegmented: false,
    //             type: 'bar',
    //             data: {
    //                 valueFields: [
    //                     {
    //                         name: 'price',
    //                         format: 'money',
    //                         title: 'Стоимость за 2020 год'
    //                     },
    //                     {
    //                         name: 'count',
    //                         format: 'money',
    //                         title: 'Стоимость за 2021 год'
    //                     }
    //                 ]
    //             },
    //             tooltip: {
    //                 show: true
    //             },
    //             embeddedLabels: 'value',
    //             markers: {
    //                 show: true
    //             }
    //         }
    //     ]
    // }
    options: {
        type: 'polar',
        title: 'Title',
        selectable: true,
        legend: {
            show: true
        },
        data: {
            dataSource: 'dataSet',
            keyField: {
                name: 'brand',
                format: 'string'
            }
        },
        chart: {
            type: 'donut',
            data: {
                valueField: {
                    name: 'price',
                    format: 'money',
                    title: 'some title'
                }
            },
            tooltip: {
                show: true
            }
        },
        tooltip: {
            html: (row: DataRow) => {
                return `<div class="tooltip-group">
                            <div class="tooltip-text-item">
                                Текст: ${row.brand}
                            </div>
                        </div>
                        <div class="tooltip-group">
                            <div class="tooltip-text-item">
                                Значение: ${row.price}
                            </div>
                        </div>`
            }
        }
    }
}

export default configCars;