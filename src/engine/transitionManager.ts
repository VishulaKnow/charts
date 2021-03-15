import { interrupt } from "d3-transition";
import { Block } from "./block/block";
import { Axis } from "./features/axis/axis";
import { EmbeddedLabels } from "./features/embeddedLabels/embeddedLabels";
import { MarkDot } from "./features/markDots/markDot";
import { Tooltip } from "./features/tolltip/tooltip";
import { Aggregator } from "./polarNotation/aggregator";
import { Donut } from "./polarNotation/donut/donut";
import { Area } from "./twoDimensionalNotation/area/area";
import { Bar } from "./twoDimensionalNotation/bar/bar";
import { Line } from "./twoDimensionalNotation/line/line";

export class TransitionManager {
    /**
     * Анимация обновления в ms.
     */
    public durations = {
        updateChartsDuration: 1000,
        twoDimensionalTooltipDuration: 75,
        donutArcHoverDuration: 200,
        markerHoverDuration: 50,
        elementFadeOut: 400
    }

    private block: Block;
    /**
     * Классы "подвижных" элементов
     */
    private transitionableElemClasses: string[] = [
        Tooltip.tooltipBlockClass,
        Tooltip.tooltipLineClass,
        Axis.axesClass,
        Area.areaChartClass,
        Bar.barItemClass,
        Line.lineChartClass,
        MarkDot.markerDotClass,
        EmbeddedLabels.embeddedLabelClass,
        Donut.arcPathClass,
        Aggregator.aggregatorValueClass
    ];

    constructor(block: Block) {
        this.block = block;
    }

    public interruptTransitions(): void {
        this.transitionableElemClasses.forEach(elemClass => {
            const elementsSelection = this.block
                .getSvg()
                .selectAll(`.${elemClass}`)
                .interrupt();

            elementsSelection.nodes().forEach(node => interrupt(node));
        });
        this.block.getSvg().selectAll(`.${Axis.axesClass}`).selectAll('*').interrupt();
    }
}