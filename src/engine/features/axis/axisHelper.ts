import { axisTop, axisBottom, axisLeft, axisRight, AxisScale, Axis as IAxis } from 'd3-axis';
import { Orient } from "../../../model/model";
import { max, min } from 'd3-array';

const MINIMAL_STEP_SIZE = 40;
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


    public static setStepSize(axis: IAxis<any>, scaleDomain: any[], range: number[]): void {
        const axisLength = range[1] - range[0];
        if (axisLength / 10 < MINIMAL_STEP_SIZE) {
            if (Math.floor(axisLength / MINIMAL_STEP_SIZE) > 2)
                axis.ticks(Math.floor(axisLength / MINIMAL_STEP_SIZE));
            else
                axis.tickValues([min(scaleDomain), max(scaleDomain)]);
        }
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