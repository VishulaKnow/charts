import { Selection, BaseType, select } from 'd3-selection';
import { Transition } from 'd3-transition';
import { AxisScale, Axis as IAxis } from 'd3-axis';
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
    public static rotateElementsBack(axisElement: Selection<SVGGElement, unknown, HTMLElement, any>, labelPostion: AxisLabelPosition): void{
        if (labelPostion === 'straight') {
            axisElement.selectAll('.tick text')
                .attr('transform', null)
                .attr('text-anchor', 'middle')
                .attr('x', null);
        }
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
}