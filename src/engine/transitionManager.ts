import { interrupt } from "d3-transition";
import { Transitions } from "../designer/designerConfig";
import { Block } from "./block/block";
import { Axis } from "./features/axis/axis";
import { EmbeddedLabels } from "./features/embeddedLabels/embeddedLabels";
import { Legend } from "./features/legend/legend";
import { MarkDot } from "./features/markDots/markDot";
import { Tooltip } from "./features/tolltip/tooltip";
import { Aggregator } from "./polarNotation/aggregator";
import { Donut } from "./polarNotation/donut/donut";
import { Area } from "./twoDimensionalNotation/area/area";
import { Bar } from "./twoDimensionalNotation/bar/bar";
import { Line } from "./twoDimensionalNotation/line/line";

export class TransitionManager {
    /**
     * Анимации обновления в ms.
     */
    public durations = {
        chartUpdate: 1000,
        tooltipSlide: 75,
        donutHover: 200,
        markerHover: 50,
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
        Aggregator.aggregatorValueClass,
        Legend.legendBlockClass
    ];

    constructor(block: Block, transitionsDurations: Transitions = null) {
        this.block = block;
        if (transitionsDurations)
            this.setDurations(transitionsDurations);
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

    private setDurations(durations: Transitions): void {
        if (durations.chartUpdate && durations.chartUpdate > 0) this.durations.chartUpdate = durations.chartUpdate;
        if (durations.donutHover && durations.donutHover > 0) this.durations.donutHover = durations.donutHover;
        if (durations.elementFadeOut && durations.elementFadeOut > 0) this.durations.elementFadeOut = durations.elementFadeOut;
        if (durations.markerHover && durations.markerHover > 0) this.durations.markerHover = durations.markerHover;
        if (durations.tooltipSlide && durations.tooltipSlide > 0) this.durations.tooltipSlide = durations.tooltipSlide;
    }
}