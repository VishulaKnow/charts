import { interrupt } from "d3-transition";
import { Block } from "./block/block";
import { Axis } from "./features/axis/axis";
import { EmbeddedLabels } from "./features/embeddedLabels/embeddedLabels";
import { MarkDot } from "./features/markDots/markDot";
import { Tooltip } from "./features/tolltip/tooltip";
import { Donut } from "./polarNotation/donut";
import { Area } from "./twoDimensionalNotation/area/area";
import { Bar } from "./twoDimensionalNotation/bar/bar";
import { Line } from "./twoDimensionalNotation/line/line";

export class TransitionManager {
    /**
     * Анимация обновления в ms.
     */
    public updateChartsDuration = 1000;
    public twoDimensionalTooltipDuration = 75;
    public donutArcHoverDuration = 200;
    public markerHoverDuration = 50;

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
        Donut.arcPathClass,
        EmbeddedLabels.embeddedLabelClass
    ];

    constructor(block: Block) {
        this.block = block;
    }

    public interruptTransitions(): void {
        this.transitionableElemClasses.forEach(elemClass => {
            const elementsSelection = this.block
                .getSvg()
                .selectAll(`.${elemClass}`);

            elementsSelection.nodes().forEach(node => interrupt(node));
        });
    }
}