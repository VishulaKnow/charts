import { AxisScale } from 'd3-axis';
import { BaseType, select, Selection } from 'd3-selection';
import { Transition } from 'd3-transition';
import { BlockMargin, DataRow, EmbeddedLabelTypeModel, Field, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { BarAttrsHelper, BarHelper } from '../../twoDimensionalNotation/bar/barHelper';
import { ValueFormatter } from "../../valueFormatter";
import { BarAttrs, EmbeddedLabelPosition, EmbeddedLabelsHelper, LabelAttrs } from "./embeddedLabelsHelper";

export class EmbeddedLabels {
    static fillGroupedBarAndLablesAttrsWithTranisiton(block: Block, bars: Selection<SVGRectElement, DataRow, SVGGElement, unknown>, labels: Selection<SVGTextElement, DataRow, SVGGElement, unknown>, axisOrient: Orient, scaleValue: AxisScale<any>, margin: BlockMargin, valueField: string, type: EmbeddedLabelTypeModel, blockSize: Size, newData: DataRow[], transitionDuration: number, cssClasses: string[]) {
        const BarAttrsHelper: BarAttrsHelper = {
            x: null,
            y: null,
            width: null,
            height: null
        }
        BarHelper.setGroupedBarAttrsByValueAxis(BarAttrsHelper, axisOrient, margin, scaleValue, valueField, blockSize);
        let barsTran: Selection<SVGRectElement, DataRow, BaseType, unknown> | Transition<SVGRectElement, DataRow, BaseType, unknown> = bars;
        let labelsTran: Selection<SVGTextElement, DataRow, BaseType, unknown> | Transition<SVGTextElement, DataRow, BaseType, unknown> = labels;
        if (transitionDuration > 0)
        {
            barsTran = bars
                .data(newData)
                .interrupt()
                .transition()
                .duration(transitionDuration);
            labelsTran = labels
                .data(newData)
                .interrupt()
                .transition()
                .duration(transitionDuration);
        }
        barsTran.each(function(d, indexBar, g) {
            let curretLabel: Selection<SVGTextElement, DataRow, BaseType, unknown> | Transition<SVGTextElement, DataRow, BaseType, unknown> = null
            labelsTran.each(function(d, indexLabel, g) {
                if(indexBar === indexLabel) {
                    curretLabel = select(this)
                }
            })
            curretLabel.transition().duration(transitionDuration)
            const barAttrs: BarAttrs = {
            x: BarAttrsHelper.x == null? Helper.getSelectionNumericAttr(select(this), 'x') : BarAttrsHelper.x(d),
            y: BarAttrsHelper.y == null? Helper.getSelectionNumericAttr(select(this), 'y') : BarAttrsHelper.y(d),
            width: BarAttrsHelper.width == null? Helper.getSelectionNumericAttr(select(this), 'width') : BarAttrsHelper.width(d),
            height: BarAttrsHelper.height == null? Helper.getSelectionNumericAttr(select(this), 'height') : BarAttrsHelper.height(d)
            }
            const labelUnserveFlag = EmbeddedLabelsHelper.getLabelUnserveFlag(barAttrs.height); // if bar is too small to serve label inside. This flag is needed for set outside postion and change text anchor if bar wide as whole chart block
            const position = EmbeddedLabelsHelper.getLabelPosition(barAttrs, curretLabel.node().getBBox().width, margin, blockSize, labelUnserveFlag);
            const attrs = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, type, position, axisOrient);
            curretLabel.style('fill', 'rgba(0, 0, 0)')
            if (axisOrient === 'top' || axisOrient === 'bottom')
                select(this).transition().duration(transitionDuration)
                    .attr('y', barAttrs.y)
                    .attr('height', barAttrs.height);
            else if (axisOrient === 'left' || axisOrient === 'right')
                select(this).transition().duration(transitionDuration)
                    .attr('x', barAttrs.x)
                    .attr('width', barAttrs.width);
            curretLabel.transition().duration(transitionDuration)
                .attr('x', attrs.x)
                .attr('y', attrs.y)
                .attr('text-anchor', attrs.textAnchor)
                .attr('dominant-baseline', 'middle');
            if (position === 'outside') {
                labels.append('rect')
                    .attr('class', 'outside-embedded-label-bg')
                    .attr('x', attrs.x) 
                    .attr('y', attrs.y - curretLabel.node().getBBox().height / 2)
                    .attr('width', curretLabel.node().getBBox().width)
                    .attr('height', curretLabel.node().getBBox().height)
                    .style('fill', 'rgba(255, 255, 255, 0.8)')
                    .lower();
                }
            
            if(position === 'inside'){
                curretLabel.style('fill', 'rgba(255, 255, 255, 0.8)')
            }
            // if (position === 'inside')
            //     curretLabel.style('fill', '#FFFFFF');
            if (labelUnserveFlag)
                EmbeddedLabels.checkLabelsToResetTextAnchor(curretLabel, margin, blockSize, axisOrient);  
            // EmbeddedLabels.cropText(labelsTran, barAttrs, position, labelUnserveFlag, margin, blockSize);
        })
    }
    public static readonly EmbeddedLabelsGroupClass: string = 'embedded-labels-group'
    public static readonly EmbeddedLabelRectClass: string = 'outside-embedded-label-bg'
    public static readonly EmbeddedLabelClass: string = 'embedded-label'
    public static render(block: Block, bars: Selection<SVGRectElement, DataRow, SVGGElement, any>, dataRow: DataRow[], field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin, index: number, cssClasses: string[]): void {
        const thisClass = this;

        const labelsGroup = this.renderGroup(block, dataRow)
        bars.each(function (d) {
            thisClass.renderOneLabel(labelsGroup, select(this), d, field, type, keyAxisOrient, blockSize, margin, index, cssClasses);
            
        });     
    }

    private static renderOneLabel(labelsGroup: Selection<SVGGElement, unknown, HTMLElement, unknown>, bar: Selection<SVGRectElement, DataRow, HTMLElement, any>, dataRow: DataRow, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin, index: number, cssClasses: string[]): void {
        const labelBlock = labelsGroup.append('text').datum(dataRow)    
        labelBlock
            .classed(EmbeddedLabels.EmbeddedLabelClass, true)
            .style('pointer-events', 'none')
            .text(ValueFormatter.formatField(field.format, dataRow[field.name]))
            
        const barAttrs: BarAttrs = {
            x: Helper.getSelectionNumericAttr(bar, 'x'),
            y: Helper.getSelectionNumericAttr(bar, 'y'),
            width: Helper.getSelectionNumericAttr(bar, 'width'),
            height: Helper.getSelectionNumericAttr(bar, 'height')
        }
        Helper.setCssClasses(labelBlock, Helper.getCssClassesWithElementIndex(cssClasses, index));

        const labelUnserveFlag = EmbeddedLabelsHelper.getLabelUnserveFlag(barAttrs.height); // if bar is too small to serve label inside. This flag is needed for set outside postion and change text anchor if bar wide as whole chart block

        const position = EmbeddedLabelsHelper.getLabelPosition(barAttrs, labelBlock.node().getBBox().width, margin, blockSize, labelUnserveFlag);

        const attrs = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, type, position, keyAxisOrient);

        if (position === 'outside') {
            labelsGroup.append('rect')
                .attr('class', 'outside-embedded-label-bg')
                .attr('x', attrs.x)
                .attr('y', attrs.y - labelBlock.node().getBBox().height / 2)
                .attr('width', labelBlock.node().getBBox().width)
                .attr('height', labelBlock.node().getBBox().height)
                .style('fill', 'rgba(255, 255, 255, 0.8)')
                .lower();
        }

        labelBlock
            .attr('x', attrs.x)
            .attr('y', attrs.y)
            .attr('text-anchor', attrs.textAnchor)
            .attr('dominant-baseline', 'middle');

        if (position === 'inside')
            labelBlock.style('fill', '#FFFFFF');

        if (labelUnserveFlag)
            this.checkLabelsToResetTextAnchor(labelBlock, margin, blockSize, keyAxisOrient);

        this.cropText(labelBlock, barAttrs, position, labelUnserveFlag, margin, blockSize);
    }

    private static checkLabelsToResetTextAnchor(labelBlock: Selection<SVGTextElement, DataRow, BaseType, unknown> | Transition<SVGTextElement, DataRow, BaseType, unknown>, margin: BlockMargin, blockSize: Size, keyAxisOrient: Orient): void {
        if (keyAxisOrient === 'left') {
            labelBlock.node().getBBox().x
            if (labelBlock.node().getBBox().x + labelBlock.node().getBBox().width > blockSize.width - margin.right) {
                labelBlock.attr('x', blockSize.width - margin.right);
                labelBlock.attr('text-anchor', 'end');
            }
        } else if (keyAxisOrient === 'right') {
            if (labelBlock.node().getBBox().x - labelBlock.node().getBBox().width < margin.left) {
                labelBlock.attr('x', margin.left);
                labelBlock.attr('text-anchor', 'left');
            }
        }
    }

    private static cropText(labelBlock: Selection<SVGTextElement, unknown, HTMLElement, unknown> | Transition<SVGTextElement, unknown, HTMLElement, unknown>, barAttrs: BarAttrs, position: EmbeddedLabelPosition, labelUnserveFlag: boolean, margin: BlockMargin, blockSize: Size): void {
        let labelTextSpace: number;

        if (labelUnserveFlag)
            labelTextSpace = blockSize.width - margin.left - margin.right;
        else
            labelTextSpace = EmbeddedLabelsHelper.getSpaceSizeForType(position, barAttrs.width, margin, blockSize);

        // Helper.cropLabels(labelBlock, labelTextSpace);
    }

    private static renderGroup(block: Block, dataRow: DataRow[]): Selection<SVGGElement, unknown, HTMLElement, unknown> {
        return block.getChartBlock()
            .append('g')
            .attr('class', EmbeddedLabels.EmbeddedLabelsGroupClass);
    }
}