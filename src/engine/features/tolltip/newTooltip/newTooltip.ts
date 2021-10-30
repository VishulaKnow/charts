import { Selection } from 'd3-selection';

export class NewTooltip {
    static tooltipBlockClass = 'tooltip-block';

    private elSelection: Selection<HTMLElement, unknown, HTMLElement, any>;

    getEl() {
        return this.elSelection;
    }

    findInWrapper(wrapper: Selection<HTMLElement, unknown, HTMLElement, any>) {
        this.elSelection = wrapper.select<HTMLElement>(`.${NewTooltip.tooltipBlockClass}`);
        return this.elSelection;
    }

    render(wrapper: Selection<HTMLElement, unknown, HTMLElement, any>) {
        this.elSelection = wrapper
            .append('div')
            .attr('class', NewTooltip.tooltipBlockClass);
        return this.elSelection;
    }

    appendContent(content: HTMLElement) {
        this.elSelection.node().appendChild(content);
    }
}