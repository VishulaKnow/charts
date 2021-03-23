import { Selection, BaseType, select } from 'd3-selection';
import { Transition } from 'd3-transition';
import { Axis as IAxis } from 'd3-axis';
import { AxisLabelPosition, TranslateModel } from '../../../model/model';
export class AxisDomHelper {
    public static updateAxisElement(axisGenerator: IAxis<any>, axisElement: Selection<SVGGElement, any, BaseType, any>, translate: TranslateModel, transitionDuration: number = 0): Promise<string> {
        return new Promise(resolve => {
            let axisHandler: Selection<SVGGElement, any, BaseType, any> | Transition<SVGGElement, any, BaseType, any> = axisElement;
            if (transitionDuration > 0) {
                axisHandler = axisHandler
                    .interrupt()
                    .transition()
                    .duration(transitionDuration)
                    .on('end', () => resolve('updated'));
            }
            axisHandler.attr('transform', `translate(${translate.translateX}, ${translate.translateY})`)
                .call(axisGenerator.bind(this));

            if (transitionDuration <= 0)
                resolve('updated');
        });
    }

    public static rotateElementsBack(axisElement: Selection<SVGGElement, unknown, HTMLElement, any>, labelPostion: AxisLabelPosition): void {
        if (labelPostion === 'straight') {
            axisElement.selectAll('.tick text')
                .attr('transform', null)
                .attr('text-anchor', 'middle')
                .attr('x', null);
        }
    }
}