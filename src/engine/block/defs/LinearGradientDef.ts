import { Selection } from "d3-selection";
import { GradientDef } from "../../../model/model";

export class LinearGradientDef {
    render(defs: Selection<SVGDefsElement, unknown, HTMLElement, any>, gradients: GradientDef[]) {
        gradients.forEach(gradient => {
            const linearGradient = defs.append("linearGradient")
                .attr("id", gradient.id)
                .attr("x1", gradient.position.x1)
                .attr("y1", gradient.position.y1)
                .attr("x2", gradient.position.x2)
                .attr("y2", gradient.position.y2);

            gradient.items.forEach(item => {
                linearGradient.append("stop")
                    .attr("id", item.id)
                    .attr("offset", item.offset)
                    .attr("stop-opacity", item.opacity)
                    .attr("stop-color", item.color);
            });
        });
    }
}