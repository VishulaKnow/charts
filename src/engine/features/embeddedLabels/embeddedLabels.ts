import { AxisScale } from 'd3-axis';
import { BaseType, select, Selection } from 'd3-selection';
import { BlockMargin, DataRow, EmbeddedLabelTypeModel, Field, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { BarAttrsHelper, BarHelper } from '../../twoDimensionalNotation/bar/barHelper';
import { ValueFormatter } from "../../valueFormatter";
import { BarAttrs, EmbeddedLabelPosition, EmbeddedLabelsHelper, LabelAttrs } from "./embeddedLabelsHelper";

export class EmbeddedLabels {
    public static readonly embeddedLabelsGroupClass: string = 'embedded-labels-group';
    public static readonly embeddedLabelRectClass: string = 'embedded-label-bg';
    public static readonly embeddedLabelClass: string = 'embedded-label';

    private static innerLabelColor = '#FFFFFF';
    private static outerLabelColor = '#000000';

    public static render(block: Block, bars: Selection<SVGRectElement, DataRow, SVGGElement, any>, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin, index: number, cssClasses: string[]): void {
        const thisClass = this;

        const labelsGroup = this.renderGroup(block)
        Helper.setCssClasses(labelsGroup, Helper.getCssClassesWithElementIndex(cssClasses, index));
        bars.each(function (d) {
            thisClass.renderLabel(labelsGroup, select(this), d, field, type, keyAxisOrient, blockSize, margin);
        });
    }

    public static updateLabelsCoordinate(block: Block, bars: Selection<SVGRectElement, DataRow, SVGGElement, unknown>, keyAxisOrient: Orient, scaleValue: AxisScale<any>, margin: BlockMargin, valueField: Field, type: EmbeddedLabelTypeModel, blockSize: Size, newData: DataRow[], index: number, cssClasses: string[], transitionDuration: number) {
        const labelsGroup = block.getChartBlock()
            .selectAll<SVGGElement, unknown>(`.${EmbeddedLabels.embeddedLabelsGroupClass}${Helper.getCssClassesLine(cssClasses)}.chart-element-${index}`);

        labelsGroup.selectAll<SVGRectElement, DataRow>(`rect`)
            .remove();

        const barAttrsHelper: BarAttrsHelper = {
            x: null,
            y: null,
            width: null,
            height: null
        }
        BarHelper.setGroupedBarAttrsByValue(barAttrsHelper, keyAxisOrient, margin, scaleValue, valueField.name, blockSize);

        const labelsSelection = labelsGroup
            .selectAll<SVGTextElement, DataRow>(`.${this.embeddedLabelClass}`)
            .data(newData);

        const thisClass = this;

        bars.each(function (d, indexBar) {
            let labelBlock: Selection<SVGTextElement, DataRow, HTMLElement, unknown>;

            labelsSelection.each(function (d, indexLabel) {
                if (indexBar === indexLabel) {
                    labelBlock = select(this)
                        .text(ValueFormatter.formatField(valueField.format, d[valueField.name]));
                }
            });

            const barAttrs: BarAttrs = {
                x: barAttrsHelper.x(d),
                width: barAttrsHelper.width(d),
                y: Helper.getSelectionNumericAttr(select(this), 'y'),
                height: Helper.getSelectionNumericAttr(select(this), 'height')
            }

            const labelUnserveFlag = EmbeddedLabelsHelper.getLabelUnserveFlag(barAttrs.height); // if bar is too small to serve label inside. This flag is needed for set outside postion and change text anchor if bar wide as whole chart block
            const position = EmbeddedLabelsHelper.getLabelPosition(barAttrs, labelBlock.node().getBBox().width, margin, blockSize, labelUnserveFlag);
            const attrs = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, type, position, keyAxisOrient, labelBlock.node().getBBox().width);

            EmbeddedLabels.cropText(labelBlock, barAttrs, position, labelUnserveFlag, margin, blockSize);

            attrs.x = thisClass.checkLabelToResetTextAnchor(attrs.x, labelBlock.node().getBBox().width, margin, blockSize, keyAxisOrient, position);

            const transitionEndHandler = () => {
                if (position === 'outside')
                    thisClass.renderBackground(labelsGroup, labelBlock, attrs);

                if (position === 'inside')
                    labelBlock.style('fill', thisClass.innerLabelColor);
            }

            if (position === 'outside') {
                labelBlock.style('fill', thisClass.outerLabelColor);
            }

            if (transitionDuration > 0) {
                labelBlock
                    .interrupt()
                    .transition()
                    .duration(transitionDuration)
                    .on('end', transitionEndHandler)
                    .attr('x', attrs.x)
                    .attr('y', attrs.y)
                    .attr('dominant-baseline', 'middle');
            } else {
                labelBlock
                    .attr('x', attrs.x)
                    .attr('y', attrs.y)
                    .attr('dominant-baseline', 'middle');
            }
        })
    }

    private static renderLabel(labelsGroup: Selection<SVGGElement, unknown, HTMLElement, unknown>, bar: Selection<SVGRectElement, DataRow, HTMLElement, any>, dataRow: DataRow, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin): void {
        const labelBlock = labelsGroup.append('text').datum(dataRow);

        labelBlock
            .classed(EmbeddedLabels.embeddedLabelClass, true)
            .style('pointer-events', 'none')
            .text(ValueFormatter.formatField(field.format, dataRow[field.name]));

        const barAttrs: BarAttrs = {
            x: Helper.getSelectionNumericAttr(bar, 'x'),
            y: Helper.getSelectionNumericAttr(bar, 'y'),
            width: Helper.getSelectionNumericAttr(bar, 'width'),
            height: Helper.getSelectionNumericAttr(bar, 'height')
        }

        const labelUnserveFlag = EmbeddedLabelsHelper.getLabelUnserveFlag(barAttrs.height); // if bar is too small to serve label inside. This flag is needed for set outside postion and change text anchor if bar wide as whole chart block

        const position = EmbeddedLabelsHelper.getLabelPosition(barAttrs, labelBlock.node().getBBox().width, margin, blockSize, labelUnserveFlag);

        const attrs = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, type, position, keyAxisOrient, labelBlock.node().getBBox().width);

        attrs.x = this.checkLabelToResetTextAnchor(attrs.x, labelBlock.node().getBBox().width, margin, blockSize, keyAxisOrient, position);

        if (position === 'outside') {
            this.renderBackground(labelsGroup, labelBlock, attrs);
        }

        labelBlock
            .attr('x', attrs.x)
            .attr('y', attrs.y)
            .attr('dominant-baseline', 'middle');

        if (position === 'inside')
            labelBlock.style('fill', this.innerLabelColor);

        this.cropText(labelBlock, barAttrs, position, labelUnserveFlag, margin, blockSize);
    }

    private static checkLabelToResetTextAnchor(x: number, width: number, margin: BlockMargin, blockSize: Size, keyAxisOrient: Orient, position: EmbeddedLabelPosition): number {
        if (keyAxisOrient === 'left') {
            if (x + (position === 'inside' ? -width : width) > blockSize.width + margin.right - margin.left) {
                return blockSize.width - margin.right - width;
            }
            else {
                return x
            }
        } else if (keyAxisOrient === 'right') {
            if (x - width < margin.left) {
                return margin.left;
            }
            else {
                return x
            }
        }

    }

    private static cropText(labelBlock: Selection<SVGGraphicsElement, unknown, BaseType, unknown>, barAttrs: BarAttrs, position: EmbeddedLabelPosition, labelUnserveFlag: boolean, margin: BlockMargin, blockSize: Size): void {
        let labelTextSpace: number;

        if (labelUnserveFlag)
            labelTextSpace = blockSize.width - margin.left - margin.right;
        else
            labelTextSpace = EmbeddedLabelsHelper.getSpaceSizeForType(position, barAttrs.width, margin, blockSize);

        Helper.cropLabels(labelBlock, labelTextSpace);
    }

    private static renderGroup(block: Block): Selection<SVGGElement, unknown, HTMLElement, unknown> {
        return block.getChartBlock()
            .append('g')
            .attr('class', this.embeddedLabelsGroupClass);
    }

    private static renderBackground(labelsGroup: Selection<SVGGElement, unknown, BaseType, unknown>, labelBlock: Selection<SVGTextElement, DataRow, HTMLElement, unknown>, attrs: LabelAttrs): void {
        labelsGroup.append('rect')
            .attr('class', this.embeddedLabelRectClass)
            .attr('x', attrs.textAnchor === 'start' ? attrs.x : attrs.x - labelBlock.node().getBBox().width)
            .attr('y', attrs.y - labelBlock.node().getBBox().height / 2)
            .attr('width', labelBlock.node().getBBox().width)
            .attr('height', labelBlock.node().getBBox().height)
            .style('fill', 'rgba(255, 255, 255, 0.8)')
            .lower();
    }
}