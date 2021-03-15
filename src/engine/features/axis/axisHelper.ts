import { select, Selection, BaseType } from 'd3-selection';
import { axisTop, axisBottom, axisLeft, axisRight, AxisScale, Axis as IAxis } from 'd3-axis';
import { Orient } from "../../../model/model";

export class AxisHelper {
    public static getAxisByOrient(orient: Orient, scale: AxisScale<any>): IAxis<any> {
        if (orient === 'top')
            return axisTop(scale);
        if (orient === 'bottom')
            return axisBottom(scale);
        if (orient === 'left')
            return axisLeft(scale);
        if (orient === 'right')
            return axisRight(scale);
    }

    public static wrapHandler(textBlocks: Selection<SVGGElement, unknown, BaseType, any>, maxWidth: number) {
        textBlocks.each(function () {
            let textBlock = select(this);
            if (textBlock.node().getBBox().width > maxWidth) {
                let letters = textBlock.text().split('').reverse(), // split text to letters.
                    letter,
                    line: string[] = [], // one line. letters from this var into tpsans.
                    lineNumber = 0,
                    y = textBlock.attr("y"),
                    dy = 1.4,
                    tspan = textBlock.text(null).append("tspan").attr("dy", dy + "em");

                while (letter = letters.pop()) {
                    line.push(letter);
                    tspan.text(line.join(''));
                    if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1 && letters.length > 0) {
                        line.pop();
                        tspan.text(line.join(''));
                        if (lineNumber === 0 && line[line.length - 1] !== ' ')
                            tspan.text(tspan.text() + '-');
                        line = [letter];
                        if (lineNumber >= 1) { // If text block has 2 lines, text cropped.
                            if (letters.length > 0)
                                tspan.text(tspan.text().substr(0, tspan.text().length - 1) + '...')
                            break;
                        }
                        tspan = textBlock.append("tspan").attr("dy", dy * lineNumber + 1 + "em").text(letter);
                        lineNumber++;
                    }
                }

                if (textBlock.selectAll('tspan').size() === 1)
                    textBlock.text(tspan.text()).attr('y', null);

                if (!textBlock.selectAll('tspan').empty())
                    textBlock.attr('y', -(textBlock.node().getBBox().height / 2 + 4.8));
            }
        });
    }

    private static getRecalcedTickValuesWithLastValue(minValue: number, maxValue: number, countValues: number): number[] {
        let valuesArray = [];
        let step = 1;
        let numbers = [1, 2, 5];
        let numberIndex = 0;

        // В случае если количество интервалов полученных при разбиении отрезка от 0 до максимального значения
        // будет меньше или равно количеству возможных для отрисовки интервалов поиск подходящего шага завершится
        while ((maxValue / step) > countValues) {
            step = numbers[(numberIndex % numbers.length)]; // получение числа 1, 2 или 5 по очередно с каждым проходом цикла
            step = step * Math.pow(10, Math.floor(numberIndex / numbers.length)); // произведение шага на 10-ки 
            numberIndex++;
        }

        valuesArray.push(minValue);
        let currentValue = 0;

        // Если цикл дошел до предпоследнего элемента, цикл завершается
        while (currentValue + step * 2 < maxValue) {
            currentValue += step;
            valuesArray.push(currentValue);
        }
        currentValue += step; // получение значения предпоследнего элемента
        if (maxValue - currentValue > step / 3) // Если расстояние между последним и предпоследним больше, чем 1/3 шага
            valuesArray.push(currentValue);

        valuesArray.push(maxValue);
        valuesArray = valuesArray.reverse(); // Reverse массива для корректного отображения гридов
        return valuesArray;
    }
}