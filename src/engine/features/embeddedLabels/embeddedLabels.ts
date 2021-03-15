import { BaseType, select, Selection } from 'd3-selection';
import { Transition } from 'd3-transition';
import { BlockMargin, DataRow, EmbeddedLabelTypeModel, Field, Orient, Size } from "../../../model/model";
import { Block } from "../../block/block";
import { Helper } from "../../helper";
import { BarAttrsHelper } from '../../twoDimensionalNotation/bar/barHelper';
import { ValueFormatter } from "../../valueFormatter";
import { BarAttrs, EmbeddedLabelPosition, EmbeddedLabelsHelper, LabelAttrs } from "./embeddedLabelsHelper";

export class EmbeddedLabels {
    public static embeddedLabelsGroupClass: string = 'embedded-labels-group';
    public static embeddedLabelClass: string = 'embedded-label';

    private static embeddedLabelBgClass: string = 'embedded-label-bg';
    private static innerLabelColor = '#FFFFFF';
    private static outerLabelColor = '#000000';

    public static render(block: Block, bars: Selection<SVGRectElement, DataRow, SVGGElement, any>, barAttrsHelper: BarAttrsHelper, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin, index: number, cssClasses: string[]): void {
        const labelsGroup = this.renderGroup(block, Helper.getCssClassesWithElementIndex(cssClasses, index));
        Helper.setCssClasses(labelsGroup, Helper.getCssClassesWithElementIndex(cssClasses, index));

        bars.each((dataRow) => {
            this.renderLabel(labelsGroup, barAttrsHelper, dataRow, field, type, keyAxisOrient, blockSize, margin);
        });
    }

    public static removeByIndexes(block: Block, chartCssClasses: string[], fieldIndex: number, indexesOfRemoved: number[]): void {
        block.getChartBlock()
            .selectAll<SVGGElement, unknown>(`.${EmbeddedLabels.embeddedLabelsGroupClass}${Helper.getCssClassesLine(chartCssClasses)}.chart-element-${fieldIndex}`)
            .selectAll<SVGTextElement, DataRow>(`.${this.embeddedLabelClass}`)
            .filter((d, i) => indexesOfRemoved.findIndex(ior => ior === i) !== -1)
            .remove();
    }

    public static update(block: Block, bars: Selection<SVGRectElement, DataRow, SVGGElement, unknown>, keyAxisOrient: Orient, barAttrsHelper: BarAttrsHelper, margin: BlockMargin, valueField: Field, type: EmbeddedLabelTypeModel, blockSize: Size, newData: DataRow[], index: number, cssClasses: string[]) {
        const labelsGroup = block.getChartBlock()
            .selectAll<SVGGElement, unknown>(`.${EmbeddedLabels.embeddedLabelsGroupClass}${Helper.getCssClassesLine(cssClasses)}.chart-element-${index}`);

        labelsGroup.selectAll<SVGRectElement, DataRow>(`.${this.embeddedLabelBgClass}`)
            .remove();

        const labelsSelection = labelsGroup
            .selectAll<SVGTextElement, DataRow>(`.${this.embeddedLabelClass}`)
            .data(newData);

        bars.each((dataRow, barIndex) => {
            const labelBlock = this.getLabelByIndex(labelsSelection, barIndex, valueField);
            if (labelBlock)
                this.updateLabel(block, dataRow, keyAxisOrient, barAttrsHelper, margin, type, blockSize, labelBlock, labelsGroup);
        });
    }

    public static raiseGroups(block: Block): void {
        block.getChartBlock().selectAll(`.${this.embeddedLabelsGroupClass}`).raise();
    }

    private static renderLabel(labelsGroup: Selection<SVGGElement, unknown, HTMLElement, unknown>, barAttrsHelper: BarAttrsHelper, dataRow: DataRow, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin): void {
        const labelBlock = labelsGroup.append('text').datum(dataRow);

        labelBlock
            .classed(EmbeddedLabels.embeddedLabelClass, true)
            .style('pointer-events', 'none')
            .text(ValueFormatter.formatField(field.format, dataRow[field.name]));

        const barAttrs: BarAttrs = {
            x: barAttrsHelper.x(dataRow),
            width: barAttrsHelper.width(dataRow),
            y: barAttrsHelper.y(dataRow),
            height: barAttrsHelper.height(dataRow)
        }

        const labelUnserveFlag = EmbeddedLabelsHelper.getLabelUnserveFlag(barAttrs.height); // if bar is too small to serve label inside. This flag is needed for set outside postion and change text anchor if bar wide as whole chart block
        const position = EmbeddedLabelsHelper.getLabelPosition(barAttrs, labelBlock.node().getBBox().width, margin, blockSize, labelUnserveFlag);
        const attrs = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, type, position, keyAxisOrient, labelBlock.node().getBBox().width);

        if (position === 'outside') {
            attrs.x = this.checkLabelToResetTextAnchor(attrs.x, labelBlock.node().getBBox().width, margin, blockSize, keyAxisOrient, position);
            this.renderBackground(labelsGroup, labelBlock, attrs);
        }

        this.setLabelBlockAttrs(attrs, labelBlock);

        if (position === 'inside')
            labelBlock.style('fill', this.innerLabelColor);

        this.cropText(labelBlock, barAttrs, position, labelUnserveFlag, margin, blockSize);
    }

    private static updateLabel(block: Block, dataRow: DataRow, keyAxisOrient: Orient, barAttrsHelper: BarAttrsHelper, margin: BlockMargin, type: EmbeddedLabelTypeModel, blockSize: Size, labelBlock: Selection<SVGTextElement, DataRow, HTMLElement, unknown>, labelsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>): void {
        const barAttrs: BarAttrs = {
            x: barAttrsHelper.x(dataRow),
            width: barAttrsHelper.width(dataRow),
            y: barAttrsHelper.y(dataRow),
            height: barAttrsHelper.height(dataRow)
        }

        const labelUnserveFlag = EmbeddedLabelsHelper.getLabelUnserveFlag(barAttrs.height); // if bar is too small to serve label inside. This flag is needed for set outside postion and change text anchor if bar wide as whole chart block
        const position = EmbeddedLabelsHelper.getLabelPosition(barAttrs, labelBlock.node().getBBox().width, margin, blockSize, labelUnserveFlag);
        const attrs = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, type, position, keyAxisOrient, labelBlock.node().getBBox().width);

        this.cropText(labelBlock, barAttrs, position, labelUnserveFlag, margin, blockSize);

        if (position === 'outside') {
            attrs.x = this.checkLabelToResetTextAnchor(attrs.x, labelBlock.node().getBBox().width, margin, blockSize, keyAxisOrient, position);
            labelBlock.style('fill', this.outerLabelColor);
        }

        const transitionEndHandler = () => {
            if (position === 'outside')
                this.renderBackground(labelsGroup, labelBlock, attrs);

            if (position === 'inside')
                labelBlock.style('fill', this.innerLabelColor);
        }

        this.setLabelBlockAttrs(attrs, labelBlock, block.transitionManager.durations.chartUpdate)
            .on('end', transitionEndHandler);
    }

    private static checkLabelToResetTextAnchor(x: number, width: number, margin: BlockMargin, blockSize: Size, keyAxisOrient: Orient, position: EmbeddedLabelPosition): number {
        if (keyAxisOrient === 'left') {
            if (x + width > blockSize.width - margin.right)
                return blockSize.width - margin.right - width;
            return x;
        }
        if (keyAxisOrient === 'right') {
            if (x < margin.left)
                return margin.left;
            return x;
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

    private static renderGroup(block: Block, cssClasses: string[]): Selection<SVGGElement, unknown, HTMLElement, unknown> {
        let group: Selection<SVGGElement, unknown, HTMLElement, unknown> = block.getChartBlock()
            .select<SVGGElement>(`.${this.embeddedLabelsGroupClass}${Helper.getCssClassesLine(cssClasses)}`)
            .raise();

        if (group.empty())
            group = block.getChartBlock()
                .append('g')
                .attr('class', this.embeddedLabelsGroupClass)
                .raise();

        return group;
    }

    private static renderBackground(labelsGroup: Selection<SVGGElement, unknown, BaseType, unknown>, labelBlock: Selection<SVGTextElement, DataRow, HTMLElement, unknown>, attrs: LabelAttrs): void {
        labelsGroup.append('rect')
            .attr('class', this.embeddedLabelBgClass)
            .attr('x', attrs.x)
            .attr('y', attrs.y - labelBlock.node().getBBox().height / 2)
            .attr('width', labelBlock.node().getBBox().width)
            .attr('height', labelBlock.node().getBBox().height)
            .style('fill', 'rgba(255, 255, 255, 0.8)')
            .lower();
    }

    private static setLabelBlockAttrs(attrs: LabelAttrs, labelBlock: Selection<SVGTextElement, DataRow, HTMLElement, unknown>, transitionDuration: number = 0): Selection<SVGTextElement, DataRow, HTMLElement, unknown> | Transition<SVGTextElement, DataRow, HTMLElement, unknown> {
        let labelBlockHandler: Selection<SVGTextElement, DataRow, HTMLElement, unknown> | Transition<SVGTextElement, DataRow, HTMLElement, unknown> = labelBlock;

        if (transitionDuration > 0) {
            labelBlockHandler = labelBlockHandler
                .interrupt()
                .transition()
                .duration(transitionDuration);
        }

        labelBlockHandler
            .attr('x', attrs.x)
            .attr('y', attrs.y)
            .attr('dominant-baseline', 'middle');

        return labelBlockHandler;
    }

    private static getLabelByIndex(labelsSelection: Selection<SVGTextElement, DataRow, SVGGElement, unknown>, barIndex: number, valueField: Field): Selection<SVGTextElement, DataRow, HTMLElement, unknown> {
        let labelBlock: Selection<SVGTextElement, DataRow, HTMLElement, unknown>;

        labelsSelection.each(function (d, indexLabel) {
            if (barIndex === indexLabel) {
                labelBlock = select(this)
                    .text(ValueFormatter.formatField(valueField.format, d[valueField.name]));
            }
        });

        return labelBlock;
    }
}