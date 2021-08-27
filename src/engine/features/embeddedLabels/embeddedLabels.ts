import { BaseType, select, Selection } from 'd3-selection';
import { MdtChartsDataRow, Size } from '../../../config/config';
import { BlockMargin, EmbeddedLabelTypeModel, Field, Orient } from "../../../model/model";
import { Block } from "../../block/block";
import { DomHelper } from '../../helpers/domHelper';
import { Helper } from '../../helpers/helper';
import { BarAttrsHelper } from '../../twoDimensionalNotation/bar/barHelper';
import { ValueFormatter } from "../../valueFormatter";
import { EmbeddedLabelsDomHelper } from './embeddedLabelsDomHelper';
import { BarAttrs, EmbeddedLabelsHelper, LabelAttrs } from "./embeddedLabelsHelper";

export class EmbeddedLabels {
    public static embeddedLabelsGroupClass: string = 'embedded-labels-group';
    public static embeddedLabelClass: string = 'embedded-label';

    private static embeddedLabelBgClass: string = 'embedded-label-bg';
    private static innerLabelColor = '#FFFFFF';
    private static outerLabelColor = '#000000';

    public static render(block: Block, bars: Selection<SVGRectElement, MdtChartsDataRow, SVGGElement, any>, barAttrsHelper: BarAttrsHelper, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin, index: number, cssClasses: string[]): void {
        const labelsGroup = this.renderGroup(block, Helper.getCssClassesWithElementIndex(cssClasses, index));
        DomHelper.setCssClasses(labelsGroup, Helper.getCssClassesWithElementIndex(cssClasses, index));

        bars.each(dataRow => {
            this.renderLabel(labelsGroup, barAttrsHelper, dataRow, field, type, keyAxisOrient, blockSize, margin);
        });
    }

    public static restoreRemoved(block: Block, bars: Selection<SVGRectElement, MdtChartsDataRow, SVGGElement, any>, barAttrsHelper: BarAttrsHelper, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin, index: number, cssClasses: string[], keyFieldName: string): void {
        const untaggedBars = bars.filter(d => {
            return block.getChartBlock()
                .selectAll<SVGGElement, unknown>(`.${EmbeddedLabels.embeddedLabelsGroupClass}${Helper.getCssClassesLine(cssClasses)}.chart-element-${index}`)
                .selectAll<SVGTextElement, MdtChartsDataRow>(`.${this.embeddedLabelClass}`)
                .filter(row => row[keyFieldName] === d[keyFieldName])
                .empty()
        });

        if (!untaggedBars.empty()) {
            this.render(block, untaggedBars, barAttrsHelper, field, type, keyAxisOrient, blockSize, margin, index, cssClasses);
        }
    }

    public static removeUnused(block: Block, chartCssClasses: string[], fieldIndex: number, indexes: number[]): void {
        block.getChartBlock()
            .selectAll<SVGGElement, unknown>(`.${EmbeddedLabels.embeddedLabelsGroupClass}${Helper.getCssClassesLine(chartCssClasses)}.chart-element-${fieldIndex}`)
            .selectAll<SVGTextElement, MdtChartsDataRow>(`.${this.embeddedLabelClass}`)
            .filter((d, i) => indexes.findIndex(ind => ind === i) !== -1)
            .remove();
    }

    public static update(block: Block, bars: Selection<SVGRectElement, MdtChartsDataRow, SVGGElement, unknown>, keyAxisOrient: Orient, barAttrsHelper: BarAttrsHelper, margin: BlockMargin, valueField: Field, type: EmbeddedLabelTypeModel, blockSize: Size, newData: MdtChartsDataRow[], index: number, cssClasses: string[]) {
        const labelsGroup = block.getChartBlock()
            .selectAll<SVGGElement, unknown>(`.${EmbeddedLabels.embeddedLabelsGroupClass}${Helper.getCssClassesLine(cssClasses)}.chart-element-${index}`);

        labelsGroup.selectAll<SVGRectElement, MdtChartsDataRow>(`.${this.embeddedLabelBgClass}`)
            .remove();

        const labelsSelection = labelsGroup
            .selectAll<SVGTextElement, MdtChartsDataRow>(`.${this.embeddedLabelClass}`)
            .data(newData);

        bars.each((dataRow, barIndex) => {
            const labelBlock = this.getLabelByIndex(labelsSelection, barIndex, valueField, dataRow);
            if (labelBlock)
                this.updateLabel(block, dataRow, keyAxisOrient, barAttrsHelper, margin, type, blockSize, labelBlock, labelsGroup);
        });
    }

    public static raiseGroups(block: Block): void {
        block.getChartBlock().selectAll(`.${this.embeddedLabelsGroupClass}`).raise();
    }

    private static renderLabel(labelsGroup: Selection<SVGGElement, unknown, HTMLElement, unknown>, barAttrsHelper: BarAttrsHelper, dataRow: MdtChartsDataRow, field: Field, type: EmbeddedLabelTypeModel, keyAxisOrient: Orient, blockSize: Size, margin: BlockMargin): void {
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
            attrs.x = this.checkLabelToResetTextAnchor(attrs.x, labelBlock.node().getBBox().width, margin, blockSize, keyAxisOrient);
            this.renderBackground(labelsGroup, labelBlock, attrs);
        }

        EmbeddedLabelsDomHelper.setLabelBlockAttrs(attrs, labelBlock);

        if (position === 'inside')
            labelBlock.style('fill', this.innerLabelColor);

        EmbeddedLabelsDomHelper.cropText(labelBlock, barAttrs, position, labelUnserveFlag, margin, blockSize);
    }

    private static updateLabel(block: Block, dataRow: MdtChartsDataRow, keyAxisOrient: Orient, barAttrsHelper: BarAttrsHelper, margin: BlockMargin, type: EmbeddedLabelTypeModel, blockSize: Size, labelBlock: Selection<SVGTextElement, MdtChartsDataRow, HTMLElement, unknown>, labelsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>): void {
        const barAttrs: BarAttrs = {
            x: barAttrsHelper.x(dataRow),
            width: barAttrsHelper.width(dataRow),
            y: barAttrsHelper.y(dataRow),
            height: barAttrsHelper.height(dataRow)
        }

        const labelUnserveFlag = EmbeddedLabelsHelper.getLabelUnserveFlag(barAttrs.height); // if bar is too small to serve label inside. This flag is needed for set outside postion and change text anchor if bar wide as whole chart block
        const position = EmbeddedLabelsHelper.getLabelPosition(barAttrs, labelBlock.node().getBBox().width, margin, blockSize, labelUnserveFlag);
        const attrs = EmbeddedLabelsHelper.getLabelAttrs(barAttrs, type, position, keyAxisOrient, labelBlock.node().getBBox().width);

        EmbeddedLabelsDomHelper.cropText(labelBlock, barAttrs, position, labelUnserveFlag, margin, blockSize);

        if (position === 'outside') {
            attrs.x = this.checkLabelToResetTextAnchor(attrs.x, labelBlock.node().getBBox().width, margin, blockSize, keyAxisOrient);
            labelBlock.style('fill', this.outerLabelColor);
        }

        EmbeddedLabelsDomHelper.setLabelBlockAttrs(attrs, labelBlock, block.transitionManager.durations.chartUpdate)
            .then(() => {
                if (position === 'outside')
                    this.renderBackground(labelsGroup, labelBlock, attrs);

                if (position === 'inside')
                    labelBlock.style('fill', this.innerLabelColor);
            });
    }

    private static checkLabelToResetTextAnchor(x: number, width: number, margin: BlockMargin, blockSize: Size, keyAxisOrient: Orient): number {
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

    private static renderBackground(labelsGroup: Selection<SVGGElement, unknown, BaseType, unknown>, labelBlock: Selection<SVGTextElement, MdtChartsDataRow, HTMLElement, unknown>, attrs: LabelAttrs): void {
        labelsGroup.append('rect')
            .attr('class', this.embeddedLabelBgClass)
            .attr('x', attrs.x)
            .attr('y', attrs.y - labelBlock.node().getBBox().height / 2)
            .attr('width', labelBlock.node().getBBox().width)
            .attr('height', labelBlock.node().getBBox().height)
            .style('fill', 'rgba(255, 255, 255, 0.8)')
            .lower();
    }



    private static getLabelByIndex(labelsSelection: Selection<SVGTextElement, MdtChartsDataRow, SVGGElement, unknown>, barIndex: number, valueField: Field, dataRow: MdtChartsDataRow): Selection<SVGTextElement, MdtChartsDataRow, HTMLElement, unknown> {
        let labelBlock: Selection<SVGTextElement, MdtChartsDataRow, HTMLElement, unknown>;

        labelsSelection.each(function (d, indexLabel) {
            if (barIndex === indexLabel) {
                labelBlock = select(this)
                    .datum(dataRow)
                    .text(ValueFormatter.formatField(valueField.format, d[valueField.name]));
            }
        });

        return labelBlock;
    }
}