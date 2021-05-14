# Charts
**Demo**: https://vishulaknow.github.io/charts-demo/
## Установка
```
npm install mdt-charts
```
## Импорт
```js
import { Chart } from "mdt-charts"
```
## Импорт TypeScript интерфейсов
```ts
import { Config, DesignerConfig } from "mdt-charts"
```

## Использование

Для создания графика минимально требуется конфигуратор, конфигуратор дизайнера и данные.

```ts
const chart = new Chart(config, designerConfig, data);
```

### Конфигуратор

Пример настроек для построения простого барчарта:

```json
{
    "canvas": {
        "class": "svg-chart outline",
        "size": {
            "width": 800,
            "height": 400
        }
    },
    "options": {
        "title": "Количество автомобилей",
        "type": "2d",
        "isSegmented": false,
        "axis": {
            "key": {
                "position": "end",
                "ticks": {
                    "flag": false
                },
                "visibility": true
            },
            "value": {
                "domain": {
                    "start": -1,
                    "end": -1
                },
                "position": "start",
                "ticks": {
                    "flag": false
                },
                "visibility": true
            }
        },
        "additionalElements": {
            "gridLine": {
                "flag": {
                    "value": true,
                    "key": true
                }
            }
        },
        "legend": {
            "show": true
        },
        "orientation": "vertical",
        "data": {
            "dataSource": "dataSet",
            "keyField": {
                "name": "brand",
                "format": "string"
            }
        },
        "selectable": true,
        "charts": [
            {
                "title": "Рост стоимости",
                "type": "bar",
                "data": {
                    "valueFields": [
                        {
                            "name": "price",
                            "format": "money",
                            "title": "Заголовок"
                        }
                    ]
                },
                "tooltip": {
                    "show": true
                },
                "markers": {
                    "show": true
                },
                "embeddedLabels": "key"
            }
        ]
    }
}
```

### Конфигуратор дизайнера

Пример рекомендованных значений для конфигуратора дизайнера:

```ts
const designerConfig: DesignerConfig = {
    canvas: {
        axisLabel: {
            maxSize: {
                main: 60
            }
        },
        chartBlockMargin: {
            top: 30,
            bottom: 20,
            left: 20,
            right: 20
        },
        legendBlock: {
            maxWidth: 200
        },
        chartOptions: {
            bar: {
                minBarWidth: 3,
                maxBarWidth: 30,
                groupMinDistance: 16,
                barDistance: 8,
                groupMaxDistance: 35
            },
            donut: {
                padAngle: 0,
                minThickness: 40,
                maxThickness: 60,
                aggregatorPad: 30
            }
        }
    },
    chartStyle: {
        baseColors: ['#209de3', '#ff3131', '#ffba00', '#20b078']
    },
    elementsOptions: {
        tooltip: {
            position: 'followCursor'
        }
    },
    dataFormat: {
        formatters: (value: any, options: { type?: string; title?: string; empty?: string; } = {}) => {
            var type = typeof value;
            if ((value === undefined || value === null || value === "") && type != "boolean" && options.type != "boolean")
                return value;
            if (type == "boolean" || options.type == "boolean") {
                return value.toString();
            }
            if (value instanceof Date) {
                return value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + value.getDate() + ' ' + value.getHours() + ':' + value.getMinutes()
            }
            if (options.type === "markdown") {
                return value.toString();
            }
            if ((options.type === "money" || options.type === "number")) {
                return Intl.NumberFormat('ru-Ru', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
            }
            return value;
        }
    }
}
```

## Для разработчиков

Для загрузки всех зависимостей использйте скрипт:

```
npm install
```


Для сборки плейграунда необходимо запустить скрипт:

```
npm run dev
```

Полученные файлы будут расположены в папке dist.
